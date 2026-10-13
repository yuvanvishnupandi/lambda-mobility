from django.urls import path
from .views import (
    BusListCreateView, BusDetailView, RouteListView,
    BusCamerasView, BusLocationUpdateView, BusLocationHistoryView
)

urlpatterns = [
    path('buses/', BusListCreateView.as_view(), name='bus_list_create'),
    path('buses/<str:id>/', BusDetailView.as_view(), name='bus_detail'),
    path('routes/', RouteListView.as_view(), name='route_list'),
    path('buses/<str:id>/cameras/', BusCamerasView.as_view(), name='bus_cameras'),
    path('buses/<str:id>/location/', BusLocationUpdateView.as_view(), name='bus_location_update'),
    path('buses/<str:id>/location-history/', BusLocationHistoryView.as_view(), name='bus_location_history'),
]
