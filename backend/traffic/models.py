from django.db import models
from django.utils import timezone
from fleet.models import Bus

class TrafficObservation(models.Model):
    CONGESTION_LEVEL_CHOICES = [
        ('LOW', 'Low / Free Flow'),
        ('MODERATE', 'Moderate Flow'),
        ('HEAVY', 'Heavy Congestion'),
        ('SEVERE', 'Severe Gridlock'),
    ]

    bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='traffic_observations')
    location = models.CharField(max_length=255, db_index=True)
    latitude = models.FloatField(default=23.0225)
    longitude = models.FloatField(default=72.5714)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    vehicle_count = models.IntegerField(default=0)
    car_count = models.IntegerField(default=0)
    bus_count = models.IntegerField(default=0)
    truck_count = models.IntegerField(default=0)
    two_wheeler_count = models.IntegerField(default=0)
    auto_count = models.IntegerField(default=0)
    average_speed = models.FloatField(default=35.0, help_text="Average speed in km/h")
    congestion_level = models.CharField(max_length=20, choices=CONGESTION_LEVEL_CHOICES, default='MODERATE')
    congestion_index = models.IntegerField(default=50, help_text="Score 0 (free) to 100 (gridlock)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['location', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]

    def __str__(self):
        return f"Traffic @ {self.location} [{self.timestamp.strftime('%H:%M')}] Index: {self.congestion_index}"

    @property
    def gps(self):
        return [self.latitude, self.longitude]
