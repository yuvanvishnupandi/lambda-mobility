from django.urls import path
from .traccar_views import (
    TraccarClientIngestView,
    TraccarWebhookView,
    TraccarLiveStreamView,
    TraccarSimulatorView,
    TraccarStatusView,
)

urlpatterns = [
    # Direct Phone App / OsmAnd GPS ingestion (GET and POST)
    path('client/', TraccarClientIngestView.as_view(), name='traccar_client_ingest'),
    path('osmand/', TraccarClientIngestView.as_view(), name='traccar_osmand_ingest'),

    # Traccar Server Forwarding Webhook
    path('webhook/', TraccarWebhookView.as_view(), name='traccar_webhook'),

    # Real-Time Server-Sent Events (SSE) Live Stream
    path('live-stream/', TraccarLiveStreamView.as_view(), name='traccar_live_stream'),

    # GPS Route Simulator Controls
    path('simulate/', TraccarSimulatorView.as_view(), name='traccar_simulate'),

    # Ingestion Status & Live Packet Inspector
    path('status/', TraccarStatusView.as_view(), name='traccar_status'),
]
