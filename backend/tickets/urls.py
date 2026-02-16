from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, classify_ticket

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
    path('tickets/classify/', classify_ticket, name='classify-ticket'),
]
