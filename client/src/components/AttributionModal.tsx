import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface AttributionModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const AttributionModal: React.FC<AttributionModalProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;

  const sources = [
    {
      num: '01',
      title: 'NASA Mars Trek WMTS',
      subtitle: 'Viking MDIM2.1, Gale CTX & Curiosity HiRISE Mosaics',
      desc1: 'Live stream of OGC WMTS RESTful map tiles in Mars Equirectangular projection (EPSG:104905).',
      desc2: 'Includes 232m global Viking color mosaic, 6m Gale Crater CTX mosaic, and 0.25m Curiosity HiRISE traverse mosaic.',
      linkText: 'NASA JPL Solar System Treks ↗',
      url: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars'
    },
    {
      num: '02',
      title: 'USGS Planetary Geologic Map',
      subtitle: 'SIM 3292 Geologic Map of Mars (Tanaka et al. 2014)',
      desc1: 'Official USGS global geological mapping capturing Noachian, Hesperian, and Amazonian stratigraphy.',
      desc2: 'Streamed directly via NASA Mars Trek ArcGIS MapServer WMTS with live legend classification.',
      linkText: 'USGS Astrogeology Science Center ↗',
      url: 'https://astrogeology.usgs.gov/'
    },
    {
      num: '03',
      title: 'NASA Curiosity REMS & RAD',
      subtitle: 'Daily meteorology & radiation dosimeter · Gale Crater',
      desc1: 'Sol 4995 environmental telemetry: ground temperatures (-84°C to +4°C), atmospheric pressure (777 Pa).',
      desc2: 'RAD dosimeter reports galactic cosmic ray exposure (0.58 mSv/day, 24.2 μSv/h) on Gale Crater floor.',
      linkText: 'NASA/JPL-Caltech · REMS team, CAB (CSIC–INTA) ↗',
      url: 'https://mars.nasa.gov/msl/mission/instruments/rems/'
    },
    {
      num: '04',
      title: 'MOLA + HRSC Topographic Blend',
      subtitle: 'USGS / ESA 200m Blended Elevation Model',
      desc1: 'Digital elevation model combining Mars Global Surveyor MOLA laser altimetry and Mars Express HRSC stereo data.',
      desc2: 'Provides ground truth for slope gradients, hillshade rendering, and elevation profile extraction.',
      linkText: 'USGS / ESA Planetary Maps ↗',
      url: 'https://planetarymaps.usgs.gov/'
    },
    {
      num: '05',
      title: 'EVA & Rover Bioenergetic Models',
      subtitle: 'Minetti Metabolic Cost & Tobler Hiking Function',
      desc1: 'Biomechanical energy modeling for 130 kg suited astronaut locomotion and 900 kg electric rover traversal.',
      desc2: 'Tobler exponential walking function and Minetti grade cost polynomial (J/(kg·m)).',
      linkText: 'Minetti et al. (2002) / Tobler (1993) ↗',
      url: 'https://en.wikipedia.org/wiki/Tobler%27s_hiking_function'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 8, 7, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#181512',
        border: '1px solid #443a33',
        borderRadius: '12px',
        maxWidth: '960px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '36px',
        color: '#f3e7d8',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        position: 'relative',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: '#ed9d66',
            letterSpacing: '1.2px',
            marginBottom: '4px'
          }}>
            ARES–GALE &nbsp;/&nbsp; OBSERVATION RECORD
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{
              margin: 0,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '38px',
              fontWeight: 700,
              color: '#f3e7d8'
            }}>
              NASA Sources & Scientific Provenance
            </h2>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #443a33',
                color: '#bdb0a2',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#332922', marginBottom: '28px' }} />

        {/* Source Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {sources.map(src => (
            <div
              key={src.num}
              style={{
                backgroundColor: '#201c19',
                border: '1px solid #332922',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ed9d66', fontWeight: 700 }}>
                    [{src.num}]
                  </span>
                  <span style={{ fontSize: '11px', color: '#887b70' }}>NASA Verified</span>
                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600, color: '#f3e7d8' }}>
                  {src.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#f1c680', marginBottom: '10px' }}>
                  {src.subtitle}
                </div>
                <p style={{ fontSize: '12px', color: '#bdb0a2', lineHeight: '1.5', margin: '0 0 8px 0' }}>
                  {src.desc1}
                </p>
                <p style={{ fontSize: '11px', color: '#887b70', lineHeight: '1.4', margin: '0 0 14px 0' }}>
                  {src.desc2}
                </p>
              </div>

              <a
                href={src.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  color: '#ed9d66',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600
                }}
              >
                <span>{src.linkText}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Footer Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#302923',
              border: '1px solid #443a33',
              color: '#f3e7d8',
              borderRadius: '6px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Observation Record
          </button>
        </div>
      </div>
    </div>
  );
};
