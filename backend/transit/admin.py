from django.contrib import admin
from .models import (
    TransportAgency, TransportMode, Stop, Route, RouteStop,
    Transfer, Vehicle, VehiclePosition, FareRule, ServiceAlert,
    DataSource, DataSyncLog, PlaceLandmark
)

@admin.register(TransportAgency)
class TransportAgencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'helpline', 'is_active')
    search_fields = ('code', 'name')

@admin.register(TransportMode)
class TransportModeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'color', 'average_speed_kmh')

@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('stop_id', 'name', 'agency', 'mode', 'is_interchange', 'wheelchair_accessible', 'latitude', 'longitude')
    list_filter = ('mode', 'agency', 'is_interchange', 'wheelchair_accessible')
    search_fields = ('name', 'stop_id', 'code')

class RouteStopInline(admin.TabularInline):
    model = RouteStop
    extra = 1

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('route_number', 'route_name', 'agency', 'mode', 'color', 'headway_peak_mins', 'reliability_score', 'is_active')
    list_filter = ('mode', 'agency', 'is_active')
    search_fields = ('route_number', 'route_name')
    inlines = [RouteStopInline]

@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    list_display = ('from_stop', 'to_stop', 'transfer_type', 'walking_distance_m', 'walking_time_mins', 'is_step_free')
    list_filter = ('transfer_type', 'is_step_free')
    search_fields = ('from_stop__name', 'to_stop__name')

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_id', 'agency', 'mode', 'current_route', 'is_electric', 'is_active')
    list_filter = ('mode', 'agency', 'is_active')
    search_fields = ('vehicle_id', 'registration')

@admin.register(VehiclePosition)
class VehiclePositionAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'current_location_name', 'next_stop', 'speed_kmh', 'delay_minutes', 'status', 'is_live', 'last_updated')
    list_filter = ('status', 'is_live', 'data_source')
    search_fields = ('vehicle__vehicle_id', 'current_location_name')

@admin.register(FareRule)
class FareRuleAdmin(admin.ModelAdmin):
    list_display = ('agency', 'mode', 'base_fare', 'per_km_rate', 'max_fare')

@admin.register(ServiceAlert)
class ServiceAlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'agency', 'route', 'severity', 'status', 'delay_impact_mins', 'valid_from')
    list_filter = ('severity', 'status', 'agency')
    search_fields = ('title', 'description')

@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    list_display = ('source_name', 'provider_type', 'status', 'records_count', 'is_live_telemetry', 'last_sync')
    list_filter = ('status', 'provider_type')

@admin.register(DataSyncLog)
class DataSyncLogAdmin(admin.ModelAdmin):
    list_display = ('source', 'status', 'records_updated', 'duration_ms', 'timestamp')
    list_filter = ('status',)

@admin.register(PlaceLandmark)
class PlaceLandmarkAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'address', 'is_popular')
    list_filter = ('category', 'is_popular')
    search_fields = ('name', 'address')
