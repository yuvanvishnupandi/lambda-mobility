from django.urls import path
from .views import (
    DashboardSummaryView, LiveAlertsView,
    DemoStartView, DemoStopView, DemoStatusView
)

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('live-alerts/', LiveAlertsView.as_view(), name='dashboard_live_alerts'),
    path('demo/start/', DemoStartView.as_view(), name='demo_start'),
    path('demo/stop/', DemoStopView.as_view(), name='demo_stop'),
    path('demo/status/', DemoStatusView.as_view(), name='demo_status'),
]
