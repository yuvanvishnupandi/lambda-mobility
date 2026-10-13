from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User

class DashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='viewer', password='password', role='VIEWER')
        self.client.force_authenticate(user=self.user)

    def test_dashboard_summary(self):
        response = self.client.get('/api/dashboard/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('active_buses', response.data)
        self.assertIn('online_buses', response.data)
        self.assertIn('ai_detections_today', response.data)
        self.assertIn('road_hazards', response.data)
        self.assertIn('open_incidents', response.data)
        self.assertIn('critical_alerts', response.data)
        self.assertIn('average_confidence', response.data)

    def test_live_alerts(self):
        response = self.client.get('/api/dashboard/live-alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_demo_status(self):
        response = self.client.get('/api/dashboard/demo/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('is_running', response.data)
