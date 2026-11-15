"""Backend service: choose an area, load real Mars heights, build the payload the frontend needs.

Environment variables (all optional):
  ARES_FORCE_DEMO=1   skip the download and use synthetic demo terrain (tests, offline work)
  ARES_DEM_URL        GDAL path/URL of the DEM (default: USGS MOLA+HRSC blended DEM, 200 m/pixel)
  ARES_DEM_FILE       local GeoTIFF exported from Mars Trek (used first if it exists)
  ARES_SAND_FILE      optional sand / rock-unit mask picture or GeoTIFF for the same area
"""
import math
import os
import threading
import time

from .layers import build_layers, export_payload
from .settings import TR
from .terrain import (HAVE_RASTERIO, M_PER_DEG, Terrain, _read_dem_file, _read_mask_file, area_size_m,
                      make_demo_terrain)

SITES = {   # (lat, lon) centre of the first area shown when the app opens
    "Gale crater: Curiosity landing site (Bradbury)": (-4.589, 137.441),
    "Jezero crater: Perseverance landing site": (18.445, 77.451),
}
DEFAULT_SITE = "Gale crater: Curiosity landing site (Bradbury)"
DEFAULT_AREA_KM = 3.0          # a 3 km box fits a ~30 minute suited walk

TILE_URLS = [   # NASA Mars Trek Viking colour mosaic; several addresses are tried in order by the browser
    "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{row}/{col}.jpg",
    "https://trek.nasa.gov/tiles/Mars/EQ/Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{row}/{col}.jpg",
]
TILE_MAX_ZOOM = 7

DEM_URL = os.environ.get("ARES_DEM_URL", "/vsicurl/https://planetarymaps.usgs.gov/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif")
DEM_FILE = os.environ.get("ARES_DEM_FILE", "")
SAND_FILE = os.environ.get("ARES_SAND_FILE", "")

_LOCK = threading.Lock()       # one terrain load at a time (GDAL handles are shared)
_ENV = None
_DEFAULT = None


def area_around(center, km=DEFAULT_AREA_KM):
    dlat = (km / 2) * 1000 / M_PER_DEG
    dlon = dlat / math.cos(math.radians(center[0]))
    return dict(lat_min=center[0] - dlat, lat_max=center[0] + dlat, lon_min=center[1] - dlon, lon_max=center[1] + dlon)


def area_for_points(slon, slat, elon, elat):
    """Area that covers START and END with margin: at least 8 km, at most 800 km."""
    lat_c, lon_c = (slat + elat) / 2, (slon + elon) / 2
    span = max(abs(slat - elat) * M_PER_DEG, abs(slon - elon) * M_PER_DEG * math.cos(math.radians(lat_c)))
    side = min(max(span * 2.2, 8000.0), 800e3)
    dlat = side / 2 / M_PER_DEG
    dlon = dlat / max(math.cos(math.radians(lat_c)), 0.05)
    return dict(lat_min=max(lat_c - dlat, -89.5), lat_max=min(lat_c + dlat, 89.5), lon_min=lon_c - dlon, lon_max=lon_c + dlon)


def _gdal_env():
    """One GDAL session with big caches for the whole process (keeps the remote DEM header, avoids re-downloads)."""
    global _ENV
    if _ENV is None and HAVE_RASTERIO:
        import rasterio
        _ENV = rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif", GDAL_HTTP_TIMEOUT="60",
                            GDAL_HTTP_MULTIPLEX="YES", VSI_CACHE="TRUE", VSI_CACHE_SIZE="100000000",
                            CPL_VSIL_CURL_CACHE_SIZE="200000000", CPL_VSIL_CURL_CHUNK_SIZE="1048576", GDAL_CACHEMAX="256")
        _ENV.__enter__()


def _load_dem(src, area):
    w_m, h_m = area_size_m(area)
    px = max(w_m, h_m) / TR["max_grid_cells"]
    shape = (max(30, int(round(h_m / px))), max(30, int(round(w_m / px))))
    Z, native = _read_dem_file(src, area, shape)
    notes = []
    if native and native > px * 1.5:
        notes.append(f"DEM native resolution about {native:.0f} m is coarser than the grid ({px:.0f} m): slopes are UNDERESTIMATED.")
    sand, sand_label = None, "no sand data (sand = 0)"
    if SAND_FILE:
        sand = _read_mask_file(SAND_FILE, shape)
        sand_label = "sand mask file"
    label = "USGS MOLA+HRSC blended DEM 200 m (real Mars)" if src == DEM_URL else f"Mars DEM file: {os.path.basename(src)}"
    return Terrain(Z, px, area, label, False, sand=sand, sand_label=sand_label, notes=notes, native_res_m=native)


def get_terrain(area):
    """Real DEM if it can be read, otherwise DEMO terrain (clearly marked as not Mars)."""
    if os.environ.get("ARES_FORCE_DEMO") == "1":
        return make_demo_terrain(area, TR["max_grid_cells"])
    src = DEM_FILE if DEM_FILE and os.path.exists(DEM_FILE) else DEM_URL
    if HAVE_RASTERIO:
        try:
            _gdal_env()
            return _load_dem(src, area)
        except Exception as ex:
            print("Could not load the real height map:", type(ex).__name__, str(ex)[:300])
    else:
        print("rasterio is not installed: real height files cannot be read.")
    print("-> Using DEMO terrain (made up, NOT Mars).")
    return make_demo_terrain(area, TR["max_grid_cells"])


def build_payload(area):
    t0 = time.time()
    T = get_terrain(area)
    t1 = time.time()
    L = build_layers(T, TR)
    t2 = time.time()
    p = export_payload(T, L)
    p["tileUrls"] = TILE_URLS
    p["tileMaxZoom"] = TILE_MAX_ZOOM
    p["timing"] = dict(download=round(t1 - t0, 2), layers=round(t2 - t1, 2), pack=round(time.time() - t2, 2))
    return p


def default_payload():
    """Payload for the first area (cached: the same for every browser)."""
    global _DEFAULT
    with _LOCK:
        if _DEFAULT is None:
            _DEFAULT = build_payload(area_around(SITES[DEFAULT_SITE]))
        return _DEFAULT


def payload_for_points(slon, slat, elon, elat):
    with _LOCK:
        return build_payload(area_for_points(slon, slat, elon, elat))
