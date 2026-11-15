import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Waypoint, RouteResponse, RouteOption } from '../types/api';
import { getMarsElevation } from '../utils/marsPathfindingEngine';
import { Layers, MapPin, Target, Eye, Sliders, Info, ShieldAlert, Sparkles, X, Crosshair } from 'lucide-react';

export interface MapLayersState {
  opticalBasemap: boolean;
  molaElevation: boolean;
  geologicalUnits: boolean;
  slopeHazardMask: boolean;
  sandDunes: boolean;
  boxworkFormations: boolean;
}

export type OpticalBasemapType = 'viking' | 'ctx' | 'hirise';

interface MarsMapProps {
  start: Waypoint;
  destination: Waypoint;
  route: RouteResponse | null;
  onSelectStart: (wp: Waypoint) => void;
  onSelectDestination: (wp: Waypoint) => void;
  activeHoverCoord?: [number, number] | null;
  layers: MapLayersState;
  onToggleLayer: (key: keyof MapLayersState) => void;
  onSelectOption?: (optionId: string) => void;
  pickMode: 'start' | 'dest' | null;
  onSetPickMode: (mode: 'start' | 'dest' | null) => void;
}

const PRESET_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000 Station', elevation_m: -4462.0 },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Site Alpha', elevation_m: -4120.0 },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Stratigraphy Bench', elevation_m: -4280.0 },
  { lat: -4.6550, lng: 137.3850, name: 'Glen Torridon Clay Haven', elevation_m: -4480.0 },
  { lat: -4.7450, lng: 137.4350, name: 'Gediz Vallis Channel Outlook', elevation_m: -3950.0 }
];

// NASA Mars Trek WMTS Tile URLs (Equirectangular / Plate Carrée EPSG:104905)
const NASA_TREK_TILES = {
  viking: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
  ctx: 'https://trek.nasa.gov/tiles/Mars/EQ/Gale_CTX_BlockAdj_dd/1.0.0/default/default028mm/{z}/{y}/{x}.png',
  hirise: 'https://trek.nasa.gov/tiles/Mars/EQ/curiosity_hirise_mosaic/1.0.0/default/default028mm/{z}/{y}/{x}.png',
  molaBlend: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MOLA_blend200ppx_HRSC_Shade_clon0dd_200mpp_lzw/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
  molaElevation: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
  usgsGeology: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/SIM3292_Global_Geology/MapServer/WMTS/tile/1.0.0/SIM3292_Global_Geology/default/default028mm/{z}/{y}/{x}.png'
};

export const MarsMap: React.FC<MarsMapProps> = ({
  start,
  destination,
  route,
  onSelectStart,
  onSelectDestination,
  activeHoverCoord,
  layers,
  onToggleLayer,
  onSelectOption,
  pickMode,
  onSetPickMode
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const molaLayerRef = useRef<L.TileLayer | null>(null);
  const geologyLayerRef = useRef<L.TileLayer | null>(null);
  const vectorGroupRef = useRef<L.LayerGroup | null>(null);
  const hoverMarkerRef = useRef<L.CircleMarker | null>(null);

  const [opticalBasemap, setOpticalBasemap] = useState<OpticalBasemapType>('ctx');
  const [molaOpacity, setMolaOpacity] = useState<number>(0.65);
  const [geologyOpacity, setGeologyOpacity] = useState<number>(0.60);
  const [showGeologyLegend, setShowGeologyLegend] = useState<boolean>(false);
  const [showTileControls, setShowTileControls] = useState<boolean>(false);

  // Initialize Leaflet Map with Plate Carrée / Mars Equirectangular CRS
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Use L.CRS.EPSG4326 for Mars Equirectangular WMTS tile alignment
    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.EPSG4326,
      center: [-4.685, 137.435],
      zoom: 12,
      minZoom: 2,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // 1. Base Layer (NASA Mars Trek Global Viking 232m Color Mosaic)
    const baseLayer = L.tileLayer(NASA_TREK_TILES.viking, {
      maxNativeZoom: 7,
      maxZoom: 16,
      opacity: 1.0,
      attribution: 'NASA/JPL/USGS'
    }).addTo(map);
    baseTileLayerRef.current = baseLayer;

    // 2. MOLA Topographic Elevation Blend Layer
    const molaLayer = L.tileLayer(NASA_TREK_TILES.molaBlend, {
      maxNativeZoom: 8,
      maxZoom: 16,
      opacity: layers.molaElevation ? molaOpacity : 0.0
    }).addTo(map);
    molaLayerRef.current = molaLayer;

    // 3. USGS SIM 3292 Geologic Map Layer
    const geologyLayer = L.tileLayer(NASA_TREK_TILES.usgsGeology, {
      maxNativeZoom: 11,
      maxZoom: 16,
      opacity: layers.geologicalUnits ? geologyOpacity : 0.0
    }).addTo(map);
    geologyLayerRef.current = geologyLayer;

    L.control.zoom({ position: 'topright' }).addTo(map);

    const vectorGroup = L.layerGroup().addTo(map);
    vectorGroupRef.current = vectorGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Basemap Optical Mode (Viking vs CTX vs HiRISE)
  useEffect(() => {
    const baseLayer = baseTileLayerRef.current;
    if (!baseLayer) return;

    if (opticalBasemap === 'viking') {
      baseLayer.setUrl(NASA_TREK_TILES.viking);
    } else if (opticalBasemap === 'ctx') {
      baseLayer.setUrl(NASA_TREK_TILES.ctx);
    } else if (opticalBasemap === 'hirise') {
      baseLayer.setUrl(NASA_TREK_TILES.hirise);
    }
  }, [opticalBasemap]);

  // Sync MOLA & Geology Opacity
  useEffect(() => {
    if (molaLayerRef.current) {
      molaLayerRef.current.setOpacity(layers.molaElevation ? molaOpacity : 0.0);
    }
  }, [layers.molaElevation, molaOpacity]);

  useEffect(() => {
    if (geologyLayerRef.current) {
      geologyLayerRef.current.setOpacity(layers.geologicalUnits ? geologyOpacity : 0.0);
    }
  }, [layers.geologicalUnits, geologyOpacity]);

  // Handle Map Click for Interactive Coordinate Picking
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      const elevation = getMarsElevation(lat, lng);

      if (pickMode === 'start') {
        const customStart: Waypoint = {
          lat,
          lng,
          name: `EVA Start (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
          elevation_m: elevation
        };
        onSelectStart(customStart);
        onSetPickMode(null);
      } else if (pickMode === 'dest') {
        const customDest: Waypoint = {
          lat,
          lng,
          name: `EVA Target (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
          elevation_m: elevation
        };
        onSelectDestination(customDest);
        onSetPickMode(null);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [pickMode, onSelectStart, onSelectDestination, onSetPickMode]);

  // Render Vector Layers: Routes (P1, P2, P3, PNR), Science Targets, Hazards, and Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = vectorGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Boxwork Ridge Formations (Primary Science Target)
    if (layers.boxworkFormations) {
      L.polygon([
        [-4.7000, 137.4600],
        [-4.7050, 137.4950],
        [-4.7300, 137.5100],
        [-4.7400, 137.4750],
        [-4.7200, 137.4500]
      ], {
        color: '#c0c8a1',
        fillColor: '#c0c8a1',
        fillOpacity: 0.30,
        weight: 2
      }).addTo(layerGroup).bindTooltip(`
        <div style="font-family: 'Inter', sans-serif; font-size: 11px;">
          <strong style="color: #c0c8a1;">Boxwork Formations (Science Target)</strong><br/>
          <span>Polygonal groundwater mineral ridge network</span>
        </div>
      `, { sticky: true });
    }

    // 2. Sand Dunes Hazard (Mobility Trap)
    if (layers.sandDunes) {
      L.polygon([
        [-4.6750, 137.3600],
        [-4.6850, 137.4000],
        [-4.7150, 137.3900],
        [-4.7000, 137.3500]
      ], {
        color: '#f1c680',
        fillColor: '#f1c680',
        fillOpacity: 0.35,
        weight: 2,
        dashArray: '4, 4'
      }).addTo(layerGroup).bindTooltip(`
        <div style="font-family: 'Inter', sans-serif; font-size: 11px;">
          <strong style="color: #f1c680;">Active Sand Dunes (Mobility Trap)</strong><br/>
          <span>Loose basaltic sand dunes with severe rover wheel-slip</span>
        </div>
      `, { sticky: true });
    }

    // 3. Slope Hazard Mask (>20° Incline Scarp)
    if (layers.slopeHazardMask) {
      L.polygon([
        [-4.7200, 137.4200],
        [-4.7350, 137.4450],
        [-4.7450, 137.4100],
        [-4.7300, 137.3950]
      ], {
        color: '#f4896b',
        fillColor: '#f4896b',
        fillOpacity: 0.40,
        weight: 2,
        dashArray: '3, 3'
      }).addTo(layerGroup).bindTooltip(`
        <div style="font-family: 'Inter', sans-serif; font-size: 11px;">
          <strong style="color: #f4896b;">Slope Hazard Mask (&gt;20° Incline)</strong><br/>
          <span>Exceeds safe locomotion limit for suited astronauts and rovers</span>
        </div>
      `, { sticky: true });
    }

    // 4. Preset Waypoint Markers (Clickable shortcuts)
    PRESET_WAYPOINTS.forEach(wp => {
      const isStart = wp.lat === start.lat && wp.lng === start.lng;
      const isDest = wp.lat === destination.lat && wp.lng === destination.lng;

      if (!isStart && !isDest) {
        const marker = L.circleMarker([wp.lat, wp.lng], {
          radius: 5,
          fillColor: '#f1a16e',
          fillOpacity: 0.8,
          color: '#ffffff',
          weight: 1.5
        }).addTo(layerGroup);

        marker.bindTooltip(`
          <div style="font-size: 11px; font-family: 'Inter', sans-serif;">
            <strong>${wp.name}</strong><br/>
            Elev: ${wp.elevation_m}m · Click to target
          </div>
        `, { direction: 'top' });

        marker.on('click', () => {
          onSelectDestination(wp);
        });
      }
    });

    // 5. Multi-Candidate Route Alternatives (P1, P2, P3)
    if (route && route.options && route.options.length > 0) {
      const activeId = route.activeOptionId || 'P1';

      // Draw non-active alternatives first in background
      route.options.forEach(opt => {
        if (opt.id !== activeId && opt.route_coordinates && opt.route_coordinates.length > 1) {
          L.polyline(opt.route_coordinates, {
            color: opt.color,
            weight: 3,
            opacity: 0.45,
            dashArray: opt.id === 'P2' ? '5, 5' : '2, 6'
          }).addTo(layerGroup).bindTooltip(`<strong>${opt.name}</strong>: ${opt.summary.total_distance_km}km`, { sticky: true });
        }
      });

      // Draw active route on top with outer glow
      const activeOpt = route.options.find(o => o.id === activeId) || route.options[0];
      if (activeOpt.route_coordinates && activeOpt.route_coordinates.length > 1) {
        // Outer glow
        L.polyline(activeOpt.route_coordinates, {
          color: activeOpt.color,
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(layerGroup);

        // Core solid line
        L.polyline(activeOpt.route_coordinates, {
          color: activeOpt.color,
          weight: 3.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(layerGroup);
      }

      // Point of No Return (PNR) marker
      if (route.pnr && activeOpt.route_coordinates.length > 0) {
        const midIdx = Math.min(Math.floor(activeOpt.route_coordinates.length * 0.5), activeOpt.route_coordinates.length - 1);
        const pnrCoord = activeOpt.route_coordinates[midIdx];

        const pnrIcon = L.divIcon({
          className: 'pnr-marker',
          html: `
            <div style="background-color: #a855f7; color: white; font-family: monospace; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 4px; border: 1px solid white; box-shadow: 0 0 6px rgba(168,85,247,0.8); white-space: nowrap;">
              PNR km ${route.pnr.km}
            </div>
          `,
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        });

        L.marker(pnrCoord, { icon: pnrIcon }).addTo(layerGroup).bindTooltip(`
          <div style="font-family: 'Inter', sans-serif; font-size: 11px;">
            <strong style="color: #a855f7;">Point of No Return (50% Consumables)</strong><br/>
            Limiting: ${route.pnr.limitingFactor} · Return time: ${route.pnr.returnTimeMin}m
          </div>
        `, { direction: 'top' });
      }
    } else if (route && route.route_coordinates && route.route_coordinates.length > 1) {
      // Single Route fallback
      L.polyline(route.route_coordinates, {
        color: '#10b981',
        weight: 6,
        opacity: 0.35
      }).addTo(layerGroup);

      L.polyline(route.route_coordinates, {
        color: '#10b981',
        weight: 3.5,
        opacity: 0.95
      }).addTo(layerGroup);
    }

    // 6. Start Marker Pin
    const startIcon = L.divIcon({
      className: 'eva-start-pin',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(241, 161, 110, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #f1a16e; border: 2px solid #ffffff; box-shadow: 0 0 8px #f1a16e;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([start.lat, start.lng], { icon: startIcon }).addTo(layerGroup)
      .bindTooltip(`<strong>START: ${start.name || 'EVA Departure'}</strong><br/>Elev: ${start.elevation_m || -4462}m`, { direction: 'top' });

    // 7. Destination Marker Pin
    const destIcon = L.divIcon({
      className: 'eva-target-pin',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(241, 198, 128, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #f1c680; border: 2px solid #ffffff; box-shadow: 0 0 8px #f1c680;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(layerGroup)
      .bindTooltip(`<strong>TARGET: ${destination.name || 'EVA Destination'}</strong><br/>Elev: ${destination.elevation_m || -4120}m`, { direction: 'top' });

  }, [start, destination, route, layers]);

  // Synchronize Elevation Profile Hover Crosshair
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (activeHoverCoord) {
      if (!hoverMarkerRef.current) {
        hoverMarkerRef.current = L.circleMarker(activeHoverCoord, {
          radius: 8,
          fillColor: '#38bdf8',
          fillOpacity: 1,
          color: '#ffffff',
          weight: 2
        }).addTo(map);
      } else {
        hoverMarkerRef.current.setLatLng(activeHoverCoord);
      }
    } else {
      if (hoverMarkerRef.current) {
        map.removeLayer(hoverMarkerRef.current);
        hoverMarkerRef.current = null;
      }
    }
  }, [activeHoverCoord]);

  return (
    <div style={{
      backgroundColor: '#201c19',
      border: '1px solid #443a33',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* 1. Header Bar: Location & NASA WMTS Source Badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        borderBottom: '1px solid #332922',
        backgroundColor: '#251f1c',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '26px',
            fontWeight: 700,
            color: '#f2e7d8'
          }}>
            Gale Crater
          </span>
          <span style={{ fontSize: '15px', color: '#bdb0a2' }}>
            / Mount Sharp
          </span>
        </div>

        {/* Optical Imagery Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#1b1714',
            borderRadius: '6px',
            border: '1px solid #443a33',
            padding: '2px'
          }}>
            {[
              { id: 'ctx', label: 'Gale CTX (6m)' },
              { id: 'hirise', label: 'Curiosity HiRISE (0.25m)' },
              { id: 'viking', label: 'Viking MDIM2.1 (232m)' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setOpticalBasemap(item.id as OpticalBasemapType)}
                style={{
                  backgroundColor: opticalBasemap === item.id ? '#f1a16e' : 'transparent',
                  color: opticalBasemap === item.id ? '#151210' : '#bdb0a2',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: opticalBasemap === item.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            fontWeight: 600,
            color: '#10b981',
            backgroundColor: '#17281f',
            border: '1px solid #10b981',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            LIVE GIS
          </span>

          <button
            onClick={() => setShowTileControls(!showTileControls)}
            style={{
              backgroundColor: showTileControls ? '#443a33' : '#302923',
              border: '1px solid #443a33',
              color: '#f2e7d8',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Adjust layer opacity"
          >
            <Sliders size={13} />
            <span>Opacity</span>
          </button>
        </div>
      </div>

      {/* 2. Calculated Routes Selector Bar (P1: Balanced, P2: Flattest, P3: Max Clearance) */}
      {route && route.options && route.options.length > 0 && (
        <div style={{
          backgroundColor: '#181412',
          borderBottom: '1px solid #332922',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#bdb0a2', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px' }}>
              CALCULATED ROUTES:
            </span>
            {route.options.map(opt => {
              const isActive = (route.activeOptionId || 'P1') === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onSelectOption && onSelectOption(opt.id)}
                  style={{
                    backgroundColor: isActive ? opt.color : '#251f1c',
                    color: isActive ? '#151210' : '#f2e7d8',
                    border: `1px solid ${opt.color}`,
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isActive ? `0 0 10px ${opt.color}66` : 'none',
                    transition: 'all 0.15s'
                  }}
                  title={opt.why}
                >
                  <div style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#151210' : opt.color
                  }} />
                  <span>{opt.id}: {opt.feature}</span>
                  <span style={{ opacity: 0.85, fontSize: '10px' }}>({opt.summary.total_distance_km}km)</span>
                </button>
              );
            })}
          </div>

          {/* Point of No Return Badge */}
          {route.pnr && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#d8b4fe',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid #a855f7',
              borderRadius: '4px',
              padding: '3px 10px'
            }}>
              <span>⚠️ PNR: km {route.pnr.km}</span>
              <span style={{ color: route.pnr.safe ? '#10b981' : '#f87171' }}>
                ({route.pnr.safe ? 'Safe' : 'Caution'})
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Pick Mode Banner when astronaut is selecting coordinates */}
      {pickMode && (
        <div style={{
          backgroundColor: '#3b2518',
          borderBottom: '1px solid #f1a16e',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#f1a16e',
          fontSize: '12px',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={16} />
            <span>
              {pickMode === 'start'
                ? '📍 Click anywhere on the Mars surface to set EVA START coordinate'
                : '🎯 Click anywhere on the Mars surface to set EVA DESTINATION coordinate'}
            </span>
          </div>
          <button
            onClick={() => onSetPickMode(null)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #f1a16e',
              color: '#f1a16e',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* 4. Opacity Controls Drawer (Collapsible) */}
      {showTileControls && (
        <div style={{
          backgroundColor: '#1b1714',
          borderBottom: '1px solid #332922',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#d3b794' }}>MOLA Blend Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={molaOpacity}
              onChange={(e) => setMolaOpacity(parseFloat(e.target.value))}
              style={{ accentColor: '#d3b794', width: '100px' }}
            />
            <span style={{ fontFamily: 'monospace', color: '#bdb0a2' }}>{Math.round(molaOpacity * 100)}%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#d5a39d' }}>USGS Geology Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={geologyOpacity}
              onChange={(e) => setGeologyOpacity(parseFloat(e.target.value))}
              style={{ accentColor: '#d5a39d', width: '100px' }}
            />
            <span style={{ fontFamily: 'monospace', color: '#bdb0a2' }}>{Math.round(geologyOpacity * 100)}%</span>
          </div>
        </div>
      )}

      {/* 5. Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '440px',
          backgroundColor: '#1b1714',
          cursor: pickMode ? 'crosshair' : 'default',
          position: 'relative'
        }}
      />

      {/* 6. Map Layer Toggles Grid & Legend Bar */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#201c19',
        borderTop: '1px solid #332922'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f2e7d8' }}>
              Map layers
            </span>
            <span style={{ fontSize: '12px', color: '#bdb0a2' }}>
              NASA Mars Trek & USGS Overlays
            </span>
          </div>

          <button
            onClick={() => setShowGeologyLegend(!showGeologyLegend)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#f1c680',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Info size={13} />
            <span>{showGeologyLegend ? 'Hide Legend' : 'Geological Unit Legend'}</span>
          </button>
        </div>

        {/* 6 Layer Toggle Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '8px'
        }}>
          {[
            { key: 'opticalBasemap', label: 'Viking MDIM Basemap', color: '#aa8b76', desc: 'NASA 232m' },
            { key: 'molaElevation', label: 'MOLA Topo Blend', color: '#d3b794', desc: 'HRSC 200m' },
            { key: 'geologicalUnits', label: 'USGS SIM 3292 Geology', color: '#d5a39d', desc: 'Tanaka 2014' },
            { key: 'slopeHazardMask', label: 'Slope Hazard Mask', color: '#f4896b', desc: '>20° Scarp' },
            { key: 'sandDunes', label: 'Sand Dunes', color: '#f1c680', desc: 'Mobility Trap' },
            { key: 'boxworkFormations', label: 'Boxwork formations', color: '#c0c8a1', desc: 'Science Target' }
          ].map((item) => {
            const active = layers[item.key as keyof MapLayersState];
            return (
              <button
                key={item.key}
                onClick={() => onToggleLayer(item.key as keyof MapLayersState)}
                style={{
                  backgroundColor: '#312923',
                  border: active ? `1px solid ${item.color}` : '1px solid #443a33',
                  borderRadius: '5px',
                  padding: '7px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  opacity: active ? 1 : 0.50,
                  transition: 'all 0.15s'
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  backgroundColor: item.color,
                  border: `1px solid ${item.color}`,
                  flexShrink: 0
                }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#f2e7d8' : '#bdb0a2',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#887b70' }}>{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 7. Collapsible USGS Geological Unit Legend */}
        {showGeologyLegend && (
          <div style={{
            marginTop: '12px',
            backgroundColor: '#1b1714',
            border: '1px solid #443a33',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 600, color: '#f1a16e', marginBottom: '6px' }}>
              USGS Scientific Investigations Map 3292 — Gale Crater Stratigraphy
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              <div>
                <span style={{ color: '#d5a39d', fontWeight: 600 }}>• Sulfate-Bearing Unit (Hesperian):</span>
                <p style={{ margin: '2px 0', color: '#bdb0a2', fontSize: '11px' }}>
                  Hydrated magnesium and calcium sulfates formed during Martian planetary desiccation.
                </p>
              </div>
              <div>
                <span style={{ color: '#aa8b76', fontWeight: 600 }}>• Glen Torridon Clay Unit (Hesperian):</span>
                <p style={{ margin: '2px 0', color: '#bdb0a2', fontSize: '11px' }}>
                  Smectite clay-rich sedimentary strata formed in long-lived standing lacustrine lakebeds.
                </p>
              </div>
              <div>
                <span style={{ color: '#c0c8a1', fontWeight: 600 }}>• Boxwork Formations (Mount Sharp):</span>
                <p style={{ margin: '2px 0', color: '#bdb0a2', fontSize: '11px' }}>
                  Post-impact hydrothermal fracture fill ridges resistant to eolian deflation.
                </p>
              </div>
              <div>
                <span style={{ color: '#f1c680', fontWeight: 600 }}>• Stimson Eolian Sandstone & Dunes:</span>
                <p style={{ margin: '2px 0', color: '#bdb0a2', fontSize: '11px' }}>
                  Active loose basaltic sand dunes (Bagnold dune field). High wheel-sinkage hazard.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
