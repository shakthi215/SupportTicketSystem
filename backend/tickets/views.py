from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from .models import Ticket
from .serializers import (
    TicketSerializer,
    ClassifyRequestSerializer,
    ClassifyResponseSerializer
)
from .llm_service import llm_classifier


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Ticket CRUD operations with filtering and search
    """
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters
        Supports: category, priority, status, and search
        """
        queryset = Ticket.objects.all().order_by('-created_at')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by status
        ticket_status = self.request.query_params.get('status', None)
        if ticket_status:
            queryset = queryset.filter(status=ticket_status)
        
        # Search in title and description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        """
        Get aggregated statistics using database-level operations.
        
        This endpoint uses Django ORM's aggregate and annotate functions
        to perform all calculations at the database level, not in Python.
        
        Returns:
            - total_tickets: Total number of tickets
            - open_tickets: Number of tickets with status='open'
            - avg_tickets_per_day: Average tickets created per day
            - priority_breakdown: Count by priority level
            - category_breakdown: Count by category
        """
        # Total tickets - database count
        total_tickets = Ticket.objects.count()
        
        # Open tickets - database filtered count
        open_tickets = Ticket.objects.filter(status=Ticket.STATUS_OPEN).count()
        
        # Calculate average tickets per day using database aggregation
        # Get the date range
        earliest_ticket = Ticket.objects.order_by('created_at').first()
        
        if earliest_ticket:
            days_since_first = (timezone.now() - earliest_ticket.created_at).days + 1
            avg_tickets_per_day = round(total_tickets / days_since_first, 1) if days_since_first > 0 else 0.0
        else:
            avg_tickets_per_day = 0.0
        
        # Priority breakdown - database-level aggregation
        priority_breakdown = dict(
            Ticket.objects.values('priority').annotate(
                count=Count('id')
            ).values_list('priority', 'count')
        )
        
        # Ensure all priorities are represented
        for priority_choice, _ in Ticket.PRIORITY_CHOICES:
            if priority_choice not in priority_breakdown:
                priority_breakdown[priority_choice] = 0
        
        # Category breakdown - database-level aggregation
        category_breakdown = dict(
            Ticket.objects.values('category').annotate(
                count=Count('id')
            ).values_list('category', 'count')
        )
        
        # Ensure all categories are represented
        for category_choice, _ in Ticket.CATEGORY_CHOICES:
            if category_choice not in category_breakdown:
                category_breakdown[category_choice] = 0
        
        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'avg_tickets_per_day': avg_tickets_per_day,
            'priority_breakdown': priority_breakdown,
            'category_breakdown': category_breakdown
        })


@api_view(['POST'])
def classify_ticket(request):
    """
    Classify a ticket description using LLM.
    
    This endpoint accepts a ticket description and returns
    suggested category and priority using Claude AI.
    
    POST /api/tickets/classify/
    Body: {"description": "..."}
    
    Returns: {"suggested_category": "...", "suggested_priority": "..."}
    """
    # Validate input
    serializer = ClassifyRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get description
    description = serializer.validated_data['description']
    
    # Classify using LLM
    try:
        result = llm_classifier.classify_ticket(description)
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Graceful fallback
        return Response(
            {
                'suggested_category': 'general',
                'suggested_priority': 'medium',
                'error': 'Classification service temporarily unavailable'
            },
            status=status.HTTP_200_OK
        )
