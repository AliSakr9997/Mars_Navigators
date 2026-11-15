"""Terrain layers (slope, roughness, hillshade, danger, clearance) and the payload sent to the browser."""
import base64 as _b64
import math

import numpy as np
from scipy import ndimage as ndi
from matplotlib.colors import LightSource

from .settings import A_SPEC, PRESETS, TR_SPEC

NB8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


class Layers:
    pass


def local_std(a, size):
    m = ndi.uniform_filter(a, size)
    return np.sqrt(np.maximum(ndi.uniform_filter(a * a, size) - m * m, 0))


def build_layers(T, A):
    L = Layers()
    Z, px = T.Z, T.px
    H, Wd = Z.shape
    Zp = np.pad(Z, 1, mode="edge")
    s = np.zeros_like(Z)
    for dr, dc in NB8:
        nb = Zp[1 + dr:1 + dr + H, 1 + dc:1 + dc + Wd]
        s = np.maximum(s, np.abs(Z - nb) / (px * math.hypot(dr, dc)))
    L.slope = np.degrees(np.arctan(s))                       # degrees, steepest step out of each square
    L.rough = local_std(Z - ndi.gaussian_filter(Z, 2.0), 5)  # metres of height wobble (slope removed)
    L.has_sand = T.sand is not None
    L.sand = T.sand if L.has_sand else np.zeros_like(Z)
    L.hill = LightSource(azdeg=A["sun_az_deg"], altdeg=A["sun_elev_deg"]).hillshade(Z, vert_exag=1, dx=px, dy=px)
    L.shadow = L.hill < A["shadow_level"]                    # PROXY for shadow
    L.danger = L.slope > A["max_slope_deg"]                  # impassable ground
    if L.danger.any():
        L.clearance = ndi.distance_transform_edt(~L.danger) * px
    else:
        L.clearance = np.full(Z.shape, 1e4)
    buf = A["danger_buffer_m"]
    L.blocked = L.danger | (L.clearance < buf)               # HARD rule (never a weight)
    L.influence = max(5 * buf, 2 * px, 1.0)
    L.closeness = np.clip(1 - L.clearance / L.influence, 0, 1)
    return L

ALGOS = ['Dijkstra', 'A*', 'Weighted A*', 'Greedy', 'A* + smoothing']



def _enc(a, dtype):
    return _b64.b64encode(np.ascontiguousarray(a, dtype=dtype).tobytes()).decode()


def export_payload(T, L):
    """Everything the browser app needs: the height grid and the terrain layers (numbers), plus the settings and route styles."""
    spec = lambda sp: [dict(key=s["key"], label=s["label"], default=s["default"], unit=s["unit"], group=s["group"], tag=s["tag"], note=s["note"],
                            kind=s["kind"], lo=s["lo"], hi=s["hi"], options=s["options"], info=s["info"]) for s in sp]
    a = T.area
    return dict(H=int(T.H), W=int(T.W), px=float(T.px), area={k: float(v) for k, v in a.items()},
                Z=_enc(T.Z, "<f8"), slope=_enc(L.slope, "<f4"), rough=_enc(L.rough, "<f4"), hill=_enc(L.hill, "<f4"), sand=_enc(L.sand, "u1"),
                hasSand=bool(L.has_sand), isDemo=bool(T.is_demo), label=T.label, sandLabel=T.sand_label, notes=list(T.notes),
                photo=None, photoLabel=T.photo_label, TR_SPEC=spec(TR_SPEC), A_SPEC=spec(A_SPEC), PRESETS=PRESETS, ALGOS=list(ALGOS))
