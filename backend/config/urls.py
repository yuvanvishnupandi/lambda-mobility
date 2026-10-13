"""
URL configuration for Urban Intelligence Platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# pyrefly: ignore [missing-import]
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from fleet.views import EdgeHeartbeatView, EdgeLocationView
from detections.views import EdgeDetectionView
from incidents.views import EdgeIncidentView
from common.views import SchoolZoneSafetyView
from dashboard.views import DemoStartView, DemoStopView, DemoStatusView
from transit.views import JourneyPlanView, AiJourneyAssistView, RouteComparisonView, LocationDebugNearestView

from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/api/docs/', permanent=False), name='root-redirect'),
    path('admin/', admin.site.urls),

    # API Documentation (drf-spectacular)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Core Module APIs
    path('api/auth/', include('accounts.urls')),
    path('api/fleet/', include('fleet.urls')),
    path('api/detections/', include('detections.urls')),
    path('api/incidents/', include('incidents.urls')),
    path('api/traffic/', include('traffic.urls')),
    path('api/roads/', include('roads.urls')),
    path('api/vehicles/', include('vehicles.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/alerts/', include('notifications.urls')),
    path('api/dashboard/', include('dashboard.urls')),

    # Ahmedabad + Gandhinagar + GIFT City Smart Mobility & Journey Planner APIs
    path('api/transit/', include('transit.urls')),
    path('api/electric-bus/', include('transit.electric_bus_urls')),
    path('api/traccar/', include('transit.traccar_urls')),
    path('api/journey/plan/', JourneyPlanView.as_view(), name='journey_plan_root'),
    path('api/journey/ai-assist/', AiJourneyAssistView.as_view(), name='journey_ai_assist_root'),
    path('api/journey/compare/', RouteComparisonView.as_view(), name='journey_compare_root'),
    path('api/location/debug/nearest/', LocationDebugNearestView.as_view(), name='location_debug_nearest_root'),

    # Demo Simulation APIs
    path('api/demo/start/', DemoStartView.as_view(), name='demo_start_direct'),
    path('api/demo/stop/', DemoStopView.as_view(), name='demo_stop_direct'),
    path('api/demo/status/', DemoStatusView.as_view(), name='demo_status_direct'),

    # Geospatial Map & Safety APIs
    path('api/map/', include('common.urls')),
    path('api/safety/school-zones/', SchoolZoneSafetyView.as_view(), name='school_zones_safety'),

    # Edge AI Device Ingestion APIs
    path('api/edge/heartbeat/', EdgeHeartbeatView.as_view(), name='edge_heartbeat'),
    path('api/edge/location/', EdgeLocationView.as_view(), name='edge_location'),
    path('api/edge/detections/', EdgeDetectionView.as_view(), name='edge_detections'),
    path('api/edge/incidents/', EdgeIncidentView.as_view(), name='edge_incidents'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = "Lambda Intelligence Platform"
admin.site.site_title = "Lambda Admin"
admin.site.index_title = "Ahmedabad Smart City Bus Sensing Command Center"
