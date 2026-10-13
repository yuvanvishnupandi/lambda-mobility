from django.urls import path
from .views import (
    RoadHazardListView, RoadHazardDetailView,
    RoadSummaryView, MaintenancePriorityView
)

urlpatterns = [
    path('hazards/', RoadHazardListView.as_view(), name='road_hazards_list'),
    path('hazards/<int:id>/', RoadHazardDetailView.as_view(), name='road_hazard_detail'),
    path('summary/', RoadSummaryView.as_view(), name='road_summary'),
    path('maintenance-priority/', MaintenancePriorityView.as_view(), name='road_maintenance_priority'),
]
