from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """
    Serializer for Ticket model with full CRUD support
    """
    
    class Meta:
        model = Ticket
        fields = [
            'id',
            'title',
            'description',
            'category',
            'priority',
            'status',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_title(self, value):
        """Ensure title doesn't exceed 200 characters"""
        if len(value) > 200:
            raise serializers.ValidationError("Title must not exceed 200 characters.")
        return value


class ClassifyRequestSerializer(serializers.Serializer):
    """
    Serializer for LLM classification request
    """
    description = serializers.CharField(required=True, allow_blank=False)


class ClassifyResponseSerializer(serializers.Serializer):
    """
    Serializer for LLM classification response
    """
    suggested_category = serializers.CharField()
    suggested_priority = serializers.CharField()
