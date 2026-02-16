from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    """
    Serializer for Ticket model with full validation.
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
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_title(self, value):
        """Ensure title is not empty and within length."""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty")
        if len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters")
        return value.strip()
    
    def validate_description(self, value):
        """Ensure description is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty")
        return value.strip()
    
    def validate_category(self, value):
        """Validate category choice."""
        valid_categories = dict(Ticket.CATEGORY_CHOICES).keys()
        if value not in valid_categories:
            raise serializers.ValidationError(
                f"Invalid category. Must be one of: {', '.join(valid_categories)}"
            )
        return value
    
    def validate_priority(self, value):
        """Validate priority choice."""
        valid_priorities = dict(Ticket.PRIORITY_CHOICES).keys()
        if value not in valid_priorities:
            raise serializers.ValidationError(
                f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
            )
        return value
    
    def validate_status(self, value):
        """Validate status choice."""
        valid_statuses = dict(Ticket.STATUS_CHOICES).keys()
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        return value


class TicketUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for partial ticket updates (PATCH).
    """
    
    class Meta:
        model = Ticket
        fields = ['category', 'priority', 'status']
        extra_kwargs = {
            'category': {'required': False},
            'priority': {'required': False},
            'status': {'required': False},
        }


class ClassificationRequestSerializer(serializers.Serializer):
    """
    Serializer for LLM classification requests.
    """
    description = serializers.CharField(
        required=True,
        allow_blank=False,
        min_length=10,
        max_length=10000,
        help_text="Ticket description to classify"
    )
    
    def validate_description(self, value):
        """Ensure description has meaningful content."""
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty")
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters")
        return value.strip()


class ClassificationResponseSerializer(serializers.Serializer):
    """
    Serializer for LLM classification responses.
    """
    suggested_category = serializers.ChoiceField(
        choices=[choice[0] for choice in Ticket.CATEGORY_CHOICES],
        help_text="LLM-suggested category"
    )
    suggested_priority = serializers.ChoiceField(
        choices=[choice[0] for choice in Ticket.PRIORITY_CHOICES],
        help_text="LLM-suggested priority"
    )


class TicketStatsSerializer(serializers.Serializer):
    """
    Serializer for aggregated ticket statistics.
    """
    total_tickets = serializers.IntegerField(help_text="Total number of tickets")
    open_tickets = serializers.IntegerField(help_text="Number of open tickets")
    avg_tickets_per_day = serializers.FloatField(help_text="Average tickets created per day")
    priority_breakdown = serializers.DictField(
        child=serializers.IntegerField(),
        help_text="Count of tickets by priority level"
    )
    category_breakdown = serializers.DictField(
        child=serializers.IntegerField(),
        help_text="Count of tickets by category"
    )
