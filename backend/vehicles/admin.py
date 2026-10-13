from django.contrib import admin
from .models import TrackedVehicle, VehicleDetection, ANPRDetection

@admin.register(TrackedVehicle)
class TrackedVehicleAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'vehicle_type', 'vehicle_color', 'confidence', 'first_seen', 'last_seen', 'flagged_for_incident']
    list_filter = ['vehicle_type', 'flagged_for_incident']
    search_fields = ['registration_number']

@admin.register(VehicleDetection)
class VehicleDetectionAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'bus', 'latitude', 'longitude', 'timestamp', 'direction', 'confidence']
    list_filter = ['direction', 'bus']
    search_fields = ['vehicle__registration_number', 'location_name']

@admin.register(ANPRDetection)
class ANPRDetectionAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'confidence', 'bus', 'timestamp', 'location_name']
    search_fields = ['registration_number', 'location_name']
