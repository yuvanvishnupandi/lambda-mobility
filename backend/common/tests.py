from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import SchoolZone

class CommonGISTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='viewer', password='password', role='VIEWER')
        self.client.force_authenticate(user=self.user)

        self.zone = SchoolZone.objects.create(
            name='DPS Ahmedabad Bopal',
            latitude=23.0330,
            longitude=72.4850,
            radius=300.0,
            risk_level='HIGH'
        )

    def test_map_all_endpoint(self):
        response = self.client.get('/api/map/all/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('buses', response.data)
        self.assertIn('hazards', response.data)
        self.assertIn('incidents', response.data)
        self.assertIn('traffic', response.data)
        self.assertIn('infrastructure', response.data)

    def test_school_zones_safety(self):
        response = self.client.get('/api/safety/school-zones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('school_zones', response.data)
        self.assertGreaterEqual(response.data['total_active_zones'], 1)
