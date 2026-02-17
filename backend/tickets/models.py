from django.db import models
from django.db.models import Q


class Ticket(models.Model):
    """
    Support ticket model with LLM-assisted categorization and prioritization.
    """
    
    # Category choices
    CATEGORY_BILLING = 'billing'
    CATEGORY_TECHNICAL = 'technical'
    CATEGORY_ACCOUNT = 'account'
    CATEGORY_GENERAL = 'general'
    
    CATEGORY_CHOICES = [
        (CATEGORY_BILLING, 'Billing'),
        (CATEGORY_TECHNICAL, 'Technical'),
        (CATEGORY_ACCOUNT, 'Account'),
        (CATEGORY_GENERAL, 'General'),
    ]
    
    # Priority choices
    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CRITICAL = 'critical'
    
    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_CRITICAL, 'Critical'),
    ]
    
    # Status choices
    STATUS_OPEN = 'open'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_RESOLVED = 'resolved'
    STATUS_CLOSED = 'closed'
    
    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_RESOLVED, 'Resolved'),
        (STATUS_CLOSED, 'Closed'),
    ]
    
    # Fields
    title = models.CharField(
        max_length=200,
        blank=False,
        null=False,
        db_index=True,
        help_text='Short summary of the issue'
    )
    
    description = models.TextField(
        blank=False,
        null=False,
        help_text='Detailed description of the issue'
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        blank=False,
        null=False,
        db_index=True,
        help_text='Auto-suggested by LLM, can be overridden'
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        blank=False,
        null=False,
        db_index=True,
        help_text='Auto-suggested by LLM, can be overridden'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_OPEN,
        blank=False,
        null=False,
        db_index=True,
        help_text='Current status of the ticket'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text='Timestamp when ticket was created'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Timestamp when ticket was last updated'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at'], name='tix_created_idx'),
            models.Index(fields=['category', 'status'], name='tix_cat_status_idx'),
            models.Index(fields=['priority', 'status'], name='tix_pri_status_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(title__gt=''),
                name='ticket_title_not_empty',
            ),
            models.CheckConstraint(
                check=Q(description__gt=''),
                name='ticket_description_not_empty',
            ),
            models.CheckConstraint(
                check=Q(category__in=[
                    'billing',
                    'technical',
                    'account',
                    'general',
                ]),
                name='ticket_valid_category',
            ),
            models.CheckConstraint(
                check=Q(priority__in=[
                    'low',
                    'medium',
                    'high',
                    'critical',
                ]),
                name='ticket_valid_priority',
            ),
            models.CheckConstraint(
                check=Q(status__in=[
                    'open',
                    'in_progress',
                    'resolved',
                    'closed',
                ]),
                name='ticket_valid_status',
            ),
        ]
        db_table = 'tickets'
        verbose_name = 'Support Ticket'
        verbose_name_plural = 'Support Tickets'
    
    def __str__(self):
        return f"[{self.get_priority_display()}] {self.title}"
    
    def save(self, *args, **kwargs):
        """Ensure constraints are met before saving."""
        self.full_clean()
        super().save(*args, **kwargs)
