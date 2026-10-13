from django.urls import path
from .views import AlertListView, AlertReadView, AlertAcknowledgeView, AlertMarkAllReadView

urlpatterns = [
    path('', AlertListView.as_view(), name='alert_list'),
    path('mark-all-read/', AlertMarkAllReadView.as_view(), name='alert_mark_all_read'),
    path('<int:id>/read/', AlertReadView.as_view(), name='alert_read'),
    path('<int:id>/acknowledge/', AlertAcknowledgeView.as_view(), name='alert_acknowledge'),
]

