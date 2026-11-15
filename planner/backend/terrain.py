"""Terrain loading: real USGS MOLA+HRSC DEM (or a GeoTIFF you export from Mars Trek), sand mask, demo terrain."""
import io
import math
import os

import numpy as np
from scipy import ndimage as ndi

try:
    import rasterio  # noqa: F401
    HAVE_RASTERIO = True
except ImportError:
    HAVE_RASTERIO = False

RESOURCES = [
    dict(n=1, name="NASA JPL Mars Trek", url="https://trek.nasa.gov/mars/", role="Whole-planet photo map + DEM file you export"),
    dict(n=2, name="USGS-NASA Planetary Geologic Mapping", url="https://astrogeology-usgs.hub.arcgis.com/pages/interactive-maps-mars", role="Sand / rock-unit mask you export"),
    dict(n=3, name="Curiosity's proposed path up Mount Sharp", url="https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/", role="Reference route (waypoints you type in)"),
    dict(n=4, name="NASA Worldview", url="https://worldview.earthdata.nasa.gov/", role="NOT USED (Earth data)"),
    dict(n=5, name="Perseverance Raw Images", url="https://mars.nasa.gov/mars2020/multimedia/raw-images/", role="NOT USED (Jezero photos)"),
]

R_MARS = 3396190.0                      # m, radius of the Mars sphere used by the USGS/Trek equirectangular maps
M_PER_DEG = R_MARS * math.pi / 180.0    # metres per degree of latitude

# Trek basemap tile address (WMTS). The layer name is from memory and must be CONFIRMED on trek.nasa.gov — if it fails the app draws an offline picture.
TREK_TILE_URL = "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg"

DEFAULT_AREA = dict(lat_min=-4.78, lat_max=-4.60, lon_min=137.35, lon_max=137.55)   # Gale crater box from the plan (Q3 default)


def area_size_m(area):
    lat0 = 0.5 * (area["lat_min"] + area["lat_max"])
    h = (area["lat_max"] - area["lat_min"]) * M_PER_DEG
    w = (area["lon_max"] - area["lon_min"]) * M_PER_DEG * math.cos(math.radians(lat0))
    return w, h


class Terrain:
    """Height grid Z (metres) on a square grid of cell size px (metres), plus optional sand mask."""
    def __init__(self, Z, px, area, label, is_demo, sand=None, sand_label="no sand data", notes=None, native_res_m=None):
        self.Z, self.px, self.area, self.label, self.is_demo = Z, px, dict(area), label, is_demo
        self.sand, self.sand_label, self.notes, self.native_res_m = sand, sand_label, list(notes or []), native_res_m
        self.H, self.W = Z.shape

    def rc_to_lonlat(self, r, c):
        a = self.area
        lat = a["lat_max"] - (np.asarray(r, float) + 0.5) / self.H * (a["lat_max"] - a["lat_min"])
        lon = a["lon_min"] + (np.asarray(c, float) + 0.5) / self.W * (a["lon_max"] - a["lon_min"])
        return lon, lat

    def lonlat_to_rc(self, lon, lat):
        a = self.area
        r = (a["lat_max"] - lat) / (a["lat_max"] - a["lat_min"]) * self.H - 0.5
        c = (lon - a["lon_min"]) / (a["lon_max"] - a["lon_min"]) * self.W - 0.5
        return int(np.clip(round(r), 0, self.H - 1)), int(np.clip(round(c), 0, self.W - 1))


def _fill_nan(a):
    m = np.isnan(a)
    if not m.any():
        return a
    idx = ndi.distance_transform_edt(m, return_distances=False, return_indices=True)
    return a[tuple(idx)]


def make_demo_terrain(area, n):
    """DEMO ONLY: made-up hills + a bowl + sand patches, so the app can run with no download."""
    rng = np.random.default_rng(7)
    w_m, h_m = area_size_m(area)
    px = max(w_m, h_m) / n
    W_, H_ = max(30, int(round(w_m / px))), max(30, int(round(h_m / px)))
    yy, xx = np.mgrid[0:H_, 0:W_]
    u, v = xx / W_, yy / H_
    size = max(w_m, h_m)
    mound = np.exp(-(((u - 0.62) / 0.30) ** 2 + ((v - 0.40) / 0.26) ** 2))
    bowl = -np.exp(-(((u - 0.25) / 0.17) ** 2 + ((v - 0.72) / 0.17) ** 2))
    def noise(s):
        g = ndi.gaussian_filter(rng.normal(size=(H_, W_)), s)
        return g / g.std()
    Z = 2000.0 + size * 0.072 * mound + size * 0.02 * bowl + size * (0.006 * noise(18) + 0.0025 * noise(7) + 0.00035 * noise(2))
    gy, gx = np.gradient(Z, px)
    slope = np.degrees(np.arctan(np.hypot(gx, gy)))
    sn = noise(10)
    sand = ((sn > np.quantile(sn, 0.78)) & (slope < 9)).astype(float)
    return Terrain(Z, px, area, "DEMO terrain (synthetic, not Mars)", True, sand=sand, sand_label="SYNTHETIC sand patches (demo)",
                   notes=["DEMO: heights and sand are made up. Real results need a DEM exported from Mars Trek."])


_DS = {}
def _open_cached(path):
    import rasterio
    if path not in _DS: _DS[path] = rasterio.open(path)   # header is fetched once, not on every load
    return _DS[path]


def _read_dem_file(path, area, shape):
    if not HAVE_RASTERIO:
        raise RuntimeError("Loading a DEM file needs rasterio.  Run:  pip install rasterio")
    import rasterio
    from rasterio.windows import from_bounds
    from rasterio.enums import Resampling
    ds = _open_cached(path)
    if True:
        if ds.crs is None or ds.crs.is_geographic:
            bounds = (area["lon_min"], area["lat_min"], area["lon_max"], area["lat_max"])
        else:      # equirectangular metres (Trek / USGS Mars maps)
            bounds = (R_MARS * math.radians(area["lon_min"]), R_MARS * math.radians(area["lat_min"]),
                      R_MARS * math.radians(area["lon_max"]), R_MARS * math.radians(area["lat_max"]))
        win = from_bounds(*bounds, transform=ds.transform)
        arr = ds.read(1, window=win, out_shape=shape, resampling=Resampling.bilinear, boundless=True, fill_value=np.nan).astype(float)
        if ds.nodata is not None:
            arr[arr == ds.nodata] = np.nan
        native = abs(ds.transform.a) if not ds.crs.is_geographic else abs(ds.transform.a) * M_PER_DEG
    arr[np.abs(arr) > 1e6] = np.nan
    if np.isnan(arr).mean() > 0.5:
        raise RuntimeError("More than half of the chosen area is outside the DEM file (or empty). Check the lat/lon box and the file.")
    return _fill_nan(arr), native


def _read_mask_file(path, shape):
    from PIL import Image
    try:
        im = Image.open(path).convert("L").resize((shape[1], shape[0]), Image.NEAREST)
        a = np.asarray(im, float) / 255.0
    except Exception:
        if not HAVE_RASTERIO:
            raise
        import rasterio
        from rasterio.enums import Resampling
        with rasterio.open(path) as ds:
            a = ds.read(1, out_shape=shape, resampling=Resampling.nearest).astype(float)
        a = (a - np.nanmin(a)) / (np.nanmax(a) - np.nanmin(a) + 1e-9)
    return (a > 0.5).astype(float)


DATA_SOURCES = ["Demo terrain (synthetic)", "Mars Trek DEM file (GeoTIFF you exported)"]


def load_terrain(source, area, max_grid, dem_file="", sand_file=""):
    w_m, h_m = area_size_m(area)
    if w_m <= 0 or h_m <= 0:
        raise ValueError("Area is empty: lat_max must be larger than lat_min, lon_max larger than lon_min.")
    if source.startswith("Demo"):
        T = make_demo_terrain(area, max_grid)
        if sand_file:
            T.sand = _read_mask_file(sand_file, T.Z.shape); T.sand_label = f"sand mask file: {os.path.basename(sand_file)}"
        return T
    if not dem_file or not os.path.exists(dem_file):
        raise FileNotFoundError("DEM file not found. Export a height map (GeoTIFF) from Mars Trek, then type its path, or switch to Demo terrain.")
    px = max(w_m, h_m) / max_grid
    shape = (max(30, int(round(h_m / px))), max(30, int(round(w_m / px))))
    Z, native = _read_dem_file(dem_file, area, shape)
    sand, sl = None, "no sand data"
    if sand_file:
        sand = _read_mask_file(sand_file, shape); sl = f"sand mask file: {os.path.basename(sand_file)}"
    notes = []
    if native and native > px * 1.5:
        notes.append(f"DEM native resolution ≈ {native:.0f} m is coarser than the grid ({px:.0f} m): small steep spots are smoothed away, so slopes are UNDERESTIMATED.")
    return Terrain(Z, px, area, f"Mars Trek DEM: {os.path.basename(dem_file)}", False, sand=sand, sand_label=sl, notes=notes, native_res_m=native)


def fetch_global_basemap(zoom=2, timeout=8):
    """Whole-planet photo map from Mars Trek tiles. Returns an RGB array, or None if the tiles cannot be loaded."""
    try:
        import requests
        from PIL import Image
        cols, rows = 2 ** (zoom + 1), 2 ** zoom
        canvas = Image.new("RGB", (cols * 256, rows * 256))
        for y in range(rows):
            for x in range(cols):
                r = requests.get(TREK_TILE_URL.format(z=zoom, y=y, x=x), timeout=timeout)
                r.raise_for_status()
                canvas.paste(Image.open(io.BytesIO(r.content)).convert("RGB"), (x * 256, y * 256))
        return np.asarray(canvas)
    except Exception as e:
        print("Mars Trek tiles could not be loaded (", type(e).__name__, ") → using the offline picture. Check the tile layer name on trek.nasa.gov.")
        return None


def parse_reference(text):
    """'-4.7,137.4; -4.65,137.5' → [(lat,lon),...].  Waypoints you read off the Curiosity path page (resource 3)."""
    pts = []
    for chunk in text.replace("\n", ";").split(";"):
        chunk = chunk.strip()
        if not chunk:
            continue
        a, b = [float(v) for v in chunk.replace(" ", ",").split(",") if v != ""][:2]
        pts.append((a, b))
    return pts


# ---- v3 extras: optional photo (to click on) + layer guide
Terrain.photo = None
Terrain.photo_label = "no photo loaded (the picture is drawn from the height map)"


def load_photo(T, path):
    """A real picture (CTX / HiRISE / Trek export) covering EXACTLY the lat/lon box. Background only."""
    from PIL import Image as PILImage
    im = PILImage.open(path).convert("RGB")
    if max(im.size) > 1400:
        im.thumbnail((1400, 1400))
    T.photo = np.asarray(im)
    T.photo_label = f"photo: {os.path.basename(path)} (assumed to cover exactly the lat/lon box)"
    return T


LAYER_GUIDE_COLUMNS = ["Layer", "Where it comes from", "Unit", "What the colours mean", "Used for"]
LAYER_GUIDE = [
    ["Photo (optional)", "Resource 1 · Trek photo export", "colour", "Real surface colour: bright orange = dust, dark = rock/sand. NOT height.", "Background to click on. Never used in a calculation."],
    ["Height (DEM)", "Resource 1 · Trek DEM GeoTIFF", "metres", "Colour ramp low → high.", "Base of everything."],
    ["Shaded relief", "height + sun angle", "0-1", "Bright = faces the sun.", "Picture and shadow layer."],
    ["Slope", "steepest step to 8 neighbours", "degrees", "Dark flat → bright steep.", "Hazard, price, risk, steep %."],
    ["Roughness", "local height spread, slope removed", "metres", "Dark smooth → bright bumpy.", "Price, rough %."],
    ["Sand mask (optional)", "Resource 2 · USGS map export", "0/1", "Tan = sand.", "Price, sand %."],
    ["Impassable", "slope > limit", "yes/no", "Red.", "Hard rule."],
    ["Clearance", "distance to impassable cell", "metres", "Yellow band near red.", "Buffer, near-danger price and %."],
    ["Blocked", "impassable OR inside buffer", "yes/no", "Dark red.", "Cells the search may not use."],
    ["Closeness", "from clearance", "0-1", "Yellow strength.", "Soft price, risk."],
    ["Shadow (proxy)", "shaded relief < threshold", "yes/no", "Blue.", "Extra heating in stage 2 only (if > 0 W)."],
    ["Radiation (proxy)", "sky view from the height map + height + zones you draw", "index, 1.0 = open ground", "Blue = shielded, red = hot zone.", "Route price, radiation exposure, stage 2 dose."],
    ["Route agreement", "how many routes pass through each square", "count", "Brighter = more routes share this corridor.", "Showing shared corridors and decision points. Not used in any calculation."],
]
