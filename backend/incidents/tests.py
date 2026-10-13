from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from fleet.models import Bus
from .models import Incident
from .services import IncidentService

class IncidentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='operator', password='password', role='OPERATOR')
        self.client.force_authenticate(user=self.user)

        self.bus = Bus.objects.create(bus_id='BUS-104', registration_number='GJ01XX104', status='ONLINE')
        self.incident = Incident.objects.create(
            incident_type='HIT_AND_RUN',
            severity='CRITICAL',
            bus=self.bus,
            location='SG Highway',
            latitude=23.0395,
            longitude=72.5667,
            confidence=0.964,
            status='OPEN'
        )

    def test_list_and_filter_incidents(self):
        response = self.client.get('/api/incidents/?severity=CRITICAL&status=OPEN')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_resolve_incident(self):
        response = self.client.post(f'/api/incidents/{self.incident.id}/resolve/', {
            'resolution_notes': 'Traffic police intercepted vehicle at Sarkhej Cross Road.'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.incident.refresh_from_db()
        self.assertEqual(self.incident.status, 'RESOLVED')
        self.assertIsNotNone(self.incident.resolved_at)

    def test_hit_and_run_workflow(self):
        incident = IncidentService.process_hit_and_run_detection(
            bus=self.bus,
            latitude=23.0450,
            longitude=72.5700,
            vehicle_registration='GJ01XX4821',
            location_name='SG Highway'
        )
        self.assertEqual(incident.incident_type, 'HIT_AND_RUN')
        self.assertEqual(incident.severity, 'CRITICAL')
        self.assertIn('GJ01XX4821', str(incident.vehicle_info))
