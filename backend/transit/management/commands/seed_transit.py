from django.core.management.base import BaseCommand
from transit.services.sync_service import SyncService

class Command(BaseCommand):
    help = 'Seeds complete Ahmedabad Unified Transit Network (Metro, BRTS, AMTS, Landmarks, Fares, Transfers)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Synchronizing Ahmedabad Transit Data..."))
        stats = SyncService.sync_all()
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded Ahmedabad Transit Data: {stats}"))
