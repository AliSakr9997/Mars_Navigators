"""Settings: terrain rules (stage 1), crew/suit assumptions (stage 2) and route price styles.
The frontend receives these specs inside the payload and renders its settings pages from them."""
import contextlib

def S(key, label, default, unit, group, tag, note, kind="num", lo=None, hi=None, options=None, info=False):
    return dict(key=key, label=label, default=default, unit=unit, group=group, tag=tag, note=note,
                kind=kind, lo=lo, hi=hi, options=options, info=info)

# SET 1 · TERRAIN RULES — stage 1 only. No crew, oxygen or battery here.
TR_SPEC = [
    S("risky_slope_deg", "Slope where it gets risky", 15, "deg", "Slope and safety", "THRESHOLD", "Steeper ground is flagged and counts in 'steep %'.", lo=3, hi=40),
    S("max_slope_deg", "Slope that is impassable", 18, "deg", "Slope and safety", "THRESHOLD", "HARD rule: never walked.", lo=5, hi=40),
    S("danger_buffer_m", "Safety buffer around impassable ground", 10, "m", "Slope and safety", "THRESHOLD", "HARD rule: stay this far away.", lo=0, hi=500),
    S("rough_threshold_m", "Rough-ground threshold", 2.0, "m", "Slope and safety", "THRESHOLD", "Height wobble that counts as fully rough.", lo=0.1, hi=50),
    S("max_grid_cells", "Map size (cells, long side)", 160, "cells", "Search and picture", "APP SETTING", "Bigger = finer but slower.", lo=40, hi=400),
    S("weighted_eps", "Weighted A* strength", 2.5, "x", "Search and picture", "APP SETTING", "Higher = faster, less exact.", lo=1.0, hi=10),
    S("leg_length_m", "Leg length in leg table", 250, "m", "Search and picture", "APP SETTING", "Also split where ground type changes.", lo=100, hi=5000),
    S("sun_az_deg", "Sun direction (azimuth)", 315, "deg", "Search and picture", "APP SETTING", "For shaded relief and shadow layer.", lo=0, hi=360),
    S("sun_elev_deg", "Sun height", 25, "deg", "Search and picture", "APP SETTING", "For shaded relief and shadow layer.", lo=2, hi=80),
    S("shadow_level", "Shadow threshold", 0.15, "0-1", "Search and picture", "APP SETTING", "Darker than this = 'shadow'.", lo=0.0, hi=1.0),
    S("mars_gravity", "Mars gravity", 3.71, "m/s²", "Search and picture", "KNOWN CONSTANT", "Information only.", info=True),
    S("rad_shield_pct", "Max shielding by terrain", 50, "%", "Radiation layer (proxy)", "ASSUMPTION", "Radiation index of a fully enclosed spot vs open ground. 50 = half the open-ground exposure. A guess: not measured data.", lo=0, hi=90),
    S("rad_alt_pct_km", "Radiation change per km of height", 5, "%/km", "Radiation layer (proxy)", "ASSUMPTION", "Higher ground = thinner air above = a little more radiation. A guess: not measured data.", lo=0, hi=30),
]

# SET 2 · ASSUMPTIONS — stage 2 only. Guessed numbers about crew and suit.
A_SPEC = [
    S("crew_size", "Crew size", 2, "people", "Crew and suit", "ASSUMPTION", "Totals are multiplied by this.", lo=1, hi=6),
    S("suit_mass_kg", "Suit + person mass", 130, "kg", "Crew and suit", "ASSUMPTION", "Used by the energy formula.", lo=60, hi=250),
    S("flat_speed_kmh", "Walking speed on flat ground", 2.5, "km/h", "Crew and suit", "ASSUMPTION", "Other slopes follow Tobler's rule.", lo=0.5, hi=6),
    S("slowest_walker_factor", "Slowest walker speed factor", 1.0, "x", "Crew and suit", "ASSUMPTION", "0.8 = team 20% slower.", lo=0.3, hi=1.5),
    S("eva_limit_h", "EVA time limit", 8, "h", "Crew and suit", "ASSUMPTION", "Hard rule.", lo=1, hi=24),
    S("o2_tank_l", "Oxygen tank size", 1200, "L", "Oxygen", "ASSUMPTION", "Per person.", lo=100, hi=5000),
    S("start_o2_pct", "Starting oxygen", 100, "%", "Oxygen", "ASSUMPTION", "Tank fill at start.", lo=1, hi=100),
    S("o2_rest_l_min", "Oxygen use at rest", 0.8, "L/min", "Oxygen", "ASSUMPTION", "Flat base use.", lo=0.1, hi=3),
    S("o2_slope_coeff", "Extra oxygen per sin(slope)", 2.5, "L/min", "Oxygen", "ASSUMPTION", "use = rest + this × sin(slope).", lo=0, hi=10),
    S("o2_kj_per_l", "Energy per litre of oxygen", 20.9, "kJ/L", "Oxygen", "STANDARD RULE", "Approximate body-chemistry rule.", lo=15, hi=25),
    S("o2_model", "Oxygen formula", "conservative", "", "Oxygen", "APP SETTING", "slope / energy (Minetti) / conservative = larger of the two.", kind="choice", options=["conservative", "slope", "energy"]),
    S("o2_warn_pct", "Oxygen warning level", 80, "% used", "Oxygen", "ASSUMPTION", "Warn at this usage.", lo=10, hi=100),
    S("o2_reserve_pct", "Oxygen reserve to walk back", 20, "% of tank", "Oxygen", "ASSUMPTION", "Hard rule.", lo=0, hi=60),
    S("battery_kwh", "Battery size", 4.0, "kWh", "Battery and heating", "ASSUMPTION", "Per suit.", lo=0.5, hi=20),
    S("start_batt_pct", "Starting battery", 100, "%", "Battery and heating", "ASSUMPTION", "Fill at start.", lo=1, hi=100),
    S("life_support_w", "Life-support draw", 150, "W", "Battery and heating", "ASSUMPTION", "Always on.", lo=0, hi=2000),
    S("heater_w", "Heater power", 350, "W", "Battery and heating", "ASSUMPTION", "Continuous.", lo=0, hi=2000),
    S("other_w", "Other power use", 0, "W", "Battery and heating", "ASSUMPTION", "Radio, motors...", lo=0, hi=2000),
    S("cold_extra_w", "Extra heating in shadow", 0, "W", "Battery and heating", "ASSUMPTION", "Shadow is only a proxy. 0 = off.", lo=0, hi=1000),
    S("batt_reserve_pct", "Battery reserve to walk back", 20, "% of battery", "Battery and heating", "ASSUMPTION", "Hard rule.", lo=0, hi=60),
    S("rad_msv_day", "Radiation dose rate", 0.67, "mSv/day", "Radiation", "ASSUMPTION", "Dose rate on open ground (radiation index 1.0). Not in the 5 resources: a guess.", lo=0, hi=5),
    S("rad_warn_msv", "Radiation warning level", 0, "mSv", "Radiation", "ASSUMPTION", "0 = no warning.", lo=0, hi=50),
]


class Settings:
    """One group of settings. Reading S["key"] is recorded so we can audit what was really used."""
    def __init__(self, name, spec):
        self.name = name
        self.spec = {s["key"]: s for s in spec}
        self.values = {k: s["default"] for k, s in self.spec.items()}
        self.used = set()

    def __getitem__(self, k):
        self.used.add(k)
        return self.values[k]

    def set(self, k, v):
        d = self.spec[k]["default"]
        if self.spec[k]["kind"] == "choice": pass
        elif isinstance(d, bool): v = bool(v)
        elif isinstance(d, int): v = int(round(float(v)))
        elif isinstance(d, float): v = float(v)
        self.values[k] = v

    def reset(self):
        for k, s in self.spec.items():
            self.values[k] = s["default"]

    def keys_numeric(self):
        return [k for k, s in self.spec.items() if s["kind"] == "num" and not s["info"]]

    @contextlib.contextmanager
    def temp(self, **kw):
        old = {k: self.values[k] for k in kw}
        try:
            self.values.update(kw); yield
        finally:
            self.values.update(old)

    def table(self):
        import pandas as pd   # optional, only needed for this helper
        rows = []
        for k, s in self.spec.items():
            status = "info only" if s["info"] else ("used" if k in self.used else "not used in this run")
            rows.append(dict(Setting=s["label"], Value=self.values[k], Unit=s["unit"], Tag=s["tag"], Group=s["group"], Status=status, key=k))
        return pd.DataFrame(rows)



# Route styles = saved price weights (a search hyperparameter, not physics).
PRESETS = {
    "Balanced":      dict(slope=3.0, roughness=1.5, sand=2.5, near_danger=3.0, climb=2.0, radiation=1.5, height=1.0, slope_cap_deg=18),
    "Safe":          dict(slope=6.0, roughness=2.0, sand=4.0, near_danger=6.0, climb=1.0, radiation=3.0, slope_cap_deg=8),
    "Quick":         dict(slope=1.0, roughness=0.5, sand=1.0, near_danger=1.0, climb=0.2, radiation=0.3, slope_cap_deg=15),
    "Low-energy":    dict(slope=2.0, roughness=0.5, sand=2.5, near_danger=1.0, climb=6.0, radiation=0.3, slope_cap_deg=18),
    "Low-radiation": dict(slope=1.5, roughness=0.5, sand=1.5, near_danger=1.5, climb=1.0, radiation=10.0, slope_cap_deg=18),
}


# Extra route-search rules (route count limits, avoid-mountain multipliers)
_EXTRA_RULES = [
    dict(key="max_extra_pct", label="Longest route vs the shortest found", default=100, unit="% longer", group="Route search", tag="THRESHOLD", note="Any route longer than this compared with the SHORTEST route found is dropped, however different it is.", kind="num", lo=0, hi=200, options=None, info=False),
    dict(key="main_extra_pct", label="Main route may be this much longer than the shortest", default=60, unit="% longer", group="Route search", tag="THRESHOLD", note="The main (best) route is chosen only among routes within this limit of the shortest one, so the main route is never a long detour.", kind="num", lo=0, hi=100, options=None, info=False),
    dict(key="adaptive_contrast", label="Scale slope/roughness cost to this area", default=1, unit="1 = on", group="Route search", tag="THRESHOLD", note="On: the route styles react to the slopes that really exist here, so they differ even on gentle ground. Hard limits are not changed.", kind="num", lo=0, hi=1, options=None, info=False),
    dict(key="climb_penalty", label="Climb cost multiplier", default=6, unit="x", group="Avoid mountains", tag="THRESHOLD", note="Every metre of climbing costs this many times more. Higher = routes go around hills instead of over them.", kind="num", lo=0, hi=60, options=None, info=False),
    dict(key="slope_penalty", label="Slope cost multiplier", default=3, unit="x", group="Avoid mountains", tag="THRESHOLD", note="Makes up and down slopes cost more in the route price. Higher = flatter routes, even if longer.", kind="num", lo=0, hi=20, options=None, info=False),
    dict(key="height_penalty", label="Avoid high ground", default=5, unit="x", group="Avoid mountains", tag="THRESHOLD", note="Extra price for ground higher than the START/END, up to this many times the normal price at the highest point. Pushes routes around mountains and plateaus.", kind="num", lo=0, hi=40, options=None, info=False),
]
for _e in _EXTRA_RULES:
    if not any(_s["key"] == _e["key"] for _s in TR_SPEC):
        TR_SPEC.append(_e)

TR = Settings("Terrain rules", TR_SPEC)
A = Settings("Assumptions", A_SPEC)
