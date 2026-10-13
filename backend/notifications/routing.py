from django.urls import re_path
from .consumers import DashboardConsumer, FleetConsumer, AlertConsumer

websocket_urlpatterns = [
    re_path(r'^ws/dashboard/$', DashboardConsumer.as_asgi()),
    re_path(r'^ws/fleet/$', FleetConsumer.as_asgi()),
    re_path(r'^ws/alerts/$', AlertConsumer.as_asgi()),
]
