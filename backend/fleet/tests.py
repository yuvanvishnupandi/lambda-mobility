from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import Bus, BusRoute

class FleetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='op', password='password', role='OPERATOR')
        self.client.force_authenticate(user=self.user)

        self.route = BusRoute.objects.create(
            route_number='18',
            route_name='SG Highway Trunk',
            start_location='Sarkhej',
            end_location='Gandhinagar'
        )
        self.bus = Bus.objects.create(
            bus_id='BUS-104',
            registration_number='GJ01XX1040',
            route=self.route,
            status='ONLINE',
            latitude=23.0395,
            longitude=72.5667,
            speed=42.0
        )

    def test_list_buses(self):
        response = self.client.get('/api/fleet/buses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_filter_bus_by_status(self):
        response = self.client.get('/api/fleet/buses/?status=ONLINE')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['bus_id'], 'BUS-104')

    def test_update_bus_location(self):
        response = self.client.post(f'/api/fleet/buses/{self.bus.id}/location/', {
            'latitude': 23.0500,
            'longitude': 72.5800,
            'speed': 35.0,
            'heading': 180.0,
            'location_name': 'Pakwan Cross Road'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bus.refresh_from_db()
        self.assertEqual(self.bus.latitude, 23.0500)
        self.assertEqual(self.bus.speed, 35.0)

    def test_bus_location_history(self):
        self.client.post(f'/api/fleet/buses/{self.bus.id}/location/', {
            'latitude': 23.0510,
            'longitude': 72.5810,
            'speed': 40.0
        })
        response = self.client.get(f'/api/fleet/buses/{self.bus.id}/location-history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)
