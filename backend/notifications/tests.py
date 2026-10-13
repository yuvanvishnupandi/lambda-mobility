from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import Alert
from .services import AlertService

class AlertTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='operator', password='password', role='OPERATOR')
        self.client.force_authenticate(user=self.user)

        self.alert = Alert.objects.create(
            alert_type='POTHOLE',
            severity='HIGH',
            title='Severe Pothole Detected',
            message='Pothole detected on SG Highway',
            location='SG Highway',
            confidence=0.94
        )

    def test_list_alerts(self):
        response = self.client.get('/api/alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_mark_alert_read(self):
        response = self.client.patch(f'/api/alerts/{self.alert.id}/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alert.refresh_from_db()
        self.assertTrue(self.alert.is_read)

    def test_acknowledge_alert(self):
        response = self.client.post(f'/api/alerts/{self.alert.id}/acknowledge/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alert.refresh_from_db()
        self.assertTrue(self.alert.acknowledged)
        self.assertIsNotNone(self.alert.acknowledged_at)
