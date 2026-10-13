from django.urls import path
from .views import (
    VehicleListView, VehicleDetailView, VehicleSearchView,
    VehicleDetectionsView, VehicleRouteView
)

urlpatterns = [
    path('', VehicleListView.as_view(), name='vehicle_list'),
    path('search/', VehicleSearchView.as_view(), name='vehicle_search'),
    path('<int:id>/', VehicleDetailView.as_view(), name='vehicle_detail'),
    path('<int:id>/detections/', VehicleDetectionsView.as_view(), name='vehicle_detections'),
    path('<int:id>/route/', VehicleRouteView.as_view(), name='vehicle_route'),
]
