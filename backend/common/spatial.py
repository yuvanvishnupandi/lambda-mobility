import math

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees), returned in meters.
    """
    if None in (lat1, lon1, lat2, lon2):
        return 0.0

    r = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

def is_point_in_radius(lat1: float, lon1: float, lat2: float, lon2: float, radius_meters: float) -> bool:
    """Check if point2 is within radius_meters of point1."""
    return haversine_distance_meters(lat1, lon1, lat2, lon2) <= radius_meters

def format_coords_to_geojson(latitude: float, longitude: float):
    """Returns a GeoJSON Point representation."""
    return {
        "type": "Point",
        "coordinates": [longitude, latitude]
    }
