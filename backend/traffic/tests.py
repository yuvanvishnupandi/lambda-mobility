from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import TrafficObservation

class TrafficTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='analyst', password='password', role='ANALYST')
        self.client.force_authenticate(user=self.user)

        self.obs = TrafficObservation.objects.create(
            location='SG Highway',
            vehicle_count=842,
            car_count=450,
            bus_count=30,
            truck_count=22,
            two_wheeler_count=300,
            auto_count=40,
            average_speed=34.0,
            congestion_level='HEAVY',
            congestion_index=67
        )

    def test_traffic_current(self):
        response = self.client.get('/api/traffic/current/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_traffic_summary(self):
        response = self.client.get('/api/traffic/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('average_speed', response.data)
        self.assertIn('congestion_index', response.data)

    def test_vehicle_classification(self):
        response = self.client.get('/api/traffic/vehicle-classification/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
