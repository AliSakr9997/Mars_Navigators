# NASA Scientific Datasets & Attribution
**Project: ARES-Gale (Mars Space Apps Challenge 2026)**

The ARES-Gale exploration system integrates and cross-references data from multiple NASA and international planetary science missions:

---

## 1. Topographic & Elevation Data (DEM)
- **Source:** High Resolution Stereo Camera (HRSC) on ESA's Mars Express & Mars Orbiter Laser Altimeter (MOLA) on NASA's Mars Global Surveyor.
- **Product:** Blended HRSC-MOLA Digital Elevation Model (DEM) of Gale Crater.
- **Resolution:** ~50 meters / pixel grid.
- **Usage in ARES-Gale:** Surface elevation sampling, 2D slope angle calculation ($\theta = \arctan(\Delta z / d)$), and elevation profile cross-sections.
- **NASA PDS Archive:** [NASA Planetary Data System Geosciences Node](https://pds-geosciences.wustl.edu/missions/mgs/mola.html)

---

## 2. High-Resolution Optical Basemap Imagery
- **Source:** Context Camera (CTX) & High Resolution Imaging Science Experiment (HiRISE) aboard NASA's Mars Reconnaissance Orbiter (MRO).
- **Resolution:** 6 meters / pixel (CTX) down to 0.25 meters / pixel (HiRISE).
- **Target Area:** Mount Sharp / Boxwork formations (approx `4.58° S - 4.78° S`, `137.35° E - 137.55° E`).
- **Usage in ARES-Gale:** Tactical surface visualization, visual identification of rock shelves, scarps, and ripples.
- **Portal:** [NASA JPL Mars Trek](https://trek.nasa.gov/mars/)

---

## 3. Spectral & Geologic Mapping Data
- **Source:** Compact Reconnaissance Imaging Spectrometer for Mars (CRISM) on MRO & USGS Planetary Geologic Mapping Program.
- **Products:** 
  - Glen Torridon clay-bearing unit (smectite phyllosilicates).
  - Layered sulfate-bearing strata (polyhydrated sulfates).
  - Boxwork polygonal ridge networks (cemented groundwater fractures).
  - Active Bagnold sand dune ripples (basaltic sands - mobility hazard).
- **Usage in ARES-Gale:** Scientific points of interest (POIs) and trafficability cost multipliers.
- **Reference:** [USGS Astrogeology Mars Interactive Maps](https://astrogeology-usgs.hub.arcgis.com/pages/interactive-maps-mars)

---

## 4. In-Situ Environmental Telemetry
- **Source:** Mars Science Laboratory (MSL) Curiosity Rover instruments.
- **Instruments:**
  - **REMS (Rover Environmental Monitoring Station):** Diurnal ambient air/ground temperatures, atmospheric pressure, UV sensor, wind vectors.
  - **RAD (Radiation Assessment Detector):** Surface galactic cosmic ray dose rates (~0.67 mSv/day) and solar energetic particle monitors.
- **Usage in ARES-Gale:** Ambient astronaut HUD telemetry, safe EVA duration estimation, and thermal stress status.
- **Archive:** [NASA PDS Atmospheres Node](https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity/rems.html)

---

## 5. Scientific Integrity & Attribution Disclaimer
> [!IMPORTANT]
> **Prototype Route & Telemetry Disclaimer:**
> In-situ REMS and RAD data represent point measurements gathered by the MSL Curiosity rover at its Mount Sharp location, not continuous regional spatial grids. Prototype route difficulty scores and hazard indicators are algorithmic terrain models intended for mission planning simulation, not certified human flight safety predictions.
