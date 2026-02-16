from django.db import models
from django.core.validators import MaxLengthValidator


class Ticket(models.Model):
    """
    Support Ticket Model with database-level constraints
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
        db_index=True
    )
    
    description = models.TextField(
        blank=False,
        null=False
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        blank=False,
        null=False,
        db_index=True
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        blank=False,
        null=False,
        db_index=True
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_OPEN,
        blank=False,
        null=False,
        db_index=True
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['priority', '-created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(title__length__lte=200),
                name='title_max_length_200'
            ),
            models.CheckConstraint(
                check=models.Q(category__in=['billing', 'technical', 'account', 'general']),
                name='valid_category'
            ),
            models.CheckConstraint(
                check=models.Q(priority__in=['low', 'medium', 'high', 'critical']),
                name='valid_priority'
            ),
            models.CheckConstraint(
                check=models.Q(status__in=['open', 'in_progress', 'resolved', 'closed']),
                name='valid_status'
            ),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_priority_display()}"
