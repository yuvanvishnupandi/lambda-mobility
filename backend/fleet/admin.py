from django.contrib import admin
from .models import Bus, BusRoute, BusCamera, BusLocationHistory

@admin.register(BusRoute)
class BusRouteAdmin(admin.ModelAdmin):
    list_display = ['route_number', 'route_name', 'start_location', 'end_location', 'status']
    list_filter = ['status']
    search_fields = ['route_number', 'route_name', 'start_location', 'end_location']

@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ['bus_id', 'registration_number', 'route', 'status', 'speed', 'latitude', 'longitude', 'last_seen']
    list_filter = ['status', 'route']
    search_fields = ['bus_id', 'registration_number', 'current_location_name']

@admin.register(BusCamera)
class BusCameraAdmin(admin.ModelAdmin):
    list_display = ['bus', 'camera_id', 'camera_type', 'status', 'resolution', 'fps', 'last_seen']
    list_filter = ['camera_type', 'status']
    search_fields = ['bus__bus_id', 'camera_id']

@admin.register(BusLocationHistory)
class BusLocationHistoryAdmin(admin.ModelAdmin):
    list_display = ['bus', 'latitude', 'longitude', 'speed', 'heading', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['bus__bus_id']
