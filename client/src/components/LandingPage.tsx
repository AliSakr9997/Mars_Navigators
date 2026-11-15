import React, { useRef, useEffect, useState } from 'react';
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
  const [isZooming, setIsZooming] = useState<boolean>(false);

  useEffect(() => {
    startBtnRef.current?.focus({ preventScroll: true });
  }, []);

  const handleStart = () => {
    if (isZooming) return;
    setIsZooming(true);
    setTimeout(() => {
      onStartJourney();
    }, 850);
  };

  return (
    <main
      className="mission-entry state-start"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Landed 3D Scene with Lander on Gale Crater soil */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '55% 65%',
          animation: isZooming ? 'sceneZoomDive 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : undefined
        }}
      >
        <FlightScene flying={false} reduced={false} onLanding={() => {}} />
      </div>

      {/* Top Header Branding: Edited to MARS NAVIGATORS */}
      <header
        className="mission-mast"
        style={{
          transition: 'opacity 0.3s ease',
          opacity: isZooming ? 0 : 1
        }}
      >
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
        pointerEvents: isZooming ? 'none' : 'auto',
        transition: 'opacity 0.35s ease, transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1)',
        opacity: isZooming ? 0 : 1,
        transformOrigin: 'center center'
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

        {/* The Exact START -> Button with Zoom-in Click Action */}
        <button
          ref={startBtnRef}
          className="mission-start"
          onClick={handleStart}
          style={{
            position: 'static',
            transform: 'none',
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
          boxShadow: '0 10px 40px rgba(0,0,0,0.7)'
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

      {/* Bottom-Left Caption */}
      <footer
        className="surface-caption"
        style={{
          transition: 'opacity 0.3s ease',
          opacity: isZooming ? 0 : 1
        }}
      >
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
        textShadow: '0 2px 8px #100c0b',
        transition: 'opacity 0.3s ease',
        opacity: isZooming ? 0 : 1
      }}>
        Team Mars Navigators &nbsp;/&nbsp; NASA Space Apps Challenge 2026
      </div>

      {/* =========================================================================
          CINEMATIC ZOOM DIVE OVERLAY (Triggers on pressing START)
          ========================================================================= */}
      {isZooming && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(12, 10, 9, 0.65)',
          animation: 'fadeWarp 0.85s ease-in forwards'
        }}>
          <div style={{
            position: 'relative',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 0 120px rgba(241, 161, 110, 0.85)',
            transformOrigin: '58% 47%',
            animation: 'warpDive 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
          }}>
            <img
              src="/mars_globe.jpg"
              alt="Zooming into Gale Crater"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = "/viking_mosaic.jpg"; }}
            />
            {/* Gale Crater beacon expanding into tactical view */}
            <div style={{
              position: 'absolute',
              top: '47%',
              left: '58%',
              transform: 'translate(-50%, -50%)',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#ff9983',
              boxShadow: '0 0 40px #ffffff',
              animation: 'beaconExpand 0.85s ease-out forwards'
            }} />
          </div>

          <div style={{
            marginTop: '30px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '13px',
            letterSpacing: '3px',
            color: '#f1a16e',
            textTransform: 'uppercase',
            animation: 'pulse 0.4s infinite alternate'
          }}>
            ZOOMING INTO GALE CRATER TACTICAL SCHEMATIC...
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes sceneZoomDive {
          0% {
            transform: scale(1);
            filter: blur(0px) brightness(1);
          }
          45% {
            transform: scale(2.8);
            filter: blur(1.5px) brightness(1.25);
          }
          75% {
            transform: scale(10);
            filter: blur(4px) brightness(1.8);
            opacity: 0.95;
          }
          100% {
            transform: scale(25);
            filter: blur(8px) brightness(2.5);
            opacity: 0;
          }
        }
        @keyframes warpDive {
          0% {
            transform: scale(1);
            filter: blur(0px) brightness(1);
          }
          40% {
            transform: scale(4.5);
            filter: blur(1px) brightness(1.25);
          }
          75% {
            transform: scale(20);
            filter: blur(3px) brightness(1.8);
            opacity: 0.95;
          }
          100% {
            transform: scale(45);
            filter: blur(8px) brightness(2.5);
            opacity: 0;
          }
        }
        @keyframes beaconExpand {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(8);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) scale(50);
            opacity: 1;
          }
        }
        @keyframes fadeWarp {
          0% {
            background-color: rgba(12, 10, 9, 0);
          }
          50% {
            background-color: rgba(12, 10, 9, 0.7);
          }
          85% {
            background-color: #160f10;
          }
          100% {
            background-color: #160f10;
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(0.97);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.03);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
};

export default LandingPage;
