# ARES–Gale Field Console

An independent mission workspace derived from AliSakr9997/Mars_Navigators (0c1dc1c).
The landing sequence opens crew access and the Orbit Blue field console. Use the navigation to compare scientific objectives, enter or link suit readings, run the terrain planner, or open the original traverse view.

## Run the combined application

Build with `docker build -t ares-field .` and start with `docker run --name ares-field --rm -p 8000:8000 -v ares-crew:/root/.ares-gale ares-field`. In a second terminal run `docker exec -it ares-field python server/mission_auth.py commander` to create a crew login. Open http://localhost:8000. Use HTTPS when hosting remotely. The volume stores crew accounts. Suit readings and history stay in the current browser.

For local development install both server/requirements.txt and planner/requirements.txt in a virtual environment. From the project root run `uvicorn --app-dir server mission_gateway:app --port 8000`. In client run `npm ci` and `npm run dev`.

## Data and route interpretation

The field map uses normalized scenario coordinates on a simulated Gale terrain grid. Compute Route requests three model profiles with the selected slope limit. The objective screen compares model estimates when available and labels illustrative fallback data. Risk is a comparative terrain score. Suit readings come from manual input or a browser-accessible JSON feed in the format shown on the Suit readings page. The environmental API serves the included telemetry snapshot. Sources are documented in datasets/NASA_SOURCES.md.

The separate Terrain model view mounts the upstream v5 planner under /planner/. See planner/README.md for DEM configuration, online loading and demo terrain.

