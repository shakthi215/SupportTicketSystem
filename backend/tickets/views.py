"""
API Views for Support Ticket System.

Implements all required endpoints:
- POST /api/tickets/ - Create ticket
- GET /api/tickets/ - List tickets with filters
- PATCH /api/tickets/<id>/ - Update ticket
- GET /api/tickets/stats/ - Aggregated statistics
- POST /api/tickets/classify/ - LLM classification
"""

import logging
from datetime import datetime, timedelta
from django.db.models import Count, Q, Avg
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Ticket
from .serializers import (
    TicketSerializer,
    TicketUpdateSerializer,
    ClassificationRequestSerializer,
    ClassificationResponseSerializer,
    TicketStatsSerializer,
)
from .llm_service import get_classifier

logger = logging.getLogger(__name__)


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing support tickets.
    
    Provides CRUD operations plus filtering, search, and statistics.
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    def get_serializer_class(self):
        """Use different serializer for partial updates."""
        if self.action == 'partial_update':
            return TicketUpdateSerializer
        return TicketSerializer
    
    def get_queryset(self):
        """
        Filter tickets based on query parameters.
        
        Supports:
        - ?category=billing
        - ?priority=high
        - ?status=open
        - ?search=database (searches title and description)
        
        All filters can be combined.
        """
        queryset = Ticket.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Search in title and description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        # Always return newest first
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """
        Create a new ticket.
        
        Returns 201 on success with the created ticket data.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        logger.info(f"Created ticket #{serializer.instance.id}: {serializer.instance.title}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partially update a ticket (PATCH).
        
        Commonly used to change status or override LLM suggestions.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        logger.info(f"Updated ticket #{instance.id}")
        
        # Return full ticket data
        return Response(TicketSerializer(instance).data)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def statistics(self, request):
        """
        GET /api/tickets/stats/
        
        Returns aggregated statistics using database-level operations.
        
        Response format:
        {
            "total_tickets": 124,
            "open_tickets": 67,
            "avg_tickets_per_day": 8.3,
            "priority_breakdown": {"low": 30, "medium": 52, "high": 31, "critical": 11},
            "category_breakdown": {"billing": 28, "technical": 55, "account": 22, "general": 19}
        }
        """
        # Total tickets count
        total_tickets = Ticket.objects.count()
        
        # Open tickets count
        open_tickets = Ticket.objects.filter(status=Ticket.STATUS_OPEN).count()
        
        # Priority breakdown - DB-level aggregation
        priority_breakdown = {}
        priority_counts = Ticket.objects.values('priority').annotate(
            count=Count('id')
        )
        for item in priority_counts:
            priority_breakdown[item['priority']] = item['count']
        
        # Ensure all priorities are present (even with 0 count)
        for priority_choice, _ in Ticket.PRIORITY_CHOICES:
            if priority_choice not in priority_breakdown:
                priority_breakdown[priority_choice] = 0
        
        # Category breakdown - DB-level aggregation
        category_breakdown = {}
        category_counts = Ticket.objects.values('category').annotate(
            count=Count('id')
        )
        for item in category_counts:
            category_breakdown[item['category']] = item['count']
        
        # Ensure all categories are present (even with 0 count)
        for category_choice, _ in Ticket.CATEGORY_CHOICES:
            if category_choice not in category_breakdown:
                category_breakdown[category_choice] = 0
        
        # Average tickets per day - DB-level calculation
        if total_tickets > 0:
            earliest_ticket = Ticket.objects.earliest('created_at')
            latest_ticket = Ticket.objects.latest('created_at')
            
            days_diff = (latest_ticket.created_at - earliest_ticket.created_at).days + 1
            avg_tickets_per_day = round(total_tickets / days_diff, 1)
        else:
            avg_tickets_per_day = 0.0
        
        stats = {
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'avg_tickets_per_day': avg_tickets_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown,
        }
        
        serializer = TicketStatsSerializer(stats)
        return Response(serializer.data)


class ClassifyTicketView(APIView):
    """
    POST /api/tickets/classify/
    
    LLM-powered ticket classification endpoint.
    
    Accepts a ticket description and returns suggested category and priority.
    Falls back gracefully if LLM is unavailable.
    """
    
    def post(self, request):
        """
        Classify a ticket description.
        
        Request body:
        {
            "description": "I can't login to my account"
        }
        
        Response:
        {
            "suggested_category": "account",
            "suggested_priority": "high"
        }
        """
        # Validate input
        input_serializer = ClassificationRequestSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(
                input_serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        description = input_serializer.validated_data['description']
        
        # Get classifier and classify
        classifier = get_classifier()
        
        try:
            result = classifier.classify_ticket(description)
            
            # Validate output
            output_serializer = ClassificationResponseSerializer(data=result)
            if output_serializer.is_valid():
                logger.info(f"Classification successful: {result}")
                return Response(output_serializer.data, status=status.HTTP_200_OK)
            else:
                logger.error(f"Invalid classification result: {output_serializer.errors}")
                # Return defaults on validation failure
                return Response({
                    'suggested_category': 'general',
                    'suggested_priority': 'medium'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Classification error: {str(e)}", exc_info=True)
            # Graceful fallback
            return Response({
                'suggested_category': 'general',
                'suggested_priority': 'medium'
            }, status=status.HTTP_200_OK)
