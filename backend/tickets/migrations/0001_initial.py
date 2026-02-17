from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(db_index=True, help_text='Short summary of the issue', max_length=200)),
                ('description', models.TextField(help_text='Detailed description of the issue')),
                ('category', models.CharField(choices=[('billing', 'Billing'), ('technical', 'Technical'), ('account', 'Account'), ('general', 'General')], db_index=True, help_text='Auto-suggested by LLM, can be overridden', max_length=20)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], db_index=True, help_text='Auto-suggested by LLM, can be overridden', max_length=20)),
                ('status', models.CharField(choices=[('open', 'Open'), ('in_progress', 'In Progress'), ('resolved', 'Resolved'), ('closed', 'Closed')], db_index=True, default='open', help_text='Current status of the ticket', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True, help_text='Timestamp when ticket was created')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='Timestamp when ticket was last updated')),
            ],
            options={
                'verbose_name': 'Support Ticket',
                'verbose_name_plural': 'Support Tickets',
                'db_table': 'tickets',
                'ordering': ['-created_at'],
                'indexes': [
                    models.Index(fields=['-created_at'], name='tix_created_idx'),
                    models.Index(fields=['category', 'status'], name='tix_cat_status_idx'),
                    models.Index(fields=['priority', 'status'], name='tix_pri_status_idx'),
                ],
                'constraints': [
                    models.CheckConstraint(check=Q(title__gt=''), name='ticket_title_not_empty'),
                    models.CheckConstraint(check=Q(description__gt=''), name='ticket_description_not_empty'),
                    models.CheckConstraint(check=Q(category__in=['billing', 'technical', 'account', 'general']), name='ticket_valid_category'),
                    models.CheckConstraint(check=Q(priority__in=['low', 'medium', 'high', 'critical']), name='ticket_valid_priority'),
                    models.CheckConstraint(check=Q(status__in=['open', 'in_progress', 'resolved', 'closed']), name='ticket_valid_status'),
                ],
            },
        ),
    ]
