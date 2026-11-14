"""
ARES-Gale / Martian Map: Multi-Algorithm Terrain-Aware Route Planning Engine
Incorporates NASA/USGS topography, slope, roughness, texture hazard detection,
clearance EDT, multi-model pathfinding (A*, Dijkstra, Weighted A*, Greedy, Any-Angle Smoothing),
and physiological human factors (Tobler hiking time, Minetti metabolic energy proxy, risk index).
"""

import math
import time
import heapq
from typing import List, Tuple, Dict, Any, Optional
import numpy as np
from scipy import ndimage as ndi

MARS_RADIUS_M = 3396190.0  # USGS Mars equirectangular sphere radius
EVA_BASE_SPEED_KMH = 3.0   # Suited flat walking speed on Mars
SUIT_PLUS_ASTRONAUT_KG = 130.0
EVA_BUDGET_H = 8.0
MAX_SLOPE_DEG = 25.0
SAFETY_BUFFER_M = 10.0
ROUGH_WIN_M = 30.0

# Built-in Cost Profiles
PROFILES = {
    "Shortest distance":      dict(w_slope=0.0, w_rough=0.0, w_tex=0.0, w_clear=0.0, w_climb=0.0),
    "Min slope":              dict(w_slope=6.0, w_rough=1.0, w_tex=0.5, w_clear=0.0, w_climb=1.0),
    "Safest (max clearance)": dict(w_slope=2.0, w_rough=2.0, w_tex=3.0, w_clear=8.0, w_climb=0.5),
    "Energy saver":           dict(w_slope=2.0, w_rough=0.5, w_tex=0.0, w_clear=0.5, w_climb=6.0),
    "Balanced":               dict(w_slope=3.0, w_rough=1.5, w_tex=1.5, w_clear=3.0, w_climb=2.0),
}

# Mission Priorities for Ranking
PRIORITIES = {
    "Safety first":      dict(risk=0.55, time=0.15, energy=0.15, length=0.15),
    "Speed first":       dict(risk=0.15, time=0.55, energy=0.15, length=0.15),
    "Energy / O2 first": dict(risk=0.15, time=0.15, energy=0.55, length=0.15),
    "Balanced":          dict(risk=0.30, time=0.25, energy=0.25, length=0.20),
}

# Pathfinding Algorithm Specs
ALGOS = {
    "Dijkstra":                 dict(eps=0.0, greedy=False, smooth=False),
    "A*":                       dict(eps=1.0, greedy=False, smooth=False),
    "Weighted A* (ε=2.5)":      dict(eps=2.5, greedy=False, smooth=False),
    "Greedy best-first":        dict(eps=1.0, greedy=True,  smooth=False),
    "A* + any-angle smoothing": dict(eps=1.0, greedy=False, smooth=True),
}

def mars_xy(lon: float, lat: float) -> Tuple[float, float]:
    """lon/lat (deg) -> equirectangular map metres (lat_ts=0, lon_0=0)."""
    return MARS_RADIUS_M * math.radians(lon), MARS_RADIUS_M * math.radians(lat)

def map_to_lonlat(x: float, y: float) -> Tuple[float, float]:
    """equirectangular map metres -> lon/lat (deg)."""
    return math.degrees(x / MARS_RADIUS_M), math.degrees(y / MARS_RADIUS_M)

def fill_nan(a: np.ndarray) -> np.ndarray:
    m = np.isnan(a)
    if not m.any():
        return a
    idx = ndi.distance_transform_edt(m, return_distances=False, return_indices=True)
    return a[tuple(idx)]

def robust_norm(a: np.ndarray, lo: float = 2.0, hi: float = 98.0) -> np.ndarray:
    l, h = np.percentile(a, [lo, hi])
    return np.clip((a - l) / (h - l + 1e-9), 0.0, 1.0)

def compute_slope(Z: np.ndarray, px: float) -> np.ndarray:
    gy, gx = np.gradient(Z, px)
    return np.degrees(np.arctan(np.hypot(gx, gy)))

def local_std(a: np.ndarray, size: int) -> np.ndarray:
    m = ndi.uniform_filter(a, size)
    return np.sqrt(np.maximum(ndi.uniform_filter(a * a, size) - m * m, 0.0))

class MarsTerrain:
    """Encapsulates processed Mars elevation, slope, roughness, texture, hazards, and clearance."""
    def __init__(self, Z: np.ndarray, O: np.ndarray, px: float, bounds: Tuple[float, float, float, float], source: str):
        self.px = px
        self.bounds = bounds  # (left, bottom, right, top) in map meters
        self.source = source
        self.H, self.W = Z.shape
        
        # 1. Elevation and Slope
        self.Z = fill_nan(Z.astype(np.float64))
        Zs = ndi.gaussian_filter(self.Z, 0.7)
        self.slope = compute_slope(Zs, px)
        
        # 2. Roughness
        win = max(3, int(round(ROUGH_WIN_M / px)) | 1)
        self.rough = local_std(self.Z - ndi.gaussian_filter(self.Z, win), win)
        
        # 3. Ortho Texture Energy (Difference of Gaussians)
        On = robust_norm(np.nan_to_num(O))
        dog = ndi.gaussian_filter(On, 1.0) - ndi.gaussian_filter(On, 3.0)
        self.tex = np.sqrt(ndi.uniform_filter(dog ** 2, 9))
        
        # 4. Normalized layers
        self.slope_n = np.clip(self.slope / MAX_SLOPE_DEG, 0.0, 1.0)
        self.rough_n = robust_norm(self.rough)
        self.tex_n = robust_norm(self.tex)
        
        # 5. Hazard Mask
        steep = self.slope > MAX_SLOPE_DEG
        rock_pct = 96.0
        rocky = self.tex > np.percentile(self.tex, rock_pct)
        hz = steep | rocky
        
        # Morphological clean & safety buffer dilation
        r = max(1, int(math.ceil(SAFETY_BUFFER_M / px)))
        struct = ndi.generate_binary_structure(2, 1)
        self.hazard = ndi.binary_dilation(hz, structure=struct, iterations=r)
        
        # 6. Clearance Map (Euclidean Distance Transform)
        self.clearance = ndi.distance_transform_edt(~self.hazard) * px
        self.clear_scale = max(4.0 * px, 10.0)
        self.clear_pen = np.exp(-self.clearance / self.clear_scale)
        self.nearest_free = ndi.distance_transform_edt(self.hazard, return_distances=False, return_indices=True)
        
        self._cost_cache = {}

    def get_cost_surface(self, prof: Dict[str, float]) -> np.ndarray:
        key = tuple(sorted(prof.items()))
        if key not in self._cost_cache:
            c = (1.0 + prof.get("w_slope", 0.0) * self.slope_n ** 2
                 + prof.get("w_rough", 0.0) * self.rough_n
                 + prof.get("w_tex", 0.0) * self.tex_n
                 + prof.get("w_clear", 0.0) * self.clear_pen)
            self._cost_cache[key] = np.where(self.hazard, 1e6, c).astype(np.float64)
        return self._cost_cache[key]

    def snap_to_free(self, row: int, col: int) -> Tuple[int, int]:
        r = min(max(row, 0), self.H - 1)
        c = min(max(col, 0), self.W - 1)
        if self.hazard[r, c]:
            r = int(self.nearest_free[0][r, c])
            c = int(self.nearest_free[1][r, c])
        return r, c

    def lonlat_to_grid(self, lon: float, lat: float) -> Tuple[int, int]:
        x, y = mars_xy(lon, lat)
        l, b, rg, t = self.bounds
        c = int(round((x - l) / (rg - l) * (self.W - 1)))
        r = int(round((t - y) / (t - b) * (self.H - 1)))
        return self.snap_to_free(r, c)

    def grid_to_lonlat(self, r: int, c: int) -> Tuple[float, float]:
        l, b, rg, t = self.bounds
        x = l + (c + 0.5) * (rg - l) / self.W
        y = t - (r + 0.5) * (t - b) / self.H
        lon, lat = map_to_lonlat(x, y)
        return round(lon, 6), round(lat, 6)

def create_synthetic_terrain(G: int = 160, aoi_km: float = 6.0, lon: float = 137.45, lat: float = -4.67) -> MarsTerrain:
    """Builds synthetic Mars terrain model matching Mount Sharp / Gale Crater topography."""
    px = (aoi_km * 1000.0) / G
    rng = np.random.default_rng(42)
    yy, xx = np.mgrid[0:G, 0:G] / G
    
    def noise(sig: float, amp: float) -> np.ndarray:
        n = ndi.gaussian_filter(rng.standard_normal((G, G)), sig * G)
        return amp * n / (n.std() + 1e-9)
        
    Z = -4500.0 + (1.0 - yy) * 600.0 + xx * 100.0  # Base Mount Sharp slope
    Z += noise(0.15, 60.0) + noise(0.05, 25.0) + noise(0.015, 8.0)
    
    # Boxwork ridge networks and gully
    ridges = 20.0 * np.sin(xx * 15.0) * np.cos(yy * 12.0)
    canyon = -35.0 * np.exp(-((xx - 0.45) ** 2 + (yy - 0.6) ** 2) / 0.02)
    Z += ridges + canyon
    
    # Ortho imagery proxy
    gy, gx = np.gradient(Z, px)
    sl = np.hypot(gx, gy)
    albedo = ndi.gaussian_filter(rng.standard_normal((G, G)), 15) * 0.05
    ortho = np.clip(0.5 - 0.3 * (gx / (sl.max() + 1e-5)) + albedo, 0.0, 1.0)
    
    cx, cy = mars_xy(lon, lat)
    hy = (aoi_km * 1000.0) / 2.0
    hx = hy / math.cos(math.radians(lat))
    bounds = (cx - hx, cy - hy, cx + hx, cy + hy)
    
    return MarsTerrain(Z.astype(np.float32), ortho.astype(np.float32), px, bounds, "Synthetic Mars Topography (Gale/Mount Sharp)")

# Global Singleton Terrain
terrain = create_synthetic_terrain()

# ----------------- Core Path Search Engine -----------------

def search_core(
    cost: np.ndarray,
    Z: np.ndarray,
    hazard: np.ndarray,
    px: float,
    sr: int, sc: int,
    gr: int, gc: int,
    eps: float,
    w_climb: float,
    greedy: bool
) -> Tuple[np.ndarray, np.ndarray, int]:
    """8-connected grid pathfinding (A*, Dijkstra, Weighted A*, Greedy)."""
    H, W = cost.shape
    N = H * W
    g = np.full(N, np.inf, dtype=np.float64)
    parent = np.full(N, -1, dtype=np.int64)
    closed = np.zeros(N, dtype=bool)

    dr = [-1, -1, -1, 0, 0, 1, 1, 1]
    dc = [-1, 0, 1, -1, 1, -1, 0, 1]

    start = sr * W + sc
    goal = gr * W + gc
    g[start] = 0.0
    h0 = math.hypot(sr - gr, sc - gc) * px

    # Heap contains (priority, g_score, index)
    heap = [(h0 if greedy else eps * h0, 0.0, start)]
    expanded = 0

    while heap:
        pr, curr_g, u = heapq.heappop(heap)
        if closed[u]:
            continue
        closed[u] = True
        expanded += 1

        if u == goal:
            break

        ur = u // W
        uc = u % W

        for k in range(8):
            vr = ur + dr[k]
            vc = uc + dc[k]

            if vr < 0 or vr >= H or vc < 0 or vc >= W:
                continue
            if hazard[vr, vc]:
                continue

            diag = dr[k] != 0 and dc[k] != 0
            if diag and (hazard[ur, vc] or hazard[vr, uc]):
                continue  # Corner-cutting protection

            v = vr * W + vc
            if closed[v]:
                continue

            step = px * (1.41421356 if diag else 1.0)
            dz = Z[vr, vc] - Z[ur, uc]
            ng = curr_g + step * 0.5 * (cost[ur, uc] + cost[vr, vc]) + w_climb * max(dz, 0.0)

            if ng < g[v]:
                g[v] = ng
                parent[v] = u
                h = math.hypot(vr - gr, vc - gc) * px
                new_pr = h if greedy else ng + eps * h
                heapq.heappush(heap, (new_pr, ng, v))

    return g, parent, expanded

def line_of_sight(
    cost: np.ndarray,
    Z: np.ndarray,
    hazard: np.ndarray,
    p: Tuple[int, int],
    q: Tuple[int, int],
    px: float,
    w_climb: float
) -> float:
    """Checks line of sight and calculates edge cost along direct segment."""
    n = int(max(abs(q[0] - p[0]), abs(q[1] - p[1]))) * 2 + 2
    rr = np.rint(np.linspace(p[0], q[0], n)).astype(int)
    cc = np.rint(np.linspace(p[1], q[1], n)).astype(int)
    if hazard[rr, cc].any():
        return float('inf')
    L = math.hypot(q[0] - p[0], q[1] - p[1]) * px
    return float(L * cost[rr, cc].mean() + w_climb * np.maximum(np.diff(Z[rr, cc]), 0).sum())

def smooth_path(
    path: List[Tuple[int, int]],
    cost: np.ndarray,
    Z: np.ndarray,
    hazard: np.ndarray,
    px: float,
    w_climb: float,
    tol: float = 1.03,
    lookahead: int = 50
) -> List[Tuple[int, int]]:
    """String-pulling: removes zig-zags with line-of-sight shortcuts that don't increase cost."""
    if len(path) < 3:
        return path
    e = []
    for a, b in zip(path[:-1], path[1:]):
        d = math.hypot(b[0] - a[0], b[1] - a[1]) * px
        e.append(d * 0.5 * (cost[a] + cost[b]) + w_climb * max(Z[b] - Z[a], 0.0))
    P = np.concatenate([[0], np.cumsum(e)])
    out, i = [path[0]], 0
    while i < len(path) - 1:
        j = min(len(path) - 1, i + lookahead)
        while j > i + 1:
            if line_of_sight(cost, Z, hazard, path[i], path[j], px, w_climb) <= tol * (P[j] - P[i]):
                break
            j -= 1
        out.append(path[j])
        i = j
    return out

def densify(path: List[Tuple[int, int]], step: float = 1.0) -> Tuple[np.ndarray, np.ndarray]:
    rr, cc = [], []
    for a, b in zip(path[:-1], path[1:]):
        n = max(1, int(math.ceil(max(abs(b[0] - a[0]), abs(b[1] - a[1])) / step)))
        t = np.linspace(0, 1, n, endpoint=False)
        rr.append(a[0] + (b[0] - a[0]) * t)
        cc.append(a[1] + (b[1] - a[1]) * t)
    rr.append([path[-1][0]])
    cc.append([path[-1][1]])
    return np.concatenate(rr), np.concatenate(cc)

def minetti_energy_cost(i: np.ndarray) -> np.ndarray:
    """Minetti's energy cost of walking (J / (kg * m)) as function of slope gradient i."""
    i_clip = np.clip(i, -0.45, 0.45)
    return 280.5 * i_clip**5 - 58.7 * i_clip**4 - 76.8 * i_clip**3 + 51.9 * i_clip**2 + 19.6 * i_clip + 2.5

def evaluate_path(T: MarsTerrain, path: List[Tuple[int, int]], prof: Dict[str, float]) -> Dict[str, Any]:
    """Calculates human factors: EVA time (Tobler), metabolic energy (Minetti), and risk index."""
    r, c = densify(path)
    mc = lambda A: ndi.map_coordinates(A, [r, c], order=1, mode="nearest")
    z, sl, cl = mc(T.Z), mc(T.slope), mc(T.clearance)
    
    ri = np.clip(np.rint(r).astype(int), 0, T.H - 1)
    ci = np.clip(np.rint(c).astype(int), 0, T.W - 1)
    cost = T.get_cost_surface(prof)
    
    ds = np.hypot(np.diff(r), np.diff(c)) * T.px
    dz = np.diff(z)
    grade = dz / np.maximum(ds, 1e-9)
    
    cmid = 0.5 * (cost[ri[:-1], ci[:-1]] + cost[ri[1:], ci[1:]])
    total_cost = float((ds * cmid).sum() + prof.get("w_climb", 0.0) * np.maximum(dz, 0.0).sum())
    
    # Tobler hiking velocity (m/s) adjusted for slope
    v = (EVA_BASE_SPEED_KMH / 3.6) * np.exp(-3.5 * np.abs(grade + 0.05)) / np.exp(-3.5 * 0.05)
    v = np.maximum(v, 0.2)  # Avoid division by zero
    time_h = float((ds / v).sum() / 3600.0)
    
    # Minetti energy proxy (kJ)
    energy_kj = float((minetti_energy_cost(grade) * SUIT_PLUS_ASTRONAUT_KG * ds).sum() / 1000.0)
    
    # Risk index (0.0 = safe, 1.0 = extreme)
    risk_cell = 0.5 * np.clip(sl / MAX_SLOPE_DEG, 0.0, 1.0) ** 2 + 0.5 * np.exp(-cl / T.clear_scale)
    risk = float(0.7 * risk_cell.mean() + 0.3 * np.percentile(risk_cell, 95))
    
    # Sample elevation profile
    cum_dist = np.insert(np.cumsum(ds), 0, 0.0)
    profile_points = []
    step_skip = max(1, len(cum_dist) // 50)
    for idx in range(0, len(cum_dist), step_skip):
        profile_points.append({
            "distance_km": round(float(cum_dist[idx] / 1000.0), 3),
            "elevation_m": round(float(z[idx]), 1),
            "slope_deg": round(float(sl[idx]), 1)
        })
    if profile_points[-1]["distance_km"] != round(float(cum_dist[-1] / 1000.0), 3):
        profile_points.append({
            "distance_km": round(float(cum_dist[-1] / 1000.0), 3),
            "elevation_m": round(float(z[-1]), 1),
            "slope_deg": round(float(sl[-1]), 1)
        })

    return {
        "length_m": round(float(ds.sum()), 1),
        "total_distance_km": round(float(ds.sum() / 1000.0), 2),
        "time_min": round(time_h * 60.0, 1),
        "estimated_eva_time_hours": round(time_h, 2),
        "energy_kj": round(energy_kj, 1),
        "climb_m": round(float(np.maximum(dz, 0.0).sum()), 1),
        "descent_m": round(float(np.abs(np.minimum(dz, 0.0)).sum()), 1),
        "max_slope_deg": round(float(sl.max()), 1),
        "avg_slope_deg": round(float(sl.mean()), 1),
        "min_clear_m": round(float(cl.min()), 1),
        "risk_score": round(risk, 3),
        "hazard_level": "NOMINAL_SAFE" if risk < 0.25 else ("ELEVATED_CAUTION" if risk < 0.5 else "HAZARDOUS"),
        "total_cost": round(total_cost, 2),
        "hazard_hits": int(T.hazard[ri, ci].sum()),
        "elevation_profile": profile_points
    }

def solve_route(
    T: MarsTerrain,
    start_grid: Tuple[int, int],
    goal_grid: Tuple[int, int],
    algo_name: str,
    prof_name: str,
    prof_weights: Dict[str, float]
) -> Optional[Dict[str, Any]]:
    """Executes single algorithm on given cost profile."""
    spec = ALGOS.get(algo_name, ALGOS["A*"])
    cost = T.get_cost_surface(prof_weights)
    
    t0 = time.perf_counter()
    g, parent, expanded = search_core(
        cost, T.Z, T.hazard, T.px,
        start_grid[0], start_grid[1],
        goal_grid[0], goal_grid[1],
        spec["eps"], prof_weights.get("w_climb", 0.0), spec["greedy"]
    )
    
    W = T.W
    u = goal_grid[0] * W + goal_grid[1]
    if not np.isfinite(g[u]):
        return None
        
    path = []
    while u != -1:
        path.append((u // W, u % W))
        u = parent[u]
    path = path[::-1]
    
    if spec["smooth"]:
        path = smooth_path(path, cost, T.Z, T.hazard, T.px, prof_weights.get("w_climb", 0.0))
        
    compute_s = round(time.perf_counter() - t0, 4)
    eval_metrics = evaluate_path(T, path, prof_weights)
    
    # Convert grid points to Mars coordinates [[lat, lon], ...]
    route_coords = []
    for r, c in path:
        lon, lat = T.grid_to_lonlat(r, c)
        route_coords.append([lat, lon])
        
    eval_metrics.update({
        "profile": prof_name,
        "algorithm": algo_name,
        "expanded_nodes": int(expanded),
        "compute_time_s": compute_s,
        "route_coordinates": route_coords
    })
    return eval_metrics

def rank_candidates(candidates: List[Dict[str, Any]], priority: str = "Balanced") -> List[Dict[str, Any]]:
    """Ranks all candidate routes across human-factors metrics using mission priority weights."""
    if not candidates:
        return []
    w = PRIORITIES.get(priority, PRIORITIES["Balanced"])
    
    risks = np.array([c["risk_score"] for c in candidates])
    times = np.array([c["time_min"] for c in candidates])
    energies = np.array([c["energy_kj"] for c in candidates])
    lengths = np.array([c["length_m"] for c in candidates])
    
    def norm(arr):
        rng = arr.max() - arr.min()
        return (arr - arr.min()) / rng if rng > 1e-9 else np.zeros_like(arr)
        
    n_risk = norm(risks)
    n_time = norm(times)
    n_energy = norm(energies)
    n_length = norm(lengths)
    
    scores = (w["risk"] * n_risk +
              w["time"] * n_time +
              w["energy"] * n_energy +
              w["length"] * n_length)
              
    ranked = []
    for idx, c in enumerate(candidates):
        item = dict(c)
        item["composite_score"] = round(float(scores[idx]), 3)
        item["feasible"] = bool(c["estimated_eva_time_hours"] <= EVA_BUDGET_H and c["hazard_hits"] == 0)
        ranked.append(item)
        
    ranked.sort(key=lambda x: (not x["feasible"], x["composite_score"], x["compute_time_s"]))
    for rank_idx, item in enumerate(ranked):
        item["rank"] = rank_idx + 1
    return ranked
