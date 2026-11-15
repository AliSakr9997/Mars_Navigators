import React, { useState } from 'react';
import { ShieldCheck, Activity, Mountain, Sparkles, Radio, MapPin } from 'lucide-react';
import { FlightScene } from '../mission/FlightScene';

interface LandingPageProps {
  onStartJourney: () => void;
  onOpenConsole?: () => void;
  onReplayCinematic?: () => void;
  onOpenSources?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartJourney
}) => {
  const [isZooming, setIsZooming] = useState<boolean>(false);

  const handlePlanetClick = () => {
    if (isZooming) return;
    setIsZooming(true);
    setTimeout(() => {
      onStartJourney();
    }, 850);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c0a09',
      color: '#f3e7d8',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* =========================================================================
          TIER 1: UPPER MARTIAN SURFACE HORIZON WITH LANDER (from Adham FlightScene)
          ========================================================================= */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '560px',
        height: '62vh',
        overflow: 'hidden',
        borderBottom: '1px solid #382420'
      }}>
        {/* Landed FlightScene with 3D Lander sitting on Gale Crater */}
        <FlightScene
          flying={false}
          reduced={false}
          onLanding={() => {}}
        />

        {/* Top-Left Header Branding (Matching Mockup Image Exactly) */}
        <div style={{
          position: 'absolute',
          top: '24px',
          left: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 20
        }}>
          <img
            src="/mission_mark.svg"
            alt="Mars Navigators"
            style={{ width: '40px', height: '40px' }}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '1.2px',
              color: '#f3e7d8',
              lineHeight: 1
            }}>
              MARS NAVIGATORS
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#f1a16e',
              letterSpacing: '1.5px',
              marginTop: '4px'
            }}>
              NASA SPACE APPS CHALLENGE 2026
            </div>
          </div>
        </div>

        {/* Bottom-Left Gale Crater Location Caption */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '32px',
          zIndex: 20,
          textShadow: '0 2px 8px #100c0b'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '2px',
            color: '#f1a16e',
            textTransform: 'uppercase'
          }}>
            <span style={{ width: '20px', height: '1px', backgroundColor: '#f1a16e' }} />
            GALE CRATER
          </div>
          <div style={{
            fontSize: '12px',
            color: '#e2ccbb',
            marginTop: '4px'
          }}>
            Mount Sharp foothills
          </div>
        </div>

        {/* Floating Card in Sky (Center-Left of Horizon, exactly matching Image 4) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '35%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(19, 14, 15, 0.92)',
          border: '1px solid rgba(150, 92, 65, 0.5)',
          backdropFilter: 'blur(16px)',
          borderRadius: '10px',
          padding: '22px 28px',
          maxWidth: '430px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 16px 60px rgba(0, 0, 0, 0.75)',
          zIndex: 25
        }}>
          {/* Subtitle */}
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '10px',
            color: '#f1a16e',
            letterSpacing: '1.8px',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            INTERPLANETARY SURVIVAL GUIDE &nbsp;//&nbsp; GALE CRATER &amp; MOUNT SHARP
          </div>

          {/* Heading */}
          <h1 style={{
            margin: '0 0 10px 0',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 700,
            color: '#f3e7d8',
            letterSpacing: '1px',
            lineHeight: 1.1
          }}>
            THE MARS NAVIGATORS
          </h1>

          {/* 3D Hovering Mars Planet Container (Clickable with Zoom-In Effect) */}
          <div
            onClick={handlePlanetClick}
            title="Click Mars planet to zoom into Gale Crater Tactical Schematic Map"
            style={{
              position: 'relative',
              width: '185px',
              height: '185px',
              margin: '10px auto 16px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {/* Subtle Orbital Ring */}
            <div style={{
              position: 'absolute',
              width: '136%',
              height: '136%',
              borderRadius: '50%',
              border: '1px dashed rgba(241, 161, 110, 0.3)',
              transform: 'rotateX(72deg)',
              pointerEvents: 'none'
            }} />

            {/* Mars Sphere with Floating Animation & Realistic 3D Atmosphere */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: `
                  0 0 45px rgba(224, 108, 58, 0.45),
                  0 0 90px rgba(241, 161, 110, 0.3),
                  inset -32px -32px 60px rgba(0, 0, 0, 0.95),
                  inset 14px 14px 35px rgba(255, 210, 170, 0.3)
                `,
                border: '1px solid rgba(241, 161, 110, 0.5)',
                animation: 'marsFloat 6s ease-in-out infinite'
              }}
            >
              <img
                src="/mars_globe.jpg"
                alt="Mars 3D Hovering Planet"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.currentTarget.src = "/viking_mosaic.jpg";
                }}
              />

              {/* Pulsing Gale Crater Beacon */}
              <div style={{
                position: 'absolute',
                top: '47%',
                left: '58%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(241, 161, 110, 0.5)',
                  animation: 'pulse 2s infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 10px #f1a16e'
                }} />
              </div>
            </div>

            {/* Gale Crater Callout Pointer */}
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '68%',
                backgroundColor: 'rgba(24, 21, 18, 0.95)',
                border: '1px solid #f1a16e',
                borderRadius: '5px',
                padding: '4px 10px',
                fontSize: '10px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#f3e7d8',
                boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 30,
                animation: 'marsFloat 6s ease-in-out infinite'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f1a16e', fontWeight: 600 }}>
                <MapPin size={11} />
                GALE CRATER
              </div>
              <span style={{ fontSize: '9px', color: '#c0c8a1' }}>Mount Sharp · 4.6°S, 137.4°E</span>
            </div>
          </div>

          {/* Small START YOUR JOURNEY Button Inside Floating Card */}
          <button
            onClick={handlePlanetClick}
            style={{
              backgroundColor: '#f1a16e',
              border: 'none',
              borderRadius: '5px',
              padding: '10px 24px',
              fontSize: '15px',
              fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '1px',
              color: '#151210',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(241, 161, 110, 0.4)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(241, 161, 110, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(241, 161, 110, 0.4)';
            }}
          >
            START YOUR JOURNEY &nbsp;→
          </button>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: LOWER DETAILS (BUTTON, ABOUT TEAM, 4 CARDS, FOOTER)
          ========================================================================= */}
      <div style={{
        padding: '36px 20px 24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Big Call to Action Button Below the Landscape */}
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={handlePlanetClick}
            style={{
              backgroundColor: '#f1a16e',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 44px',
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '1.5px',
              color: '#151210',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 30px rgba(241, 161, 110, 0.45)',
              transition: 'all 0.25s transform cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(241, 161, 110, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(241, 161, 110, 0.45)';
            }}
          >
            START YOUR JOURNEY &nbsp;→
          </button>
        </div>

        {/* ABOUT THE TEAM Banner */}
        <div style={{
          backgroundColor: '#1b1714',
          border: '1px solid #443a33',
          borderRadius: '12px',
          maxWidth: '840px',
          width: '100%',
          padding: '24px 30px',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: '#f1a16e',
            letterSpacing: '1.5px',
            marginBottom: '8px'
          }}>
            <Sparkles size={16} />
            ABOUT THE TEAM
          </div>

          <p style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#f3e7d8',
            lineHeight: 1.5,
            margin: '0 0 12px 0'
          }}>
            "WE NAVIGATE MARS!!, or well, we help astronauts do so... but still, that makes us THE MARS NAVIGATORS!!"
          </p>

          <p style={{
            fontSize: '13.5px',
            color: '#bdb0a2',
            lineHeight: 1.6,
            margin: 0
          }}>
            We build astronaut-ready surface route planners for Gale Crater &amp; Mount Sharp. Using actual NASA orbital elevation models and Curiosity REMS weather telemetry, our system calculates real walking times, suit battery &amp; oxygen draw, and safe paths avoiding steep cliffs and sand dune traps.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <section style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto 36px auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {/* Card 1: Real Martian DEM */}
          <div style={{
            backgroundColor: '#181512',
            border: '1px solid #332822',
            borderRadius: '10px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ color: '#f1a16e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mountain size={20} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#f3e7d8' }}>Real Martian DEM</span>
            </div>
            <p style={{ fontSize: '13px', color: '#bdb0a2', margin: 0, lineHeight: 1.5 }}>
              Calculated from 50-meter MOLA/HRSC Gale Crater elevation models with real slope angles.
            </p>
          </div>

          {/* Card 2: Physiological Energy */}
          <div style={{
            backgroundColor: '#181512',
            border: '1px solid #332822',
            borderRadius: '10px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ color: '#c0c8a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#f3e7d8' }}>Physiological Energy</span>
            </div>
            <p style={{ fontSize: '13px', color: '#bdb0a2', margin: 0, lineHeight: 1.5 }}>
              Calculates astronaut walking speed (Tobler formula) and metabolic energy in kJ for a 130 kg suited human.
            </p>
          </div>

          {/* Card 3: Active Hazard Clearance */}
          <div style={{
            backgroundColor: '#181512',
            border: '1px solid #332822',
            borderRadius: '10px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ color: '#f4896b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#f3e7d8' }}>Active Hazard Clearance</span>
            </div>
            <p style={{ fontSize: '13px', color: '#bdb0a2', margin: 0, lineHeight: 1.5 }}>
              Detects steep slopes (&gt;20°), active Bagnold sand dune traps, and maintains obstacle buffer clearance.
            </p>
          </div>

          {/* Card 4: Curiosity REMS Weather */}
          <div style={{
            backgroundColor: '#181512',
            border: '1px solid #332822',
            borderRadius: '10px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={20} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#f3e7d8' }}>Curiosity REMS Weather</span>
            </div>
            <p style={{ fontSize: '13px', color: '#bdb0a2', margin: 0, lineHeight: 1.5 }}>
              Live atmospheric pressure (777 Pa) and ground temperatures (−84°C to +4°C) directly from Mars.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          width: '100%',
          padding: '16px 20px',
          borderTop: '1px solid #28211b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#8c7d70'
        }}>
          <span>Team Mars Navigators &nbsp;/&nbsp; NASA Space Apps Challenge 2026</span>
          <span>ARES–Gale Surface Operations Planner</span>
        </footer>
      </div>

      {/* =========================================================================
          ZOOM DIVE ATMOSPHERIC ENTRY OVERLAY (Clicking Planet zooms into Gale Crater)
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
            {/* Gale Crater target expanding */}
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
        @keyframes marsFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-14px) rotate(1.2deg);
          }
        }
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          70% {
            transform: scale(2.2);
            opacity: 0;
          }
          100% {
            transform: scale(0.95);
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
      `}</style>
    </div>
  );
};

export default LandingPage;
