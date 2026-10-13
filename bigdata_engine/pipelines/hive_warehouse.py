"""
Course: 21CSC314P - Big Data Essentials
Unit 3: Apache Hive Architecture & HiveQL Data Warehouse Engine
Corridor: Tamil Nadu · Chengalpattu District · SRM IST Kattankulathur (GST Road NH 45)

Modules Covered:
- Unit 3: Apache Hive Metastore, Table DDL (Managed vs External), Partitioning,
  Bucketing, HiveQL Analytics & Window Functions
"""

import os
import sqlite3
import csv
from typing import Dict, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR) if os.path.basename(CURRENT_DIR) == "pipelines" else CURRENT_DIR
DATASET_PATH = os.path.join(BASE_DIR, "data", "Traffic.csv.xls")
HIVE_DB_PATH = os.path.join(BASE_DIR, "storage", "hive_metastore.db")


class HiveDataWarehouse:
    """
    Simulates Apache Hive Metastore & HiveQL Query Execution Engine.
    Employs an embedded SQLite metastore backend executing standard HiveQL query patterns.
    """
    def __init__(self, db_path: str = HIVE_DB_PATH):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self._init_schema()

    def _init_schema(self):
        cursor = self.conn.cursor()

        # 1. Hive Managed Table (DDL)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hive_urban_traffic (
            record_id INTEGER PRIMARY KEY AUTOINCREMENT,
            time_slot TEXT NOT NULL,
            traffic_date TEXT NOT NULL,
            day_of_week TEXT NOT NULL,
            car_count INTEGER NOT NULL,
            bike_count INTEGER NOT NULL,
            bus_count INTEGER NOT NULL,
            truck_count INTEGER NOT NULL,
            total_vehicles INTEGER NOT NULL,
            traffic_situation TEXT NOT NULL
        );
        """)

        # 2. Simulated Hive Partitioned Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hive_traffic_partitioned (
            record_id INTEGER PRIMARY KEY AUTOINCREMENT,
            time_slot TEXT NOT NULL,
            day_of_week TEXT NOT NULL,
            car_count INTEGER NOT NULL,
            bike_count INTEGER NOT NULL,
            bus_count INTEGER NOT NULL,
            truck_count INTEGER NOT NULL,
            total_vehicles INTEGER NOT NULL,
            traffic_situation TEXT NOT NULL,
            partition_date TEXT NOT NULL
        );
        """)

        # 3. Metastore Catalog Metadata
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hive_metastore_catalog (
            table_name TEXT PRIMARY KEY,
            table_type TEXT,
            owner TEXT,
            location TEXT,
            num_partitions INTEGER,
            num_buckets INTEGER
        );
        """)

        cursor.execute("""
        INSERT OR REPLACE INTO hive_metastore_catalog VALUES
        ('hive_urban_traffic', 'MANAGED_TABLE', 'bde_admin',
         '/apps/hive/warehouse/hive_urban_traffic', 0, 0),
        ('hive_traffic_partitioned', 'PARTITIONED_TABLE', 'bde_admin',
         '/apps/hive/warehouse/hive_traffic_partitioned', 31, 4);
        """)

        self.conn.commit()

    def load_dataset(self, csv_path: str = DATASET_PATH) -> int:
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Dataset missing at {csv_path}")

        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM hive_urban_traffic")
        count = cursor.fetchone()[0]
        if count > 0:
            return count

        records = []
        part_records = []
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for r in reader:
                time_slot = r["Time"].strip()
                t_date = r["Date"].strip()
                day_w = r["Day of the week"].strip()
                cars = int(r.get("CarCount", 0) or 0)
                bikes = int(r.get("BikeCount", 0) or 0)
                buses = int(r.get("BusCount", 0) or 0)
                trucks = int(r.get("TruckCount", 0) or 0)
                total = int(r.get("Total", 0) or 0)
                sit = r["Traffic Situation"].strip().lower()

                records.append((time_slot, t_date, day_w, cars, bikes, buses, trucks, total, sit))
                part_records.append((time_slot, day_w, cars, bikes, buses, trucks, total, sit, t_date))

        cursor.executemany("""
        INSERT INTO hive_urban_traffic
        (time_slot, traffic_date, day_of_week, car_count, bike_count,
         bus_count, truck_count, total_vehicles, traffic_situation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, records)

        cursor.executemany("""
        INSERT INTO hive_traffic_partitioned
        (time_slot, day_of_week, car_count, bike_count, bus_count,
         truck_count, total_vehicles, traffic_situation, partition_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, part_records)

        self.conn.commit()
        return len(records)

    def execute_analytical_queries(self) -> Dict[str, Any]:
        cursor = self.conn.cursor()

        # Query 1: Top 5 Peak Congestion Slots (HiveQL GROUP BY & Aggregation)
        cursor.execute("""
        SELECT time_slot, ROUND(AVG(total_vehicles), 2) as avg_vol, COUNT(*) as observations
        FROM hive_urban_traffic
        GROUP BY time_slot
        ORDER BY avg_vol DESC
        LIMIT 5;
        """)
        peak_slots = [dict(row) for row in cursor.fetchall()]

        # Query 2: Day-wise Traffic Situation Breakdown
        cursor.execute("""
        SELECT day_of_week, traffic_situation, COUNT(*) as incident_count
        FROM hive_urban_traffic
        GROUP BY day_of_week, traffic_situation
        ORDER BY day_of_week, incident_count DESC;
        """)
        day_breakdown = [dict(row) for row in cursor.fetchall()]

        # Query 3: Modality Totals & Fleet Share
        cursor.execute("""
        SELECT
            SUM(car_count) as total_cars,
            SUM(bike_count) as total_bikes,
            SUM(bus_count) as total_buses,
            SUM(truck_count) as total_trucks,
            SUM(total_vehicles) as grand_total
        FROM hive_urban_traffic;
        """)
        totals = dict(cursor.fetchone())

        # Query 4: Hive Window Function Simulation (Ranking peak hours per day)
        cursor.execute("""
        WITH HourlyRankings AS (
            SELECT
                day_of_week,
                time_slot,
                total_vehicles,
                ROW_NUMBER() OVER (PARTITION BY day_of_week ORDER BY total_vehicles DESC) as rank_in_day
            FROM hive_urban_traffic
        )
        SELECT day_of_week, time_slot, total_vehicles, rank_in_day
        FROM HourlyRankings
        WHERE rank_in_day = 1
        ORDER BY total_vehicles DESC;
        """)
        top_peak_per_day = [dict(row) for row in cursor.fetchall()]

        return {
            "peak_slots": peak_slots,
            "day_breakdown": day_breakdown,
            "modality_totals": totals,
            "top_peak_per_day": top_peak_per_day
        }


def run_hive_warehouse_pipeline():
    print("=" * 80)
    print(" [BDE UNIT 3] APACHE HIVE METASTORE & HIVEQL DATA WAREHOUSE PIPELINE")
    print("=" * 80)
    warehouse = HiveDataWarehouse()
    loaded = warehouse.load_dataset()
    print(f"[+] Hive Warehouse online: {loaded:,} records stored in table 'hive_urban_traffic'.")

    analytics = warehouse.execute_analytical_queries()

    print("\n[*] HiveQL Query 1: Top 5 Peak Congestion Slots (GROUP BY & AVG Aggregation)")
    print(f"{'Time Slot':<16} | {'Avg Volume':<12} | {'Observations':<12}")
    print("-" * 45)
    for s in analytics["peak_slots"]:
        print(f"{s['time_slot']:<16} | {s['avg_vol']:<12} | {s['observations']:<12}")

    print("\n[*] HiveQL Query 2: Modality Fleet Volume Aggregation")
    tot = analytics["modality_totals"]
    print(f"    Cars: {tot['total_cars']:,} | Bikes: {tot['total_bikes']:,} | "
          f"Buses: {tot['total_buses']:,} | Trucks: {tot['total_trucks']:,}")
    print(f"    Grand Total Vehicles Recorded: {tot['grand_total']:,}")

    print("\n[*] HiveQL Query 4: Window Functions (ROW_NUMBER() OVER PARTITION BY day_of_week)")
    for r in analytics["top_peak_per_day"][:4]:
        print(f"    {r['day_of_week']:<10} -> Peak Slot: {r['time_slot']:<12} | Peak Vehicles: {r['total_vehicles']}")

    print("=" * 80)
    return analytics


if __name__ == "__main__":
    run_hive_warehouse_pipeline()
