"""
Course: 21CSC314P - Big Data Essentials
Lab 6 / Advanced Technique: NoSQL Document Store & High-Velocity Telemetry Store
Simulates MongoDB / Apache Cassandra document persistence for edge camera telemetry.
Corridor: Tamil Nadu · Chengalpattu District · Potheri Central Sector (GST Road NH 45)
"""

import os
import json
import time
from typing import Dict, List, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR) if os.path.basename(CURRENT_DIR) == "pipelines" else CURRENT_DIR
NOSQL_DATA_PATH = os.path.join(BASE_DIR, "storage", "nosql_telemetry_store.json")


class NoSQLDocumentStore:
    """
    Simulates a MongoDB / Cassandra NoSQL document store with BSON-like document collections,
    secondary indexing on (sensor_id, timestamp), and real-time geospatial document lookups.
    """
    def __init__(self, collection_name: str = "urban_sensor_telemetry"):
        self.collection_name = collection_name
        self.documents: List[Dict[str, Any]] = []
        self.index_by_sensor: Dict[str, List[int]] = {}

    def insert_one(self, doc: Dict[str, Any]) -> str:
        doc_id = f"doc_{int(time.time() * 1000)}_{len(self.documents)}"
        doc["_id"] = doc_id
        doc["created_at_iso"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        doc_idx = len(self.documents)
        self.documents.append(doc)

        s_id = doc.get("sensor_id", "default")
        if s_id not in self.index_by_sensor:
            self.index_by_sensor[s_id] = []
        self.index_by_sensor[s_id].append(doc_idx)
        return doc_id

    def insert_many(self, docs: List[Dict[str, Any]]) -> int:
        for d in docs:
            self.insert_one(d)
        self.persist()
        return len(docs)

    def find_by_sensor(self, sensor_id: str) -> List[Dict[str, Any]]:
        indices = self.index_by_sensor.get(sensor_id, [])
        return [self.documents[i] for i in indices]

    def aggregate_corridor_kpis(self) -> Dict[str, Any]:
        if not self.documents:
            return {"total_docs": 0, "avg_vehicles": 0}
        total_veh = sum(d.get("total_vehicles", 0) for d in self.documents)
        return {
            "collection": self.collection_name,
            "total_documents": len(self.documents),
            "indexed_sensors": len(self.index_by_sensor),
            "total_vehicles_logged": total_veh,
            "average_density_per_event": round(total_veh / max(len(self.documents), 1), 2)
        }

    def persist(self):
        with open(NOSQL_DATA_PATH, "w", encoding="utf-8") as f:
            json.dump({
                "collection": self.collection_name,
                "stats": self.aggregate_corridor_kpis(),
                "documents": self.documents[-100:]  # Keep last 100 for fast serving
            }, f, indent=2)


def run_nosql_pipeline():
    print("=" * 80)
    print(" [BDE LAB 6 / ADVANCED NOSQL] MONGODB / CASSANDRA DOCUMENT TELEMETRY STORE")
    print("=" * 80)
    store = NoSQLDocumentStore()

    # Ingest sample live edge telemetry documents for GST Road corridor
    sample_docs = [
        {
            "sensor_id": "IOT-CAM-GST-1",
            "corridor": "GST Road (NH 45) - Potheri Central Interchange",
            "total_vehicles": 185,
            "speed_avg_kmh": 38,
            "coordinates": [12.8231, 80.0444]
        },
        {
            "sensor_id": "IOT-CAM-GDV-2",
            "corridor": "GST Road (NH 45) - Guduvanchery",
            "total_vehicles": 114,
            "speed_avg_kmh": 42,
            "coordinates": [12.8465, 80.0610]
        },
        {
            "sensor_id": "IOT-CAM-MMN-3",
            "corridor": "GST Road (NH 45) - Maraimalai Nagar",
            "total_vehicles": 53,
            "speed_avg_kmh": 50,
            "coordinates": [12.7980, 80.0240]
        },
        {
            "sensor_id": "IOT-CAM-SPK-4",
            "corridor": "GST Road (NH 45) - Singaperumal Koil",
            "total_vehicles": 143,
            "speed_avg_kmh": 35,
            "coordinates": [12.7630, 79.9980]
        },
        {
            "sensor_id": "IOT-CAM-CGL-5",
            "corridor": "GST Road (NH 45) - Chengalpattu Toll",
            "total_vehicles": 194,
            "speed_avg_kmh": 28,
            "coordinates": [12.7230, 79.9910]
        }
    ]
    inserted = store.insert_many(sample_docs)
    kpis = store.aggregate_corridor_kpis()
    print(f"[+] Ingested {inserted} NoSQL telemetry documents into '{store.collection_name}'.")
    print(
        f"    Total Documents: {kpis['total_documents']} | "
        f"Avg Density: {kpis['average_density_per_event']} vehicles/sensor"
    )
    print(f"[+] Document store persisted to: {NOSQL_DATA_PATH}")
    print("=" * 80)
    return kpis


if __name__ == "__main__":
    run_nosql_pipeline()
