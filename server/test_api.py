import sys
import os

# Add server directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "nominal"
    print("✅ Health check passed:", data["mission"])

def test_telemetry():
    response = client.get("/api/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert "rems" in data
    assert "rad" in data
    assert data["sol"] == 4000
    print("✅ Telemetry endpoint passed: Ground temp =", data["rems"]["ground_temp_c"], "°C | Radiation =", data["rad"]["dose_rate_mSv_day"], "mSv/day")

def test_geology_geojson():
    response = client.get("/api/layers/geology")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) >= 3
    print("✅ Geology GeoJSON passed:", len(data["features"]), "geological features loaded.")

def test_waypoints():
    response = client.get("/api/layers/waypoints")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    print("✅ Waypoints endpoint passed:", len(data), "preset waypoints loaded.")

def test_route_plan():
    payload = {
        "start": {
            "lat": -4.6620,
            "lng": 137.4120,
            "name": "Curiosity Station (Sol 4000)"
        },
        "destination": {
            "lat": -4.7180,
            "lng": 137.4850,
            "name": "Boxwork Ridge Site Alpha"
        },
        "mode": "safe",
        "max_slope_deg": 15.0
    }
    response = client.post("/api/route/plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    summary = data["summary"]
    coords = data["route_coordinates"]
    profile = data["elevation_profile"]

    assert len(coords) > 5
    assert len(profile) > 5
    assert summary["total_distance_km"] > 0
    print("✅ Route planning endpoint passed!")
    print(f"   Distance: {summary['total_distance_km']} km")
    print(f"   Max Slope: {summary['max_slope_deg']}° (Avg: {summary['avg_slope_deg']}°)")
    print(f"   Estimated EVA Time: {summary['estimated_eva_time_hours']} hours")
    print(f"   Route Coordinates Count: {len(coords)}")
    print(f"   Elevation Profile Points: {len(profile)}")

if __name__ == "__main__":
    print("\n--- RUNNING BACKEND INTEGRATION SMOKE TESTS ---")
    test_health()
    test_telemetry()
    test_geology_geojson()
    test_waypoints()
    test_route_plan()
    print("--- ALL BACKEND SMOKE TESTS PASSED NOMINALLY ---\n")
