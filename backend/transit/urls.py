from django.urls import path, include
from .views import (
    JourneyPlanView,
    AiJourneyAssistView,
    RouteComparisonView,
    AdminNetworkMonitorView,
    NearbyStopsView,
    StationDeparturesView,
    LiveVehiclesView,
    LiveVehicleDetailView,
    TransitAlertsView,
    LocationSearchView,
    TransitStatusView,
    FareCalculatorView,
    LocationDebugNearestView
)

urlpatterns = [
    # Core Journey Planning & AI Assistant
    path('journey/plan/', JourneyPlanView.as_view(), name='journey_plan'),
    path('journey/ai-assist/', AiJourneyAssistView.as_view(), name='journey_ai_assist'),
    path('journey/compare/', RouteComparisonView.as_view(), name='journey_compare'),

    # Admin Transport Monitor
    path('admin-monitor/', AdminNetworkMonitorView.as_view(), name='admin_network_monitor'),

    # Nearby Transport & Stops
    path('stops/nearby/', NearbyStopsView.as_view(), name='nearby_stops'),
    path('debug/nearest/', LocationDebugNearestView.as_view(), name='debug_nearest_stops'),

    # Live Station Departures
    path('departures/', StationDeparturesView.as_view(), name='station_departures_query'),
    path('departures/<str:stop_id>/', StationDeparturesView.as_view(), name='station_departures'),

    # Live Vehicle Tracking
    path('vehicles/', LiveVehiclesView.as_view(), name='live_vehicles'),
    path('vehicles/<str:vehicle_id>/', LiveVehicleDetailView.as_view(), name='vehicle_detail'),

    # Service Alerts
    path('alerts/', TransitAlertsView.as_view(), name='transit_alerts'),

    # Location & Landmark Search Autocomplete
    path('search/', LocationSearchView.as_view(), name='location_search'),

    # Status & Fares
    path('status/', TransitStatusView.as_view(), name='transit_status'),
    path('fares/', FareCalculatorView.as_view(), name='fare_calculator'),
    path('electric-bus/', include('transit.electric_bus_urls')),
    path('traccar/', include('transit.traccar_urls')),
]
