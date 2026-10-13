from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User

class AnalyticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='analyst', password='password', role='ANALYST')
        self.client.force_authenticate(user=self.user)

    def test_analytics_detections(self):
        response = self.client.get('/api/analytics/detections/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('daily_trend', response.data)

    def test_analytics_traffic(self):
        response = self.client.get('/api/analytics/traffic/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('hourly_density', response.data)

    def test_analytics_route_delays(self):
        response = self.client.get('/api/analytics/route-delays/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_analytics_insights(self):
        response = self.client.get('/api/analytics/insights/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('insights', response.data)
        self.assertTrue(len(response.data['insights']) > 0)
