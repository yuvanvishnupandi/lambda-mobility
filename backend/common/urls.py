from django.urls import path
from .views import (
    MapBusesView, MapDetectionsView, MapIncidentsView,
    MapHazardsView, MapTrafficView, MapAllView,
    SchoolZoneSafetyView
)

urlpatterns = [
    path('buses/', MapBusesView.as_view(), name='map_buses'),
    path('detections/', MapDetectionsView.as_view(), name='map_detections'),
    path('incidents/', MapIncidentsView.as_view(), name='map_incidents'),
    path('hazards/', MapHazardsView.as_view(), name='map_hazards'),
    path('traffic/', MapTrafficView.as_view(), name='map_traffic'),
    path('all/', MapAllView.as_view(), name='map_all'),
]
