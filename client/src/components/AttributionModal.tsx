import React from 'react';
import { X, ExternalLink, ArrowLeft } from 'lucide-react';

interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttributionModal: React.FC<AttributionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sources = [
    {
      num: '01',
      title: 'Curiosity / REMS',
      subtitle: 'Daily meteorology · Gale Crater',
      desc1: 'Sols 4989–4995, 19–25 Aug 2026. Ground min/max and pressure are reported values.',
      desc2: 'The feed returns a qualitative UV category. Wind is blank for Sol 4995.',
      linkText: 'NASA/JPL-Caltech · REMS team, CAB (CSIC–INTA) ↗',
      url: 'https://mars.nasa.gov/msl/mission/instruments/rems/'
    },
    {
      num: '02',
      title: 'Viking Orbiter mosaic',
      subtitle: 'Mars Planet Globe · Valles Marineris hemisphere',
      desc1: '102 Viking Orbiter images. The globe illustrates planetary context.',
      desc2: 'The global view and local traverse show different extents.',
      linkText: 'NASA/JPL-Caltech ↗',
      url: 'https://photojournal.jpl.nasa.gov/catalog/PIA00407'
    },
    {
      num: '03',
      title: 'MRO / HiRISE',
      subtitle: 'PIA26306 · Mount Sharp boxwork',
      desc1: 'The orbital photograph shows the boxwork ridges in the foothills of Mount Sharp.',
      desc2: 'The routes, pins, layer masks and elevation profiles are illustrative overlays.',
      linkText: 'NASA/JPL-Caltech/University of Arizona ↗',
      url: 'https://photojournal.jpl.nasa.gov/catalog/PIA26306'
    },
    {
      num: '04',
      title: 'EVA planning scenario',
      subtitle: 'Local fallback · synthetic inputs',
      desc1: 'Crew resources, communication, route timings and risk scores belong to this scenario.',
      desc2: 'Risk is a heuristic percentage. Radiation dose has no matching measurement in this feed.',
      linkText: 'Design scenario · ARES-Gale',
      url: 'https://mars.nasa.gov/'
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
              fontSize: '40px',
              fontWeight: 600,
              color: '#f3e7d8'
            }}>
              Sources & field assumptions
            </h2>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#b8a99a',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '24px' }} />

        {/* 4 Citation Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {sources.map((src) => (
            <div key={src.num} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '15px',
                color: '#ed9d66',
                fontWeight: 600,
                paddingTop: '4px'
              }}>
                {src.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#f3e7d8' }}>
                    {src.title}
                  </h3>
                  <span style={{ fontSize: '13px', color: '#b8a99a' }}>
                    {src.subtitle}
                  </span>
                </div>
                <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#bdb0a2', lineHeight: 1.5 }}>
                  {src.desc1}
                </p>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#8c7d70', lineHeight: 1.5 }}>
                  {src.desc2}
                </p>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '13px',
                    color: '#f1a16e',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {src.linkText}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', backgroundColor: '#332822', margin: '28px 0 20px 0' }} />

        {/* Back to Mission Control Button */}
        <div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#302923',
              border: '1px solid #7c4c31',
              color: '#f1a16e',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} />
            ← &nbsp; Mission control
          </button>
        </div>
      </div>
    </div>
  );
};
