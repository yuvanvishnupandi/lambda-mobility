from django.contrib import admin
from .models import Detection

@admin.register(Detection)
class DetectionAdmin(admin.ModelAdmin):
    list_display = ['detection_id', 'bus', 'detection_type', 'confidence', 'severity', 'status', 'location_name', 'timestamp']
    list_filter = ['detection_type', 'severity', 'status', 'bus']
    search_fields = ['detection_id', 'bus__bus_id', 'location_name']
    readonly_fields = ['created_at']
