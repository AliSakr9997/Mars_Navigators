import React from 'react';
import { ShieldCheck, Activity, Mountain, ArrowRight, Sparkles, Radio, MapPin } from 'lucide-react';

interface LandingPageProps {
  onStartJourney: () => void;
  onOpenConsole?: () => void;
  onReplayCinematic?: () => void;
  onOpenSources?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartJourney
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c0a09',
      color: '#f3e7d8',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Background: Space Starfield & Atmospheric Martian Gale Crater Horizon (from Landing Scene) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 50% 32%, rgba(224, 108, 58, 0.18) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 40%),
          linear-gradient(180deg, rgba(12, 10, 9, 0.95) 0%, rgba(32, 21, 23, 0.85) 50%, rgba(78, 48, 38, 0.45) 80%, rgba(132, 85, 62, 0.3) 100%),
          radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 140px 170px, rgba(255,255,255,0.7), rgba(0,0,0,0)),
          radial-gradient(1px 1px at 250px 80px, #ffffff, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 380px 220px, rgba(255,200,150,0.8), rgba(0,0,0,0)),
          radial-gradient(1px 1px at 520px 140px, #ffffff, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 680px 290px, rgba(255,255,255,0.6), rgba(0,0,0,0)),
          radial-gradient(1px 1px at 810px 110px, #ffffff, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 950px 260px, rgba(255,200,150,0.7), rgba(0,0,0,0)),
          radial-gradient(1px 1px at 1120px 90px, #ffffff, rgba(0,0,0,0)),
          radial-gradient(2px 2px at 1280px 220px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
          radial-gradient(1px 1px at 1420px 150px, #ffffff, rgba(0,0,0,0))
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px',
        pointerEvents: 'none'
      }} />

      {/* Top Header - Clean, No Top-Right Buttons */}
      <header style={{
        padding: '24px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/mission_mark.svg"
            alt="Mars Navigators"
            style={{ width: '42px', height: '42px' }}
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

        {/* Note: The 4 buttons from 1st image are completely removed as requested */}
      </header>

      {/* Hero Section with 3D Hovering Mars Planet */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 20px 10px 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Mission Subtitle */}
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '13px',
          color: '#f1a16e',
          letterSpacing: '2px',
          marginBottom: '8px',
          textTransform: 'uppercase'
        }}>
          Interplanetary Survival Guide &nbsp;//&nbsp; Gale Crater &amp; Mount Sharp
        </div>

        {/* Main Title */}
        <h1 style={{
          margin: '0 0 12px 0',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(44px, 6vw, 76px)',
          fontWeight: 700,
          color: '#f3e7d8',
          letterSpacing: '1.5px',
          lineHeight: 1.05
        }}>
          THE MARS NAVIGATORS
        </h1>

        {/* 3D Hovering Mars Planet Container */}
        <div style={{
          position: 'relative',
          width: 'clamp(270px, 34vw, 380px)',
          height: 'clamp(270px, 34vw, 380px)',
          margin: '12px auto 26px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Subtle Outer Orbital Ring */}
          <div style={{
            position: 'absolute',
            width: '132%',
            height: '132%',
            borderRadius: '50%',
            border: '1px dashed rgba(241, 161, 110, 0.3)',
            transform: 'rotateX(72deg)',
            pointerEvents: 'none'
          }} />

          {/* Mars Sphere with Floating Animation & Realistic 3D Atmosphere */}
          <div
            onClick={onStartJourney}
            title="Mars 3D Hovering Planet · Click to explore Gale Crater"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: `
                0 0 55px rgba(224, 108, 58, 0.4),
                0 0 110px rgba(241, 161, 110, 0.25),
                inset -38px -38px 75px rgba(0, 0, 0, 0.96),
                inset 16px 16px 40px rgba(255, 210, 170, 0.3)
              `,
              border: '1px solid rgba(241, 161, 110, 0.45)',
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

            {/* In-situ Gale Crater Pulsing Beacon */}
            <div style={{
              position: 'absolute',
              top: '47%',
              left: '58%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}>
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'rgba(241, 161, 110, 0.45)',
                animation: 'pulse 2s infinite'
              }} />
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 12px #f1a16e'
              }} />
            </div>
          </div>

          {/* Gale Crater Pointer Tag */}
          <div
            onClick={onStartJourney}
            style={{
              position: 'absolute',
              top: '32%',
              left: '70%',
              backgroundColor: 'rgba(24, 21, 18, 0.92)',
              border: '1px solid #f1a16e',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              fontFamily: "'IBM Plex Mono', monospace",
              color: '#f3e7d8',
              boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              cursor: 'pointer',
              zIndex: 20,
              pointerEvents: 'auto',
              whiteSpace: 'nowrap',
              animation: 'marsFloat 6s ease-in-out infinite'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f1a16e', fontWeight: 600 }}>
              <MapPin size={12} />
              GALE CRATER
            </div>
            <span style={{ fontSize: '10px', color: '#c0c8a1' }}>Mount Sharp · 4.6°S, 137.4°E</span>
          </div>
        </div>

        {/* START YOUR JOURNEY Button Under Mars */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={onStartJourney}
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
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
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
      </section>

      {/* 4 Feature Cards */}
      <section style={{
        maxWidth: '1200px',
        margin: '18px auto 36px auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        position: 'relative',
        zIndex: 10
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
        padding: '16px 36px',
        borderTop: '1px solid #28211b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#8c7d70',
        position: 'relative',
        zIndex: 10
      }}>
        <span>Team Mars Navigators &nbsp;/&nbsp; NASA Space Apps Challenge 2026</span>
        <span>ARES–Gale Surface Operations Planner</span>
      </footer>

      {/* Floating Keyframes CSS */}
      <style>{`
        @keyframes marsFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-16px) rotate(1.5deg);
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
      `}</style>
    </div>
  );
};
