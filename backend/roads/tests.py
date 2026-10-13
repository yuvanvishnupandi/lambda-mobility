from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from fleet.models import Bus
from .models import RoadHazard

class RoadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='analyst', password='password', role='ANALYST')
        self.client.force_authenticate(user=self.user)

        self.bus = Bus.objects.create(bus_id='BUS-104', registration_number='GJ01XX104', status='ONLINE')
        self.hazard = RoadHazard.objects.create(
            road_name='SG Highway',
            hazard_type='POTHOLE',
            severity='HIGH',
            confidence=0.94,
            latitude=23.0395,
            longitude=72.5667,
            detected_by_bus=self.bus,
            maintenance_priority=86,
            status='PENDING'
        )

    def test_list_hazards(self):
        response = self.client.get('/api/roads/hazards/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_road_summary(self):
        response = self.client.get('/api/roads/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('roads_scanned', response.data)
        self.assertIn('hazards_detected', response.data)
        self.assertIn('critical_segments', response.data)
        self.assertIn('maintenance_priority', response.data)

    def test_maintenance_priority(self):
        response = self.client.get('/api/roads/maintenance-priority/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)
