from django.urls import path
from .views import DetectionListCreateView, DetectionDetailView

urlpatterns = [
    path('', DetectionListCreateView.as_view(), name='detection_list_create'),
    path('<str:id>/', DetectionDetailView.as_view(), name='detection_detail'),
]
