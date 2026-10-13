"""
Course: 21CSC314P - Big Data Essentials
Unit 4 / Lab 7: Apache Kafka Distributed Message Broker & Streaming Ingestion Engine
Corridor: Tamil Nadu · Chengalpattu District · Potheri Central Sector (GST Road NH 45)

Modules Covered:
- Unit 4: Kafka Broker (Port 9092), Topics, Key-Based Partitions, Producers, Consumers, Consumer Groups & Offsets
"""

import os
import csv
import json
import time
import hashlib
from typing import Dict, List, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR) if os.path.basename(CURRENT_DIR) == "pipelines" else CURRENT_DIR
DATASET_PATH = os.path.join(BASE_DIR, "data", "Traffic.csv.xls")
KAFKA_STREAM_BUFFER = os.path.join(BASE_DIR, "storage", "kafka_stream_buffer.json")


class KafkaBrokerSimulation:
    """
    Simulates Apache Kafka Distributed Streaming Broker (Bootstrap: localhost:9092)
    Manages topics, key partitioning, and consumer group offset commitments.
    """
    def __init__(self, topic: str = "urban-traffic-telemetry", num_partitions: int = 5):
        self.topic = topic
        self.num_partitions = num_partitions
        self.partitions: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(num_partitions)}
        self.consumer_offsets: Dict[str, Dict[int, int]] = {}

        self.sector_partition_keys = [
            "Sector-Potheri-Central-GST",
            "Sector-Guduvanchery-Junction",
            "Sector-Maraimalai-Nagar-Ford",
            "Sector-Singaperumal-Koil",
            "Sector-Chengalpattu-Toll-Paranur"
        ]

    def _get_partition(self, key: str) -> int:
        return int(hashlib.md5(key.encode()).hexdigest(), 16) % self.num_partitions

    def produce(self, message: Dict[str, Any]) -> int:
        part_key = message.get("partition_key", self.sector_partition_keys[0])
        partition_id = self._get_partition(part_key)
        message["offset"] = len(self.partitions[partition_id])
        message["broker_timestamp_ms"] = int(time.time() * 1000)
        message["partition_id"] = partition_id
        self.partitions[partition_id].append(message)
        return partition_id

    def consume(self, group_id: str = "bde-traffic-analytics-group", batch_size: int = 10) -> List[Dict[str, Any]]:
        if group_id not in self.consumer_offsets:
            self.consumer_offsets[group_id] = {i: 0 for i in range(self.num_partitions)}

        consumed = []
        for p_id in range(self.num_partitions):
            current_offset = self.consumer_offsets[group_id][p_id]
            available = self.partitions[p_id][current_offset:current_offset + batch_size]
            consumed.extend(available)
            self.consumer_offsets[group_id][p_id] += len(available)

        return consumed


class KafkaTrafficStreamEngine:
    """
    High-level Kafka streaming pipeline producer & micro-batch generator.
    """
    def __init__(self):
        self.broker = KafkaBrokerSimulation()

    def generate_streaming_batch(self, batch_size: int = 15) -> List[Dict[str, Any]]:
        if not os.path.exists(DATASET_PATH):
            raise FileNotFoundError(f"Dataset missing at {DATASET_PATH}")

        produced_records = []
        with open(DATASET_PATH, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, r in enumerate(reader):
                if idx >= batch_size:
                    break
                sec_key = self.broker.sector_partition_keys[idx % len(self.broker.sector_partition_keys)]
                event = {
                    "topic": self.broker.topic,
                    "partition_key": sec_key,
                    "sensor_id": f"IOT-CAM-GST-{101 + (idx % 12)}",
                    "corridor": "GST Road (NH 45) - Chengalpattu Corridor",
                    "timestamp": r["Time"].strip(),
                    "date": r["Date"].strip(),
                    "day_of_week": r["Day of the week"].strip(),
                    "car_count": int(r.get("CarCount", 0) or 0),
                    "bike_count": int(r.get("BikeCount", 0) or 0),
                    "bus_count": int(r.get("BusCount", 0) or 0),
                    "truck_count": int(r.get("TruckCount", 0) or 0),
                    "total_vehicles": int(r.get("Total", 0) or 0),
                    "ground_truth_situation": r["Traffic Situation"].strip().lower()
                }
                self.broker.produce(event)
                produced_records.append(event)

        os.makedirs(os.path.dirname(KAFKA_STREAM_BUFFER), exist_ok=True)
        with open(KAFKA_STREAM_BUFFER, "w", encoding="utf-8") as f:
            json.dump(produced_records, f, indent=2)

        return produced_records


def run_kafka_streaming_pipeline():
    print("=" * 80)
    print(" [BDE UNIT 4 / LAB 7] APACHE KAFKA DISTRIBUTED STREAMING PIPELINE")
    print("=" * 80)
    engine = KafkaTrafficStreamEngine()
    batch = engine.generate_streaming_batch(batch_size=12)
    print(f"[+] Produced {len(batch)} IoT edge sensor telemetry events to Kafka topic '{engine.broker.topic}':")

    for evt in batch[:6]:
        print(f"    [Broker:9092] [P-{evt['partition_id']}] [{evt['partition_key']:<32}] "
              f"Sensor: {evt['sensor_id']} | Total: {evt['total_vehicles']} | Time: {evt['timestamp']}")

    print(f"[+] Kafka streaming events persisted to buffer: {KAFKA_STREAM_BUFFER}")
    print("=" * 80)
    return batch


if __name__ == "__main__":
    run_kafka_streaming_pipeline()
