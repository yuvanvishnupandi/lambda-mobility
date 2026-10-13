from django.db import models
from django.utils import timezone

class BusRoute(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('DIVERTED', 'Diverted'),
    ]

    route_number = models.CharField(max_length=50, unique=True, db_index=True)
    route_name = models.CharField(max_length=255)
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    waypoints = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['route_number']

    def __str__(self):
        return f"Route {self.route_number} ({self.route_name})"


class Bus(models.Model):
    STATUS_CHOICES = [
        ('ONLINE', 'Online'),
        ('OFFLINE', 'Offline'),
        ('PROCESSING', 'Processing'),
        ('MAINTENANCE', 'Maintenance'),
    ]

    bus_id = models.CharField(max_length=50, unique=True, db_index=True)
    registration_number = models.CharField(max_length=50, unique=True)
    route = models.ForeignKey(BusRoute, on_delete=models.SET_NULL, null=True, blank=True, related_name='buses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ONLINE', db_index=True)
    latitude = models.FloatField(default=23.0225, db_index=True)
    longitude = models.FloatField(default=72.5714, db_index=True)
    speed = models.FloatField(default=0.0)
    heading = models.FloatField(default=0.0)
    last_seen = models.DateTimeField(default=timezone.now)
    ai_status = models.CharField(max_length=50, default='Processing')
    current_location_name = models.CharField(max_length=255, default='SG Highway', blank=True)
    cameras_status = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Buses'
        ordering = ['bus_id']

    def __str__(self):
        return f"{self.bus_id} ({self.registration_number})"

    @property
    def gps(self):
        return [self.latitude, self.longitude]


class BusCamera(models.Model):
    CAMERA_TYPE_CHOICES = [
        ('FRONT', 'Front Road Sensing'),
        ('REAR', 'Rear Traffic Sensing'),
        ('LEFT', 'Left Pavement/Lane'),
        ('RIGHT', 'Right Traffic/Lane'),
        ('PASSENGER', 'Passenger Cabin'),
    ]
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ERROR', 'Error'),
    ]

    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='cameras')
    camera_id = models.CharField(max_length=100)
    camera_type = models.CharField(max_length=20, choices=CAMERA_TYPE_CHOICES, default='FRONT')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    last_frame = models.CharField(max_length=500, blank=True, null=True)
    resolution = models.CharField(max_length=50, default='1920x1080')
    fps = models.IntegerField(default=30)
    last_seen = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('bus', 'camera_type')
        ordering = ['bus', 'camera_type']

    def __str__(self):
        return f"{self.bus.bus_id} - {self.camera_type}"


class BusLocationHistory(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='location_history')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(default=0.0)
    heading = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['bus', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.bus.bus_id} @ {self.timestamp.strftime('%H:%M:%S')}"

    @property
    def gps(self):
        return [self.latitude, self.longitude]
