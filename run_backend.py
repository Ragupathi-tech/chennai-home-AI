import sys
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
import uvicorn

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  Starting ChennaiHome AI Backend Server...")
    print("  - API URL: http://127.0.0.1:8000")
    print("  - Docs:    http://127.0.0.1:8000/docs")
    print("  - Health:  http://127.0.0.1:8000/api/health")
    print("=" * 60 + "\n", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=8000)
