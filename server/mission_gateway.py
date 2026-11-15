"""Serve mission APIs, the terrain model and the production UI from one origin."""
from pathlib import Path
import sys

from fastapi.staticfiles import StaticFiles
from main import app
from mission_auth import router

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "planner"))
from backend.server import app as terrain_app

from field_routes import router as field_router
app.include_router(field_router)
app.include_router(router)
app.mount("/planner", terrain_app)
dist = root / "client" / "dist"
if dist.is_dir():
    app.mount("/field", StaticFiles(directory=dist / "field", html=True))
    app.mount("/assets", StaticFiles(directory=dist / "assets"))
    app.mount("/mission", StaticFiles(directory=dist / "mission"))

    app.router.routes[:] = [route for route in app.router.routes if getattr(route, "path", None) != "/"]
    app.mount("/", StaticFiles(directory=dist, html=True))

