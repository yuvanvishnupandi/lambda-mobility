"""
Modular Automatic Number Plate Recognition (ANPR) Interface.
Pluggable for EasyOCR, PaddleOCR, or custom license plate recognition pipelines.
"""
from typing import Dict, Any, Optional

class ANPRServiceEngine:
    """
    Simulates license plate detection, cropping, skew correction,
    and optical character recognition for Indian vehicle registrations.
    """

    def __init__(self, ocr_engine: Optional[str] = "mock"):
        self.ocr_engine = ocr_engine

    def recognize_plate(self, image_data: Any) -> Dict[str, Any]:
        """
        Process vehicle crop image and return recognized registration and confidence.
        """
        # Prototype deterministic result for prototype testing
        return {
            "registration_number": "TN19AZ4821",
            "confidence": 0.964,
            "vehicle_type": "White SUV",
            "state_code": "TN",
            "rto_code": "19",
            "series": "AZ",
            "number": "4821",
            "is_valid_format": True
        }

    def format_plate(self, raw_text: str) -> str:
        """Standardize Indian plate spacing and uppercase."""
        return raw_text.replace(" ", "").upper()
