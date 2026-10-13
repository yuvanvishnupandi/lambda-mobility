from django.urls import path
from .electric_bus_views import (
    ElectricBusRoutesView,
    ElectricBusStopsView,
    ElectricBusDeparturesView,
    ElectricBusVehiclesView,
    ElectricBusVehicleDetailView,
    ElectricBusETAView,
    ElectricBusAlertsView,
    ElectricBusStatsView,
)

urlpatterns = [
    path('routes/', ElectricBusRoutesView.as_view(), name='electric_bus_routes'),
    path('stops/', ElectricBusStopsView.as_view(), name='electric_bus_stops'),
    path('departures/', ElectricBusDeparturesView.as_view(), name='electric_bus_departures'),
    path('departures/<str:stop_id>/', ElectricBusDeparturesView.as_view(), name='electric_bus_departures_by_stop'),
    path('vehicles/', ElectricBusVehiclesView.as_view(), name='electric_bus_vehicles'),
    path('vehicles/<str:vehicle_id>/', ElectricBusVehicleDetailView.as_view(), name='electric_bus_vehicle_detail'),
    path('eta/', ElectricBusETAView.as_view(), name='electric_bus_eta'),
    path('alerts/', ElectricBusAlertsView.as_view(), name='electric_bus_alerts'),
    path('stats/', ElectricBusStatsView.as_view(), name='electric_bus_stats'),
]
