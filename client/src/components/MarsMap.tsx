import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Waypoint, RouteResponse } from '../types/api';

export interface MapLayersState {
  opticalBasemap: boolean;
  molaElevation: boolean;
  geologicalUnits: boolean;
  slopeHazardMask: boolean;
  sandDunes: boolean;
  boxworkFormations: boolean;
}

interface MarsMapProps {
  start: Waypoint;
  destination: Waypoint;
  route: RouteResponse | null;
  onSelectStart: (wp: Waypoint) => void;
  onSelectDestination: (wp: Waypoint) => void;
  activeHoverCoord?: [number, number] | null;
  layers: MapLayersState;
  onToggleLayer: (key: keyof MapLayersState) => void;
}

const PRESET_WAYPOINTS: Waypoint[] = [
  { lat: -4.6620, lng: 137.4120, name: 'Curiosity Sol 4000 Station', elevation_m: -4462.0 },
  { lat: -4.7180, lng: 137.4850, name: 'Boxwork Ridge Site Alpha', elevation_m: -4120.0 },
  { lat: -4.6950, lng: 137.4400, name: 'Sulfate Stratigraphy Bench', elevation_m: -4280.0 },
  { lat: -4.6550, lng: 137.3850, name: 'Glen Torridon Clay Haven', elevation_m: -4480.0 },
  { lat: -4.7450, lng: 137.4350, name: 'Gediz Vallis Channel Outlook', elevation_m: -3950.0 }
];

export const MarsMap: React.FC<MarsMapProps> = ({
  start,
  destination,
  route,
  onSelectStart,
  onSelectDestination,
  activeHoverCoord,
  layers,
  onToggleLayer
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

    // Dark-themed satellite/terrain basemap (or custom Martian imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      opacity: 0.85
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    routeLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Layers and Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = routeLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Boxwork Formations
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
        fillOpacity: 0.35,
        weight: 2
      }).addTo(layerGroup).bindTooltip(`
        <div style="font-family: system-ui; font-size: 11px;">
          <strong style="color: #c0c8a1;">Boxwork Formations (Science Target)</strong><br/>
          <span>Polygonal groundwater mineral ridge network</span>
        </div>
      `, { sticky: true });
    }

    // 2. Sand Dunes Hazard
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
        <div style="font-family: system-ui; font-size: 11px;">
          <strong style="color: #f1c680;">Active Sand Dunes (Mobility Trap)</strong><br/>
          <span>Loose basaltic sand dunes with severe slip risk</span>
        </div>
      `, { sticky: true });
    }

    // 3. Slope Hazard Mask
    if (layers.slopeHazardMask) {
      L.polygon([
        [-4.7200, 137.4200],
        [-4.7350, 137.4450],
        [-4.7450, 137.4100],
        [-4.7300, 137.3950]
      ], {
        color: '#f4896b',
        fillColor: '#f4896b',
        fillOpacity: 0.4,
        weight: 2,
        dashArray: '3, 3'
      }).addTo(layerGroup).bindTooltip(`
        <div style="font-family: system-ui; font-size: 11px;">
          <strong style="color: #f4896b;">Slope Hazard Mask (&gt;20° Incline)</strong><br/>
          <span>Exceeds safe suited astronaut locomotion threshold</span>
        </div>
      `, { sticky: true });
    }

    // 4. Geological Units
    if (layers.geologicalUnits) {
      // Sulfate-bearing
      L.polygon([
        [-4.6700, 137.4100],
        [-4.6800, 137.4650],
        [-4.7100, 137.4800],
        [-4.7250, 137.4300],
        [-4.6900, 137.3950]
      ], {
        color: '#d5a39d',
        fillColor: '#d5a39d',
        fillOpacity: 0.25,
        weight: 1.5
      }).addTo(layerGroup).bindTooltip('<strong>Sulfate-Bearing Layered Strata</strong>', { sticky: true });

      // Clay-bearing
      L.polygon([
        [-4.6400, 137.3700],
        [-4.6500, 137.4300],
        [-4.6800, 137.4200],
        [-4.6700, 137.3600]
      ], {
        color: '#aa8b76',
        fillColor: '#aa8b76',
        fillOpacity: 0.25,
        weight: 1.5
      }).addTo(layerGroup).bindTooltip('<strong>Glen Torridon Clay-Bearing Unit</strong>', { sticky: true });
    }

    // 5. Waypoints
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
            Elev: ${wp.elevation_m}m
          </div>
        `, { direction: 'top' });

        marker.on('click', () => {
          onSelectDestination(wp);
        });
      }
    });

    // 6. Planned Route Polyline
    if (route && route.route_coordinates && route.route_coordinates.length > 1) {
      const latlngs = route.route_coordinates as [number, number][];

      // Outer glow
      L.polyline(latlngs, {
        color: '#f1a16e',
        weight: 6,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);

      // Inner stroke
      L.polyline(latlngs, {
        color: '#ffffff',
        weight: 2.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);
    }

    // 7. Start Marker (EVA Start)
    const startIcon = L.divIcon({
      className: 'eva-start-pin',
      html: `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background-color: rgba(241, 161, 110, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #f1a16e; border: 2px solid #ffffff; box-shadow: 0 0 8px #f1a16e;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([start.lat, start.lng], { icon: startIcon }).addTo(layerGroup)
      .bindTooltip(`<strong>EVA Start: ${start.name}</strong>`, { direction: 'top' });

    // 8. Destination Marker (EVA Target)
    const destIcon = L.divIcon({
      className: 'eva-target-pin',
      html: `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background-color: rgba(241, 198, 128, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #f1c680; border: 2px solid #ffffff; box-shadow: 0 0 8px #f1c680;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(layerGroup)
      .bindTooltip(`<strong>EVA Target: ${destination.name}</strong>`, { direction: 'top' });

  }, [start, destination, route, layers]);

  // Synchronize hover cursor marker with Elevation Profile chart
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
      border: '1px solid #623d40',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Map Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid #332922'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '26px',
            fontWeight: 600,
            color: '#f2e7d8'
          }}>
            Gale Crater
          </span>
          <span style={{ fontSize: '15px', color: '#bdb0a2' }}>
            / &nbsp;Mount Sharp
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: '#bdb0a2'
          }}>
            HiRISE · PIA26306
          </span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            fontWeight: 500,
            color: '#f1a16e',
            backgroundColor: '#302923',
            padding: '3px 10px',
            borderRadius: '5px'
          }}>
            GIS VIEW
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '420px',
          backgroundColor: '#1b1714',
          position: 'relative'
        }}
      />

      {/* Layer Controls Bar */}
      <div style={{
        padding: '14px 20px',
        backgroundColor: '#201c19',
        borderTop: '1px solid #332922'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#f2e7d8' }}>
            Map layers
          </span>
          <span style={{ fontSize: '13px', color: '#bdb0a2' }}>
            Legend & visibility
          </span>
        </div>

        {/* 6 Layer Toggle Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px'
        }}>
          {[
            { key: 'opticalBasemap', label: 'Optical Basemap', color: '#aa8b76' },
            { key: 'molaElevation', label: 'MOLA Elevation', color: '#d3b794' },
            { key: 'geologicalUnits', label: 'Geological Units', color: '#d5a39d' },
            { key: 'slopeHazardMask', label: 'Slope Hazard Mask', color: '#f4896b' },
            { key: 'sandDunes', label: 'Sand Dunes', color: '#f1c680' },
            { key: 'boxworkFormations', label: 'Boxwork formations', color: '#c0c8a1' }
          ].map((item) => {
            const active = layers[item.key as keyof MapLayersState];
            return (
              <button
                key={item.key}
                onClick={() => onToggleLayer(item.key as keyof MapLayersState)}
                style={{
                  backgroundColor: '#312923',
                  border: active ? `1px solid ${item.color}` : '1px solid #623d40',
                  borderRadius: '5px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  opacity: active ? 1 : 0.55,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: item.color,
                  border: `1px solid ${item.color}`,
                  flexShrink: 0
                }} />
                <span style={{
                  fontSize: '13px',
                  color: active ? '#f2e7d8' : '#bdb0a2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

