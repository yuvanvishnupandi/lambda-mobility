from django.contrib import admin
from .models import Alert

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['title', 'severity', 'alert_type', 'location', 'bus', 'is_read', 'acknowledged', 'created_at']
    list_filter = ['severity', 'is_read', 'acknowledged', 'alert_type']
    search_fields = ['title', 'message', 'location', 'bus__bus_id']
