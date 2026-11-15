import React, { useRef, useEffect } from 'react';
import { ArrowRight, Orbit } from 'lucide-react';
import { FlightScene } from '../mission/FlightScene';
import '../mission/mission.css';

interface LandingPageProps {
  onStartJourney: () => void;
  onOpenConsole?: () => void;
  onReplayCinematic?: () => void;
  onOpenSources?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartJourney }) => {
  const startBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    startBtnRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main className="mission-entry state-start" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Landed 3D Scene with Lander on Gale Crater soil */}
      <FlightScene flying={false} reduced={false} onLanding={() => {}} />

      {/* Top Header Branding: Edited to MARS NAVIGATORS */}
      <header className="mission-mast">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="mission-brand">
            <Orbit aria-hidden="true" style={{ width: '28px', height: '28px', color: '#ffba8c' }} />
            <span>MARS NAVIGATORS<span className="brand-dash">—</span>ARES</span>
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#f1a16e',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginLeft: '40px'
          }}>
            NASA SPACE APPS CHALLENGE 2026
          </div>
        </div>
      </header>

      {/* Center Section: Subtitle, START Button, Quote & Features Content */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        zIndex: 10,
        maxWidth: '720px',
        width: '92%',
        pointerEvents: 'none'
      }}>
        {/* Subtitle Above Button */}
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          color: '#f1a16e',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          marginBottom: '8px',
          textShadow: '0 2px 10px rgba(0,0,0,0.85)'
        }}>
          INTERPLANETARY SURVIVAL GUIDE &nbsp;//&nbsp; GALE CRATER &amp; MOUNT SHARP
        </div>

        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(32px, 5vw, 46px)',
          fontWeight: 700,
          color: '#fff3e7',
          letterSpacing: '2px',
          margin: '0 0 24px 0',
          textShadow: '0 2px 14px rgba(0,0,0,0.9)'
        }}>
          THE MARS NAVIGATORS
        </h1>

        {/* The Exact START -> Button from Adham's branch */}
        <button
          ref={startBtnRef}
          className="mission-start"
          onClick={onStartJourney}
          style={{
            position: 'static',
            transform: 'none',
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        >
          START <ArrowRight strokeWidth={1.5} size={24} />
        </button>

        {/* Content Below Button: Team Quote & Real NASA Pillars */}
        <div style={{
          marginTop: '26px',
          backgroundColor: 'rgba(23, 15, 16, 0.88)',
          border: '1px solid rgba(98, 61, 64, 0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: '8px',
          padding: '16px 24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
          pointerEvents: 'auto'
        }}>
          <p style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#fff0e9',
            margin: '0 0 8px 0',
            lineHeight: 1.4
          }}>
            "WE NAVIGATE MARS!!, or well, we help astronauts do so... but still, that makes us THE MARS NAVIGATORS!!"
          </p>

          <p style={{
            fontSize: '12.5px',
            color: '#cfb5ae',
            margin: '0 0 12px 0',
            lineHeight: 1.5
          }}>
            Astronaut-ready surface route planners for Gale Crater &amp; Mount Sharp. Calculated walking speeds, suit life support draw, and safe clearance from real Martian DEM and Curiosity REMS weather.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            fontSize: '11px',
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#f1a16e',
            borderTop: '1px solid rgba(98, 61, 64, 0.5)',
            paddingTop: '10px'
          }}>
            <span>● Real Martian DEM</span>
            <span>● Physiological Energy</span>
            <span>● Active Hazard Clearance</span>
            <span>● Curiosity REMS Weather</span>
          </div>
        </div>
      </div>

      {/* Bottom-Left Caption from Adham's branch */}
      <footer className="surface-caption">
        <div>
          <span className="location-line" />
          GALE CRATER
        </div>
        <span>Mount Sharp foothills</span>
      </footer>

      {/* Bottom-Right Tag */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(20px, 4vw, 56px)',
        right: 'clamp(20px, 3.7vw, 56px)',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        color: '#a8948f',
        letterSpacing: '1px',
        textShadow: '0 2px 8px #100c0b'
      }}>
        Team Mars Navigators &nbsp;/&nbsp; NASA Space Apps Challenge 2026
      </div>
    </main>
  );
};

export default LandingPage;
