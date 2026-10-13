from abc import ABC, abstractmethod
from typing import List, Dict, Any

class TransportProviderBase(ABC):
    """Abstract interface for all Ahmedabad transit providers (Metro, BRTS, AMTS, OSM)."""

    @abstractmethod
    def get_agency_info(self) -> Dict[str, Any]:
        """Return agency metadata."""
        pass

    @abstractmethod
    def get_stops(self) -> List[Dict[str, Any]]:
        """Return list of stops with exact coordinates and attributes."""
        pass

    @abstractmethod
    def get_routes(self) -> List[Dict[str, Any]]:
        """Return list of routes and line metadata."""
        pass

    @abstractmethod
    def get_route_stops(self) -> List[Dict[str, Any]]:
        """Return stop sequences for each route."""
        pass

    @abstractmethod
    def get_transfers(self) -> List[Dict[str, Any]]:
        """Return inter-modal or intra-station transfer links."""
        pass

    @abstractmethod
    def get_fare_rules(self) -> Dict[str, Any]:
        """Return fare structure rules."""
        pass

    @abstractmethod
    def get_vehicles(self) -> List[Dict[str, Any]]:
        """Return active fleet vehicles."""
        pass

    @abstractmethod
    def get_service_alerts(self) -> List[Dict[str, Any]]:
        """Return active alerts and disruptions."""
        pass
