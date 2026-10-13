"""
Course: 21CSC314P - Big Data Essentials
Unit 1 & Unit 2: HDFS Distributed Storage Architecture & Hadoop MapReduce Framework
Corridor: Tamil Nadu · Chengalpattu District · Potheri Central Sector (GST Road NH 45)

Modules Covered:
- Unit 1: HDFS Architecture (NameNode, DataNode, Block Allocation, Replication=3,
  Rack Awareness, HDFS Shell Commands)
- Unit 2: Hadoop MapReduce (Custom Mapper, Combiner Optimization, Hash Partitioner,
  Shuffle & Sort, Reducer Aggregations)
"""

import os
import csv
import json
import hashlib
from typing import Dict, List, Tuple, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR) if os.path.basename(CURRENT_DIR) == "pipelines" else CURRENT_DIR
DATASET_PATH = os.path.join(BASE_DIR, "data", "Traffic.csv.xls")
HDFS_ROOT = os.path.join(BASE_DIR, "storage", "hdfs_storage")


# ==============================================================================
# UNIT 1: HADOOP DISTRIBUTED FILE SYSTEM (HDFS) ARCHITECTURE
# ==============================================================================

class HDFSNameNode:
    """
    Simulates the HDFS NameNode metadata manager:
    Maintains the fsimage, EditLog, block-to-DataNode mappings, and rack awareness.
    """
    def __init__(self, replication_factor: int = 3, block_size_records: int = 25):
        self.replication_factor = replication_factor
        self.block_size_records = block_size_records
        self.namespace: Dict[str, Dict[str, Any]] = {}
        self.block_map: Dict[str, List[str]] = {}
        self.datanodes = [
            {"id": "DataNode-01", "rack": "/rack1/potheri-central"},
            {"id": "DataNode-02", "rack": "/rack1/cybervale-techpark"},
            {"id": "DataNode-03", "rack": "/rack2/chengalpattu-central"},
            {"id": "DataNode-04", "rack": "/rack2/maraimalai-nagar"}
        ]

    def mkdir(self, hdfs_path: str) -> bool:
        self.namespace[hdfs_path] = {"type": "DIRECTORY", "children": []}
        return True

    def put_file(self, local_records: List[Dict[str, Any]], hdfs_path: str) -> int:
        total_records = len(local_records)
        num_blocks = (total_records + self.block_size_records - 1) // self.block_size_records

        block_ids = []
        for b_idx in range(num_blocks):
            start = b_idx * self.block_size_records
            end = min(start + self.block_size_records, total_records)
            block_records = local_records[start:end]

            block_id = f"blk_{hashlib.md5(f'{hdfs_path}_{b_idx}'.encode()).hexdigest()[:10]}"
            block_ids.append(block_id)

            # Rack-aware replica placement across DataNodes (Replication Factor = 3)
            replicas = [self.datanodes[0]["id"], self.datanodes[1]["id"], self.datanodes[2]["id"]]
            self.block_map[block_id] = replicas

            # Persist block segment in simulated HDFS partition storage
            block_dir = os.path.join(HDFS_ROOT, "blocks", block_id)
            os.makedirs(block_dir, exist_ok=True)
            with open(os.path.join(block_dir, "data.json"), "w", encoding="utf-8") as bf:
                json.dump(block_records, bf)

        self.namespace[hdfs_path] = {
            "type": "FILE",
            "size_records": total_records,
            "blocks": block_ids,
            "replication": self.replication_factor
        }
        return num_blocks

    def list_status(self, hdfs_path: str) -> Dict[str, Any]:
        return self.namespace.get(hdfs_path, {})


# ==============================================================================
# UNIT 2: HADOOP MAPREDUCE DISTRIBUTED COMPUTATION
# ==============================================================================

class TrafficMapper:
    """
    Map Phase: Emits intermediate (key, value) pairs.
    Key: Time Hour (e.g., 'HOUR_17' for 5 PM)
    Value: Modality vector [cars, bikes, buses, trucks, total]
    """
    def map(self, record: Dict[str, Any]) -> Tuple[str, List[int]]:
        time_str = record.get("Time", "12:00:00 AM").strip()
        parts = time_str.split(":")
        raw_hour = int(parts[0]) if parts[0].isdigit() else 0

        is_pm = "PM" in time_str.upper()
        if is_pm and raw_hour != 12:
            hour_24 = raw_hour + 12
        elif not is_pm and raw_hour == 12:
            hour_24 = 0
        else:
            hour_24 = raw_hour

        hour_key = f"HOUR_{hour_24:02d}"
        metrics = [
            int(record.get("CarCount", 0) or 0),
            int(record.get("BikeCount", 0) or 0),
            int(record.get("BusCount", 0) or 0),
            int(record.get("TruckCount", 0) or 0),
            int(record.get("Total", 0) or 0)
        ]
        return hour_key, metrics


class TrafficCombiner:
    """
    Combiner Phase: Local aggregation on mapper nodes to reduce network I/O transfer.
    """
    def combine(self, map_outputs: List[Tuple[str, List[int]]]) -> Dict[str, List[List[int]]]:
        combined: Dict[str, List[List[int]]] = {}
        for k, v in map_outputs:
            if k not in combined:
                combined[k] = []
            combined[k].append(v)
        return combined


class TrafficPartitioner:
    """
    Partitioner Phase: Distributes keys across Reducer tasks using consistent hashing.
    """
    def __init__(self, num_reducers: int = 4):
        self.num_reducers = num_reducers

    def get_partition(self, key: str) -> int:
        return int(hashlib.md5(key.encode()).hexdigest(), 16) % self.num_reducers


class TrafficReducer:
    """
    Reduce Phase: Aggregates intermediate values per key to calculate final metrics.
    Computes total vehicles, modality breakdown, and average hourly traffic density.
    """
    def reduce(self, key: str, values: List[List[int]]) -> Dict[str, Any]:
        count = len(values)
        if count == 0:
            return {}

        total_cars = sum(v[0] for v in values)
        total_bikes = sum(v[1] for v in values)
        total_buses = sum(v[2] for v in values)
        total_trucks = sum(v[3] for v in values)
        total_vehicles = sum(v[4] for v in values)

        avg_density = round(total_vehicles / count, 2)
        hour_int = int(key.split("_")[1])
        hour_label = f"{hour_int:02d}:00"

        return {
            "HourKey": key,
            "Hour": hour_label,
            "TotalVehicles": total_vehicles,
            "CarCount": total_cars,
            "BikeCount": total_bikes,
            "BusCount": total_buses,
            "TruckCount": total_trucks,
            "SampleObservations": count,
            "AvgHourlyDensity": avg_density
        }


def run_hdfs_mapreduce_pipeline():
    print("=" * 80)
    print(" [BDE UNIT 1 & 2] HDFS INGESTION & HADOOP MAPREDUCE EXECUTION PIPELINE")
    print("=" * 80)

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Traffic dataset missing at: {DATASET_PATH}")

    # 1. Load Raw Dataset
    records = []
    with open(DATASET_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            records.append(row)
    print(f"[*] Loaded raw source records: {len(records):,} rows from {DATASET_PATH}")

    # 2. HDFS Ingestion
    os.makedirs(HDFS_ROOT, exist_ok=True)
    namenode = HDFSNameNode(replication_factor=3, block_size_records=25)
    namenode.mkdir("/hdfs/urban_traffic")
    num_blocks = namenode.put_file(records, "/hdfs/urban_traffic/traffic_sensor_data.csv")

    # Save NameNode FSImage Metadata
    fsimage_path = os.path.join(HDFS_ROOT, "namenode_fsimage.json")
    with open(fsimage_path, "w", encoding="utf-8") as fsf:
        json.dump({
            "cluster": "LAMBDA-BDE-HADOOP-CLUSTER-01",
            "corridor": "GST Road (NH 45) - Potheri Central Sector",
            "replication_factor": 3,
            "total_blocks_allocated": num_blocks,
            "namespace": namenode.namespace,
            "block_mappings_sample": {k: namenode.block_map[k] for k in list(namenode.block_map.keys())[:5]}
        }, fsf, indent=2)

    print(f"[+] HDFS NameNode initialized: Allocated {num_blocks} data blocks with Replication Factor 3.")
    print("[+] Simulated HDFS commands executed:")
    print("    $ hdfs dfs -mkdir -p /hdfs/urban_traffic")
    print("    $ hdfs dfs -put Traffic.csv.xls /hdfs/urban_traffic/")
    print(f"    $ hdfs dfs -ls /hdfs/urban_traffic/ -> {num_blocks} blocks confirmed.")

    # 3. Map Phase
    mapper = TrafficMapper()
    map_outputs = [mapper.map(r) for r in records]
    print(f"[*] Map Phase: Emitted {len(map_outputs):,} intermediate (K, V) pairs.")

    # 4. Combiner & Partitioner Phase
    combiner = TrafficCombiner()
    partitioner = TrafficPartitioner(num_reducers=4)
    partition_distribution = {i: 0 for i in range(4)}
    for k, _ in map_outputs:
        p_id = partitioner.get_partition(k)
        partition_distribution[p_id] += 1
    print(f"[*] Partitioner: Distributed across 4 reducers: {partition_distribution}")

    grouped = combiner.combine(map_outputs)

    # 5. Reduce Phase
    reducer = TrafficReducer()
    reduced_results = []
    for k in sorted(grouped.keys()):
        reduced_results.append(reducer.reduce(k, grouped[k]))

    # Persist Final MapReduce JSON output
    output_path = os.path.join(HDFS_ROOT, "mapreduce_output_hourly.json")
    with open(output_path, "w", encoding="utf-8") as outf:
        json.dump(reduced_results, outf, indent=2)

    print(f"[+] MapReduce Job Completed: Results saved to {output_path}")
    print("\n" + "-" * 75)
    print(f"{'Hour':<10} | {'Total Vehicles':<16} | {'Cars':<10} | {'Bikes':<10} | {'Avg Density':<12}")
    print("-" * 75)
    for res in reduced_results[:8]:
        print(f"{res['Hour']:<10} | {res['TotalVehicles']:<16} | "
              f"{res['CarCount']:<10} | {res['BikeCount']:<10} | {res['AvgHourlyDensity']:<12}")
    print("-" * 75)
    return reduced_results


if __name__ == "__main__":
    run_hdfs_mapreduce_pipeline()
