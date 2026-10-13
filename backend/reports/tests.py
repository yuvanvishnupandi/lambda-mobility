from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from .models import DailyReport

class ReportTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='analyst', password='password', role='ANALYST')
        self.client.force_authenticate(user=self.user)

    def test_generate_and_list_reports(self):
        gen_res = self.client.post('/api/reports/generate/', {'date': '2026-09-08'})
        self.assertEqual(gen_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(str(gen_res.data['report']['report_date']), '2026-09-08')

        list_res = self.client.get('/api/reports/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(list_res.data['count'], 1)
