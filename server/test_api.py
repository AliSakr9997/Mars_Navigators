import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "nominal"
    assert "A* + any-angle smoothing" in data["supported_algorithms"]
    print("✅ Health check passed. Algorithms:", len(data["supported_algorithms"]))

def test_telemetry():
    res = client.get("/api/telemetry")
    assert res.status_code == 200
    data = res.json()
    assert "rems" in data
    assert "rad" in data
    print("✅ Telemetry passed: Sol", data["sol"])

def test_terrain_profiles_and_stats():
    res = client.get("/api/terrain/profiles")
    assert res.status_code == 200
    data = res.json()
    assert "algorithms" in data and "profiles" in data and "priorities" in data
    print("✅ Terrain profiles passed:", list(data["profiles"].keys()))

    res2 = client.get("/api/terrain/stats")
    assert res2.status_code == 200
    stats = res2.json()
    assert "hazard_coverage_percent" in stats
    print(f"✅ Terrain stats passed: Hazard coverage = {stats['hazard_coverage_percent']}% | Max slope = {stats['slope_deg']['max']}°")

def test_single_route_plan():
    payload = {
        "start": { "lat": -4.6620, "lng": 137.4120, "name": "Curiosity Station" },
        "destination": { "lat": -4.7180, "lng": 137.4850, "name": "Boxwork Ridge" },
        "mode": "safe",
        "algorithm": "A* + any-angle smoothing"
    }
    res = client.post("/api/route/plan", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    sm = data["summary"]
    print("✅ Single route planning passed (A* + any-angle smoothing):")
    print(f"   Distance: {sm['total_distance_km']} km | Time: {sm['time_min']} min | Energy: {sm['energy_kj']} kJ | Risk: {sm['risk_score']}")

def test_multi_route_analyze():
    payload = {
        "start": { "lat": -4.6620, "lng": 137.4120 },
        "destination": { "lat": -4.7180, "lng": 137.4850 },
        "algorithms": ["Dijkstra", "A*", "Weighted A* (ε=2.5)", "A* + any-angle smoothing"],
        "profiles": ["Shortest distance", "Safest (max clearance)", "Balanced"],
        "priority": "Balanced"
    }
    res = client.post("/api/route/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert len(data["candidates"]) == 12  # 4 algos * 3 profiles
    best = data["best_candidate"]
    print(f"✅ Multi-route analysis passed! Evaluated {data['total_evaluated']} candidate combinations.")
    print(f"   ★ Best Recommended ({data['priority']}): Rank #{best['rank']} | Profile: {best['profile']} | Model: {best['algorithm']}")
    print(f"     Score: {best['composite_score']} | Dist: {best['total_distance_km']} km | Time: {best['time_min']} min | Energy: {best['energy_kj']} kJ | Risk: {best['risk_score']}")

if __name__ == "__main__":
    print("\n--- RUNNING ADVANCED BACKEND PIPELINE SMOKE TESTS ---")
    test_health()
    test_telemetry()
    test_terrain_profiles_and_stats()
    test_single_route_plan()
    test_multi_route_analyze()
    print("--- ALL BACKEND ADVANCED TESTS PASSED NOMINALLY ---\n")
