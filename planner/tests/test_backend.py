import os
os.environ["ARES_FORCE_DEMO"] = "1"      # no download in tests
import base64
import numpy as np
from fastapi.testclient import TestClient
from backend.server import app

client = TestClient(app)


def test_health():
    assert client.get("/api/health").json() == {"ok": True}


def test_payload_shape():
    p = client.get("/api/payload").json()
    for k in ("H", "W", "px", "area", "Z", "slope", "rough", "hill", "sand", "isDemo", "TR_SPEC", "A_SPEC", "PRESETS", "tileUrls"):
        assert k in p, k
    assert p["isDemo"] is True
    z = np.frombuffer(base64.b64decode(p["Z"]), dtype="<f8")
    assert z.size == p["H"] * p["W"]
    keys = {s["key"] for s in p["TR_SPEC"]}
    assert {"climb_penalty", "slope_penalty", "height_penalty"} <= keys


def test_load_new_area():
    r = client.get("/api/load", params=dict(slon=77.45, slat=18.44, elon=77.48, elat=18.46))
    assert r.status_code == 200
    p = r.json()
    assert p["area"]["lat_min"] < 18.44 < p["area"]["lat_max"]
    assert set(p["timing"]) == {"download", "layers", "pack"}


def test_load_bad_input():
    assert client.get("/api/load", params=dict(slon=0, slat=95, elon=1, elat=1)).status_code == 422


def test_frontend_served():
    assert "ARES" in client.get("/").text
