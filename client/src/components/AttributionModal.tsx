import React from 'react';
import { X, ExternalLink, Database, ShieldAlert, Award } from 'lucide-react';

interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AttributionModal: React.FC<AttributionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0a0f1d',
        border: '1px solid #334155',
        borderRadius: '12px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '24px',
        color: '#f8fafc',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '0.5px' }}>
              NASA Scientific Datasets & Attribution
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
          <strong>ARES–Gale</strong> was developed for the <strong>NASA Space Apps Challenge 2026</strong> under the challenge <em>"Interplanetary Survival Guide: Martian Map"</em>. The system integrates real orbital and in-situ datasets from NASA and international planetary missions:
        </p>

        {/* Datasets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>1. HRSC & MOLA Topography (DEM)</span>
              <span style={{ fontSize: '10px', color: '#94a3b8', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>20m–50m/px</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              ESA Mars Express HRSC & NASA Mars Global Surveyor MOLA blended Digital Elevation Models for Gale Crater surface slope, elevation profiling, and terrain cost calculation.
            </p>
          </div>

          <div style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '13px' }}>2. CTX & HiRISE High-Resolution Optical Mosaics</span>
              <span style={{ fontSize: '10px', color: '#94a3b8', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>0.25m–6m/px</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              NASA Mars Reconnaissance Orbiter (MRO) Context Camera & HiRISE camera mosaics (NASA/JPL-Caltech/MSSS/University of Arizona/USGS Astrogeology) providing visual landmarks and rock-field texture analysis.
            </p>
          </div>

          <div style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#a855f7', fontSize: '13px' }}>3. CRISM Spectral Mineralogy & USGS Geologic Mapping</span>
              <span style={{ fontSize: '10px', color: '#94a3b8', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>Spectral / Vectors</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              USGS Planetary Geologic Mapping Program & CRISM identifying Gale Crater's Clay-bearing unit (smectite), Sulfate-bearing layered strata, and target Boxwork ridge polygonal fractures.
            </p>
          </div>

          <div style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#10b981', fontSize: '13px' }}>4. MSL Curiosity REMS & RAD In-Situ Environmental Telemetry</span>
              <span style={{ fontSize: '10px', color: '#94a3b8', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>In-Situ Sol 4000</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Rover Environmental Monitoring Station (REMS - CAB/INTA) diurnal ground/air temperatures and atmospheric pressure, plus Radiation Assessment Detector (RAD - SwRI/NASA) galactic cosmic ray dose rates (~0.67 mSv/day).
            </p>
          </div>

        </div>

        {/* Scientific Disclaimer */}
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
            <ShieldAlert size={14} />
            Scientific Integrity Disclaimer
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            In-situ REMS and RAD data are local point measurements taken by NASA's Curiosity rover at Mount Sharp, not continuous regional spatial grids. Prototype route difficulty scores, Tobler hiking velocity estimates, and Minetti metabolic energy proxies are simulation models intended for mission architecture demonstrations, not certified flight safety predictions.
          </p>
        </div>

        {/* Footer Close */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f59e0b',
              color: '#090d16',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
