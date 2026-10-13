from django.contrib import admin
from .models import RoadHazard, RoadSegment, MaintenanceTask

@admin.register(RoadHazard)
class RoadHazardAdmin(admin.ModelAdmin):
    list_display = ['road_name', 'hazard_type', 'severity', 'confidence', 'occurrence_count', 'maintenance_priority', 'status', 'last_detected']
    list_filter = ['hazard_type', 'severity', 'status', 'road_name']
    search_fields = ['road_name', 'hazard_type', 'description']

@admin.register(RoadSegment)
class RoadSegmentAdmin(admin.ModelAdmin):
    list_display = ['road_name', 'segment_code', 'condition_score', 'is_critical', 'last_surveyed']
    list_filter = ['is_critical', 'road_name']
    search_fields = ['road_name', 'segment_code']

@admin.register(MaintenanceTask)
class MaintenanceTaskAdmin(admin.ModelAdmin):
    list_display = ['task_number', 'hazard', 'assigned_team', 'scheduled_date', 'status']
    list_filter = ['status']
    search_fields = ['task_number', 'assigned_team']
