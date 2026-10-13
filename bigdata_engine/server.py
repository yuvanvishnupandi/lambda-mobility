"""
Big Data Engine Server Launcher
Executes the FastAPI Serving Bridge on http://127.0.0.1:8000
"""

import os
import sys
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from api_bridge import app  # noqa: E402


if __name__ == "__main__":
    print("=" * 80)
    print(" [LAMBDA MOBILITY OS] LAUNCHING FASTAPI GATEWAY ON HTTP://127.0.0.1:8000")
    print(" Platform   : Lambda Urban Intelligence & Sensing Network")
    print(" Corridor   : Dynamic User Localization · Tamil Nadu Municipal Corridors")
    print(" Status     : Distributed Telemetry & Serving Engine Active")
    print("=" * 80)
    uvicorn.run("api_bridge:app", host="127.0.0.1", port=8000, reload=True, app_dir=BASE_DIR)
