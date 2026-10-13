from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import User

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testoperator',
            password='Password123!',
            email='test@example.com',
            role='OPERATOR'
        )

    def test_login_success(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testoperator',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'OPERATOR')

    def test_login_failure(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testoperator',
            'password': 'WrongPassword'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_current_user_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], 'testoperator')
