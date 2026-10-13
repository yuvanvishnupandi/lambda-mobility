from django.contrib import admin
from .models import TrafficObservation

@admin.register(TrafficObservation)
class TrafficObservationAdmin(admin.ModelAdmin):
    list_display = ['location', 'timestamp', 'vehicle_count', 'average_speed', 'congestion_level', 'congestion_index', 'bus']
    list_filter = ['congestion_level', 'location', 'timestamp']
    search_fields = ['location', 'bus__bus_id']
