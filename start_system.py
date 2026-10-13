"""
Master Launcher for Lambda Urban Intelligence Platform (Big Data + Frontend)
Platform: Lambda Mobility OS

1. Big Data Serving Bridge (FastAPI on http://127.0.0.1:8000)
2. Lambda Smart City Dashboard (Vite on http://localhost:5173)
"""

import subprocess
import time
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PYTHON_EXE = sys.executable

def start():
    print("="*75)
    print(" [URBAN INTELLIGENCE PLATFORM] LAUNCHING BIG DATA PIPELINE & FRONTEND")
    print("="*75)
    
    # 1. Run Big Data Batch Verification First
    print("\n[1/3] Verifying Big Data HDFS & Spark ML Models...")
    subprocess.run([
        PYTHON_EXE, os.path.join(BASE_DIR, "bigdata_engine", "run_pipeline.py")
    ])
    
    # 2. Launch FastAPI Server
    print("\n[2/3] Launching Big Data Serving Bridge on http://127.0.0.1:8000...")
    backend_proc = subprocess.Popen([
        PYTHON_EXE, os.path.join(BASE_DIR, "bigdata_engine", "server.py")
    ])
    time.sleep(2)
    
    # 3. Launch Vite Frontend Dev Server
    print("\n[3/3] Launching Lambda Command Center on http://localhost:5173...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_dir = os.path.join(BASE_DIR, "frontend") if os.path.exists(os.path.join(BASE_DIR, "frontend")) else BASE_DIR
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)
    
    print("\n" + "="*75)
    print(" [SYSTEM READY] ALL SERVICES ARE OPERATIONAL:")
    print("  -> FRONTEND DASHBOARD : http://localhost:5173")
    print("  -> BIG DATA API       : http://127.0.0.1:8000")
    print("  -> PIPELINE MODULE    : http://localhost:5173/bigdata-pipeline")
    print("="*75)
    print("Press Ctrl+C to terminate both servers.\n")
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    start()
