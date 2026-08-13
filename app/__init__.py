"""Import shim so the backend can be launched from the workspace root.

This lets `uvicorn app.main:app` resolve the real FastAPI app inside `backend/app`
without changing the backend package layout used by the project.
"""

from __future__ import annotations

from pathlib import Path

backend_app_path = Path(__file__).resolve().parent.parent / "backend" / "app"

if backend_app_path.exists():
    __path__.append(str(backend_app_path))
