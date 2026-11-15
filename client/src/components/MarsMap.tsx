import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Waypoint, RouteResponse } from '../types/api';

interface MarsMapProps {
  start: Waypoint;
  destination: Waypoint;
  route: RouteResponse | null;
  onSelectStart: (wp: Waypoint) => void;
  onSelectDestination: (wp: Waypoint) => void;
  activeHoverCoord?: [number, number] | null;
  showGeology?: boolean;
  showHazards?: boolean;
}

const PRESET_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000 Station', elevation_m: -4462.0 },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Site Alpha', elevation_m: -4120.0 },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Stratigraphy Bench', elevation_m: -4280.0 },
  { lat: -4.6550, lng: 137.3850, name: 'Glen Torridon Clay Haven', elevation_m: -4480.0 },
  { lat: -4.7450, lng: 137.4350, name: 'Gediz Vallis Channel Outlook', elevation_m: -3950.0 }
];

// Geological boundaries in Gale Crater Mount Sharp region
const GEOLOGY_POLYGONS = [
  {
    name: "Boxwork Ridge Structure Network",
    color: "#f59e0b",
    fillColor: "#f59e0b",
    coords: [
      [-4.7000, 137.4600],
      [-4.7050, 137.4950],
      [-4.7300, 137.5100],
      [-4.7400, 137.4750],
      [-4.7200, 137.4500]
    ],
    desc: "Ancient polygonal groundwater fracture veins (Target Formation)"
  },
  {
    name: "Sulfate-Bearing Layered Strata",
    color: "#a855f7",
    fillColor: "#a855f7",
    coords: [
      [-4.6700, 137.4100],
      [-4.6800, 137.4650],
      [-4.7100, 137.4800],
      [-4.7250, 137.4300],
      [-4.6900, 137.3950]
    ],
    desc: "Climatic drying transition with stepped benches"
  },
  {
    name: "Glen Torridon Clay-Bearing Unit",
    color: "#06b6d4",
    fillColor: "#06b6d4",
    coords: [
      [-4.6400, 137.3700],
      [-4.6500, 137.4300],
      [-4.6800, 137.4200],
      [-4.6700, 137.3600]
    ],
    desc: "Habitable lacustrine lakebed deposits with smectite clay"
  },
  {
    name: "Bagnold / Stimson Active Sand Dunes (HAZARD)",
    color: "#ef4444",
    fillColor: "#ef4444",
    coords: [
      [-4.6750, 137.3600],
      [-4.6850, 137.4000],
      [-4.7150, 137.3900],
      [-4.7000, 137.3500]
    ],
    desc: "Mobility trap hazard: loose basaltic sand dunes with severe wheel/boot slip"
  }
];

export const MarsMap: React.FC<MarsMapProps> = ({
  start,
  destination,
  route,
  onSelectStart,
  onSelectDestination,
  activeHoverCoord,
  showGeology = true,
  showHazards = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const hoverMarkerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Lower Mount Sharp / Boxwork Target
    const map = L.map(mapContainerRef.current, {
      center: [-4.685, 137.435],
      zoom: 13,
      minZoom: 11,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Dark-themed satellite/terrain basemap
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      opacity: 0.85
    }).addTo(map);

    // Zoom buttons in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    routeLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Map Elements when Route, Start, Destination, or Overlays change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = routeLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Render Geological Formations
    if (showGeology) {
      GEOLOGY_POLYGONS.forEach(geo => {
        if (!showHazards && geo.name.includes("HAZARD")) return;

        const isHazard = geo.name.includes("HAZARD");
        const poly = L.polygon(geo.coords as [number, number][], {
          color: geo.color,
          fillColor: geo.fillColor,
          fillOpacity: isHazard ? 0.4 : 0.22,
          weight: isHazard ? 2 : 1.5,
          dashArray: isHazard ? '4, 4' : undefined
        }).addTo(layerGroup);

        poly.bindTooltip(`
          <div style="font-family: system-ui; font-size: 11px;">
            <strong style="color: ${geo.color}">${geo.name}</strong><br/>
            <span style="color: #cbd5e1;">${geo.desc}</span>
          </div>
        `, { sticky: true });
      });
    }

    // 2. Render Preset Waypoints
    PRESET_WAYPOINTS.forEach(wp => {
      const isStart = wp.lat === start.lat && wp.lng === start.lng;
      const isDest = wp.lat === destination.lat && wp.lng === destination.lng;

      if (!isStart && !isDest) {
        const marker = L.circleMarker([wp.lat, wp.lng], {
          radius: 6,
          fillColor: '#38bdf8',
          fillOpacity: 0.8,
          color: '#ffffff',
          weight: 1.5
        }).addTo(layerGroup);

        marker.bindTooltip(`
          <div style="font-size: 11px;">
            <strong>${wp.name}</strong><br/>
            Elev: ${wp.elevation_m}m | Lat: ${wp.lat.toFixed(4)}, Lon: ${wp.lng.toFixed(4)}
          </div>
        `, { direction: 'top' });

        marker.on('click', () => {
          onSelectDestination(wp);
        });
      }
    });

    // 3. Render Planned Route Polyline
    if (route && route.route_coordinates && route.route_coordinates.length > 1) {
      const latlngs = route.route_coordinates as [number, number][];

      // Outer tactical glow
      L.polyline(latlngs, {
        color: '#f59e0b',
        weight: 7,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Inner crisp neon traverse
      L.polyline(latlngs, {
        color: '#ffffff',
        weight: 3,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);
    }

    // 4. Render Start Marker (Green Beacon)
    const startIcon = L.divIcon({
      className: 'custom-beacon-start',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(34, 197, 94, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #22c55e; border: 2px solid #ffffff; box-shadow: 0 0 10px #22c55e;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([start.lat, start.lng], { icon: startIcon }).addTo(layerGroup)
      .bindTooltip(`<strong>START: ${start.name || 'Station'}</strong>`, { permanent: false, direction: 'top' });

    // 5. Render Destination Marker (Amber Beacon)
    const destIcon = L.divIcon({
      className: 'custom-beacon-dest',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 10px #ef4444;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(layerGroup)
      .bindTooltip(`<strong>GOAL: ${destination.name || 'Target'}</strong>`, { permanent: false, direction: 'top' });

  }, [start, destination, route, showGeology, showHazards]);

  // Handle Chart Hover Sync on Map
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
    } else if (hoverMarkerRef.current) {
      hoverMarkerRef.current.remove();
      hoverMarkerRef.current = null;
    }
  }, [activeHoverCoord]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '460px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', backgroundColor: '#090d16' }} />
      
      {/* Map Tactical HUD Overlay Info */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        backgroundColor: 'rgba(9, 13, 22, 0.88)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '8px 14px',
        color: '#f8fafc',
        fontSize: '11px',
        zIndex: 500,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ color: '#f59e0b', fontWeight: 800, letterSpacing: '0.5px' }}>
          GALE CRATER // TOPOGRAPHIC GRID
        </div>
        <div style={{ color: '#94a3b8', fontSize: '10px' }}>
          LAT: -4.670°S | LON: 137.450°E | ELEV: -4,450m to -3,800m
        </div>
      </div>

      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        backgroundColor: 'rgba(9, 13, 22, 0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '10px',
        zIndex: 500,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span>START</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <span>TARGET</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
          <span>BOXWORK VEINS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#a855f7' }} />
          <span>SULFATE STRATA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#06b6d4' }} />
          <span>CLAY UNIT</span>
        </div>
      </div>
    </div>
  );
};
