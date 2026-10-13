from django.urls import path
from .views import IncidentListCreateView, IncidentDetailView, IncidentResolveView

urlpatterns = [
    path('', IncidentListCreateView.as_view(), name='incident_list_create'),
    path('<str:id>/', IncidentDetailView.as_view(), name='incident_detail'),
    path('<str:id>/resolve/', IncidentResolveView.as_view(), name='incident_resolve'),
]
