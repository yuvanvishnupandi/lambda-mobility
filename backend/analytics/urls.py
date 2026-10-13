from django.urls import path
from .views import (
    AnalyticsDetectionsView, AnalyticsTrafficView,
    AnalyticsRoadConditionsView, AnalyticsIncidentsView,
    AnalyticsRouteDelaysView, AnalyticsInsightsView
)

urlpatterns = [
    path('detections/', AnalyticsDetectionsView.as_view(), name='analytics_detections'),
    path('traffic/', AnalyticsTrafficView.as_view(), name='analytics_traffic'),
    path('road-conditions/', AnalyticsRoadConditionsView.as_view(), name='analytics_road_conditions'),
    path('incidents/', AnalyticsIncidentsView.as_view(), name='analytics_incidents'),
    path('route-delays/', AnalyticsRouteDelaysView.as_view(), name='analytics_route_delays'),
    path('insights/', AnalyticsInsightsView.as_view(), name='analytics_insights'),
]
