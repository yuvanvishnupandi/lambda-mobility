# AI Inference Interfaces
from .detection_service import EdgeAIDetectionEngine
from .anpr_service import ANPRServiceEngine
from .tracking_service import VehicleTrackingEngine

__all__ = [
    'EdgeAIDetectionEngine',
    'ANPRServiceEngine',
    'VehicleTrackingEngine',
]
