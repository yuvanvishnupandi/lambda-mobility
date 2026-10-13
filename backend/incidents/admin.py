from django.contrib import admin
from .models import Incident

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ['incident_id', 'incident_type', 'severity', 'bus', 'location', 'status', 'confidence', 'timestamp', 'resolved_at']
    list_filter = ['incident_type', 'severity', 'status']
    search_fields = ['incident_id', 'location', 'description', 'bus__bus_id']
