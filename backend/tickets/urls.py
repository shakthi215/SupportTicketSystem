"""
URL configuration for tickets app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, ClassifyTicketView

# Router for ViewSet endpoints
router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    # ViewSet routes: /api/tickets/, /api/tickets/<id>/, /api/tickets/stats/
    path('', include(router.urls)),
    
    # Custom classification endpoint
    path('tickets/classify/', ClassifyTicketView.as_view(), name='classify-ticket'),
]
