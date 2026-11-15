"""Vercel function entry point for mission and terrain requests."""
import os
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "server"))
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")
from mission_gateway import app
