from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from fleet.models import Bus
from .models import TrackedVehicle, VehicleDetection

class VehicleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='analyst', password='password', role='ANALYST')
        self.client.force_authenticate(user=self.user)

        self.bus = Bus.objects.create(bus_id='BUS-104', registration_number='TN19AZ104', status='ONLINE')
        self.vehicle = TrackedVehicle.objects.create(
            registration_number='TN19AZ4821',
            vehicle_type='White SUV',
            vehicle_color='White',
            confidence=0.964
        )
        self.sighting = VehicleDetection.objects.create(
            vehicle=self.vehicle,
            bus=self.bus,
            latitude=12.8231,
            longitude=80.0444,
            direction='Northbound',
            confidence=0.964,
            location_name='GST Road (NH 45)'
        )

    def test_search_vehicle_by_registration(self):
        response = self.client.get('/api/vehicles/search/?registration=TN19AZ4821')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['vehicle']['registration_number'], 'TN19AZ4821')
        self.assertGreaterEqual(len(response.data['route']), 1)

    def test_get_vehicle_route(self):
        response = self.client.get(f'/api/vehicles/{self.vehicle.id}/route/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('coordinates', response.data)
        self.assertIn('sightings', response.data)
