# Lambda — Backend Services & Telemetry API

REST API and edge telemetry services powering the Lambda Mobility Operating System.

## Architecture

- **Django REST Framework / FastAPI**: High-throughput telemetry ingestion endpoints
- **PostgreSQL / PostGIS & SQLite**: Spatial geospatial data store
- **Redis & Celery**: Asynchronous event dispatch and alert processing
- **Big Data Engine**: Distributed HDFS blocks, MapReduce aggregators, and Spark ML classifiers

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Start backend server
python manage.py runserver
```

Or run the big data telemetry bridge:

```bash
python bigdata_engine/server.py
```
