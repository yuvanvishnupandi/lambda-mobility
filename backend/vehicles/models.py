from django.db import models
from django.utils import timezone
from fleet.models import Bus

class TrackedVehicle(models.Model):
    registration_number = models.CharField(max_length=50, unique=True, db_index=True)
    vehicle_type = models.CharField(max_length=50, default='SUV / Car')
    vehicle_color = models.CharField(max_length=50, default='White')
    confidence = models.FloatField(default=0.95)
    first_seen = models.DateTimeField(default=timezone.now)
    last_seen = models.DateTimeField(default=timezone.now)
    flagged_for_incident = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_seen']

    def __str__(self):
        return f"{self.registration_number} ({self.vehicle_type}, {self.vehicle_color})"


class VehicleDetection(models.Model):
    vehicle = models.ForeignKey(TrackedVehicle, on_delete=models.CASCADE, related_name='detections')
    bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicle_sightings')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    direction = models.CharField(max_length=50, default='Northbound')
    speed_estimate = models.FloatField(default=45.0)
    confidence = models.FloatField(default=0.92)
    frame_reference = models.CharField(max_length=500, blank=True, null=True)
    location_name = models.CharField(max_length=255, default='GST Road (NH 45)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.vehicle.registration_number} by {self.bus.bus_id if self.bus else 'Camera'} at {self.location_name}"

    @property
    def gps(self):
        return [self.latitude, self.longitude]


class ANPRDetection(models.Model):
    vehicle = models.ForeignKey(TrackedVehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name='anpr_records')
    registration_number = models.CharField(max_length=50, db_index=True)
    confidence = models.FloatField(default=0.964)
    bus = models.ForeignKey(Bus, on_delete=models.SET_NULL, null=True, blank=True, related_name='anpr_scans')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    image_reference = models.CharField(max_length=500, blank=True, null=True)
    location_name = models.CharField(max_length=255, default='GST Road Corridor (Chengalpattu)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"ANPR: {self.registration_number} ({self.confidence*100:.1f}%)"

    @property
    def gps(self):
        return [self.latitude, self.longitude]
