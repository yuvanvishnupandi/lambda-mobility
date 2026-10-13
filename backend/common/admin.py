from django.contrib import admin
from .models import Location, SchoolZone

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'latitude', 'longitude', 'landmark']
    search_fields = ['name', 'city', 'landmark']

@admin.register(SchoolZone)
class SchoolZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'risk_level', 'radius', 'active', 'latitude', 'longitude']
    list_filter = ['risk_level', 'active']
    search_fields = ['name']
