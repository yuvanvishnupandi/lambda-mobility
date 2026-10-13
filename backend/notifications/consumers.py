import json
from channels.generic.websocket import AsyncWebsocketConsumer

class DashboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "dashboard_updates"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            "event": "CONNECTED",
            "message": "Connected to Urban Intelligence Dashboard stream"
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def dashboard_event(self, event):
        await self.send(text_data=json.dumps({
            "event": event.get("event"),
            "data": event.get("data")
        }))


class FleetConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "fleet_updates"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({
            "event": "CONNECTED",
            "message": "Connected to Fleet Real-Time GPS stream"
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def fleet_event(self, event):
        await self.send(text_data=json.dumps({
            "event": event.get("event"),
            "data": event.get("data")
        }))


class AlertConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "alert_updates"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({
            "event": "CONNECTED",
            "message": "Connected to Real-Time Alerts stream"
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def alert_event(self, event):
        await self.send(text_data=json.dumps({
            "event": event.get("event"),
            "data": event.get("data")
        }))
