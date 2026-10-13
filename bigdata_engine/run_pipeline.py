"""
Course: 21CSC314P - Big Data Essentials
Master Pipeline Orchestrator: End-to-End Distributed Big Data Pipeline
Corridor: Tamil Nadu · Chengalpattu District & All 38 Districts (Potheri Central Sector)

Executes all 8 modules sequentially covering the entire BDE Lab syllabus:
1. HDFS Ingestion & Hadoop MapReduce (Units 1 & 2 / Labs 1-3)
2. Apache Hive Metastore & HiveQL Analytics (Unit 3 / Lab 9)
3. Apache Kafka Distributed Streaming (Unit 4 / Lab 7)
4. Apache Spark MLlib Classification & K-Means (Unit 4 / Labs 4-5)
5. Advanced NoSQL Document Store (Lab 6)
6. Apache Airflow ETL Pipeline Orchestration (Lab 10)
7. Tamil Nadu State-Wide Flood Big Data Preprocessing (Review 2 Slides 4-5)
8. Master Machine Learning Training & Evaluation Suite (Review 2 Slides 6-10)
"""

import os
import sys
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from pipelines.hdfs_mapreduce import run_hdfs_mapreduce_pipeline  # noqa: E402
from pipelines.hive_warehouse import run_hive_warehouse_pipeline  # noqa: E402
from pipelines.kafka_streaming import run_kafka_streaming_pipeline  # noqa: E402
from pipelines.spark_ml_pipeline import run_spark_ml_pipeline  # noqa: E402
from pipelines.nosql_store import run_nosql_pipeline  # noqa: E402
from pipelines.airflow_pipeline import run_airflow_pipeline  # noqa: E402
from pipelines.flood_preprocessor import TamilNaduFloodPreprocessor  # noqa: E402
from pipelines.train_ml_suite import train_master_ml_suite  # noqa: E402


def execute_full_pipeline():
    start_time = time.time()
    print("=" * 85)
    print(" [LAMBDA MASTER PIPELINE] EXECUTING DISTRIBUTED BIG DATA SUITE")
    print(" Platform    : Lambda Mobility OS & Urban Intelligence Command")
    print(" Geographic  : Tamil Nadu · Chengalpattu District & All 38 Districts")
    print(" Dataset     : Traffic.csv.xls + Tamil Nadu Weather & Flood Datasets")
    print("=" * 85)

    # Stage 1: HDFS & MapReduce
    print("\n>>> STAGE 1: HDFS DISTRIBUTED STORAGE & MAPREDUCE AGGREGATION")
    run_hdfs_mapreduce_pipeline()

    # Stage 2: Hive Data Warehouse
    print("\n>>> STAGE 2: APACHE HIVE METASTORE & HIVEQL ANALYTICAL QUERIES")
    run_hive_warehouse_pipeline()

    # Stage 3: Kafka Streaming
    print("\n>>> STAGE 3: APACHE KAFKA IOT EDGE STREAMING PRODUCER")
    run_kafka_streaming_pipeline()

    # Stage 4: Spark MLlib
    print("\n>>> STAGE 4: APACHE SPARK MLLIB CLASSIFICATION & K-MEANS CLUSTERING")
    run_spark_ml_pipeline()

    # Stage 5: NoSQL Document Store
    print("\n>>> STAGE 5: ADVANCED NOSQL DOCUMENT STORE & GEOSPATIAL TELEMETRY")
    run_nosql_pipeline()

    # Stage 6: Airflow ETL Pipeline
    print("\n>>> STAGE 6: APACHE AIRFLOW WORKFLOW DAG & AUTOMATED ETL SCHEDULER")
    run_airflow_pipeline()

    # Stage 7: Tamil Nadu State-Wide Big Data Preprocessing
    print("\n>>> STAGE 7: TAMIL NADU 38-DISTRICT FLOOD BIG DATA PREPROCESSING PIPELINE")
    preprocessor = TamilNaduFloodPreprocessor()
    preprocessor.preprocess_pipeline()

    # Stage 8: Master Machine Learning & Evaluation Suite
    print("\n>>> STAGE 8: MASTER MACHINE LEARNING TRAINING & BENCHMARK SUITE")
    train_master_ml_suite()

    elapsed = round(time.time() - start_time, 2)
    print("\n" + "=" * 85)
    print(f" [ALL 8 MODULES COMPLETE] PIPELINE SUCCESSFULLY EXECUTED IN {elapsed} SECONDS")
    print(" Ready to serve live traffic & flood predictions on http://127.0.0.1:8000")
    print("=" * 85)


if __name__ == "__main__":
    execute_full_pipeline()
