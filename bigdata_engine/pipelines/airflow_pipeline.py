"""
Course: 21CSC314P - Big Data Essentials
Lab 10: Apache Airflow Distributed ETL Pipeline & DAG Orchestration Engine
Corridor: Tamil Nadu · Chengalpattu District · Potheri Central Sector (GST Road NH 45)

Modules Covered:
- Lab 10: Directed Acyclic Graphs (DAG), Task Dependencies, Operators (BashOperator, PythonOperator),
  Cron Scheduling, SLA Retries, Automated Model Retraining & Warehouse Sync
"""

import os
import time
from typing import Dict, List, Any

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR) if os.path.basename(CURRENT_DIR) == "pipelines" else CURRENT_DIR


class AirflowTask:
    """Simulates an Apache Airflow BaseOperator task execution."""
    def __init__(self, task_id: str, operator_type: str = "PythonOperator", retries: int = 3):
        self.task_id = task_id
        self.operator_type = operator_type
        self.retries = retries
        self.upstream: List['AirflowTask'] = []
        self.downstream: List['AirflowTask'] = []
        self.status = "NONE"

    def set_downstream(self, task: 'AirflowTask'):
        if task not in self.downstream:
            self.downstream.append(task)
        if self not in task.upstream:
            task.upstream.append(self)

    def __rshift__(self, other: 'AirflowTask') -> 'AirflowTask':
        self.set_downstream(other)
        return other


class AirflowDAG:
    """
    Simulates Apache Airflow DAG: 'urban_traffic_daily_etl'
    Schedule: '0 2 * * *' (Daily 02:00 AM IST)
    """
    def __init__(self, dag_id: str = "urban_traffic_daily_etl", schedule: str = "0 2 * * *"):
        self.dag_id = dag_id
        self.schedule = schedule
        self.tasks: Dict[str, AirflowTask] = {}

    def add_task(self, task: AirflowTask):
        self.tasks[task.task_id] = task

    def run_dag(self) -> Dict[str, Any]:
        execution_order = []
        logs = []
        start_t = time.time()

        for t_id, task in self.tasks.items():
            task.status = "RUNNING"
            # Execution simulation
            task.status = "SUCCESS"
            execution_order.append(t_id)
            logs.append(f"[Airflow Worker] Task '{t_id}' ({task.operator_type}) executed successfully in 120ms.")

        total_duration = round((time.time() - start_t) * 1000 + 480, 2)
        return {
            "dag_id": self.dag_id,
            "schedule_interval": self.schedule,
            "execution_date": time.strftime("%Y-%m-%d %H:%M:%S IST"),
            "state": "SUCCESS",
            "tasks_executed": execution_order,
            "duration_ms": total_duration,
            "logs": logs
        }


def build_urban_intelligence_dag() -> AirflowDAG:
    dag = AirflowDAG(dag_id="lambda_gst_corridor_daily_etl", schedule="0 2 * * *")

    # Define tasks matching Syllabus Labs 1 to 10
    t1_extract = AirflowTask("extract_iot_sensor_data", operator_type="PythonOperator")
    t2_validate = AirflowTask("validate_traffic_schema", operator_type="BashOperator")
    t3_hdfs_stage = AirflowTask("stage_into_hdfs", operator_type="BashOperator")
    t4_mapreduce = AirflowTask("execute_mapreduce_hourly_agg", operator_type="PythonOperator")
    t5_hive_load = AirflowTask("load_hive_partitioned_warehouse", operator_type="HiveOperator")
    t6_spark_retrain = AirflowTask("spark_mllib_model_retrain", operator_type="SparkSubmitOperator")
    t7_notify = AirflowTask("notify_command_center", operator_type="EmailOperator")

    # Register in DAG
    for t in [t1_extract, t2_validate, t3_hdfs_stage, t4_mapreduce, t5_hive_load, t6_spark_retrain, t7_notify]:
        dag.add_task(t)

    # Set DAG task dependency pipeline:
    # extract >> validate >> hdfs >> mapreduce >> hive >> spark >> notify
    t1_extract >> t2_validate >> t3_hdfs_stage >> t4_mapreduce >> t5_hive_load >> t6_spark_retrain >> t7_notify

    return dag


def run_airflow_pipeline():
    print("=" * 80)
    print(" [BDE LAB 10] APACHE AIRFLOW WORKFLOW DAG & AUTOMATED ETL SCHEDULER")
    print("=" * 80)
    dag = build_urban_intelligence_dag()
    print(f"[*] Registered DAG: '{dag.dag_id}' (Cron Schedule: {dag.schedule})")
    print("    Dependency Flow: extract >> validate >> hdfs >> mapreduce >> hive >> spark >> notify")

    result = dag.run_dag()
    print(f"[+] DAG Run State: {result['state']} ({result['duration_ms']} ms)")
    for log_line in result["logs"][:4]:
        print(f"    {log_line}")
    print("=" * 80)
    return result


if __name__ == "__main__":
    run_airflow_pipeline()
