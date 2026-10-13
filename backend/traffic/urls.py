from django.urls import path
from .views import (
    CurrentTrafficView, TrafficHistoryView, TrafficSummaryView,
    CongestionView, VehicleClassificationView
)

urlpatterns = [
    path('current/', CurrentTrafficView.as_view(), name='traffic_current'),
    path('history/', TrafficHistoryView.as_view(), name='traffic_history'),
    path('summary/', TrafficSummaryView.as_view(), name='traffic_summary'),
    path('congestion/', CongestionView.as_view(), name='traffic_congestion'),
    path('vehicle-classification/', VehicleClassificationView.as_view(), name='traffic_vehicle_classification'),
]
