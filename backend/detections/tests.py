from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from fleet.models import Bus
from .models import Detection

class DetectionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='analyst', password='password', role='ANALYST')
        self.client.force_authenticate(user=self.user)

        self.bus = Bus.objects.create(
            bus_id='BUS-104',
            registration_number='GJ01XX104',
            status='ONLINE',
            latitude=23.0395,
            longitude=72.5667
        )

    def test_create_detection(self):
        response = self.client.post('/api/detections/', {
            'bus_id': 'BUS-104',
            'detection_type': 'POTHOLE',
            'confidence': 0.94,
            'latitude': 23.0395,
            'longitude': 72.5667,
            'metadata': {
                'severity': 'HIGH',
                'road': 'SG Highway'
            }
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['type'], 'POTHOLE')
        self.assertEqual(response.data['busId'], 'BUS-104')
        self.assertAlmostEqual(response.data['confidence'], 0.94)

    def test_list_and_filter_detections(self):
        Detection.objects.create(
            bus=self.bus,
            detection_type='POTHOLE',
            confidence=0.92,
            severity='HIGH',
            latitude=23.0395,
            longitude=72.5667,
            location_name='SG Highway'
        )
        response = self.client.get('/api/detections/?detection_type=POTHOLE')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
