import React from 'react';
import { Compass, MapPin, ShieldCheck, Activity, Mountain, ArrowRight, Sparkles, Radio } from 'lucide-react';

interface LandingPageProps {
  onStartJourney: () => void;
  onOpenConsole: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartJourney,
  onOpenConsole
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
      {/* Background Starfield & Atmosphere Ambient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 50% 35%, rgba(224, 108, 58, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 40%),
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
        backgroundSize: '100% 100%, 100% 100%, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px, 450px 450px',
        pointerEvents: 'none'
      }} />

      {/* Top Header */}
      <header style={{
        padding: '24px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/mission_mark.svg"
            alt="Mars Navigators"
            style={{ width: '40px', height: '40px' }}
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: '#f3e7d8'
            }}>
              MARS NAVIGATORS
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#f1a16e',
              letterSpacing: '1px'
            }}>
              NASA SPACE APPS CHALLENGE 2026
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onOpenConsole}
            style={{
              backgroundColor: '#201c19',
              border: '1px solid #623d40',
              borderRadius: '6px',
              color: '#bdb0a2',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f3e7d8';
              e.currentTarget.style.borderColor = '#f1a16e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#bdb0a2';
              e.currentTarget.style.borderColor = '#623d40';
            }}
          >
            Mission Control
          </button>
          <button
            onClick={onStartJourney}
            style={{
              backgroundColor: '#f1a16e',
              border: '1px solid #f1a16e',
              borderRadius: '6px',
              color: '#151210',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Start Route Planner &nbsp;→
          </button>
        </div>
      </header>

      {/* Hero Section with 3D Hovering Mars Planet */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px 20px 20px',
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
          Interplanetary Survival Guide &nbsp;//&nbsp; Gale Crater & Mount Sharp
        </div>

        <h1 style={{
          margin: '0 0 16px 0',
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
          width: 'clamp(260px, 32vw, 360px)',
          height: 'clamp(260px, 32vw, 360px)',
          margin: '15px auto 30px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Subtle Outer Orbital Ring */}
          <div style={{
            position: 'absolute',
            width: '128%',
            height: '128%',
            borderRadius: '50%',
            border: '1px dashed rgba(241, 161, 110, 0.25)',
            transform: 'rotateX(75deg)',
            pointerEvents: 'none'
          }} />

          {/* Mars Sphere with Floating Animation & Realistic 3D Atmosphere */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: `
              0 0 50px rgba(224, 108, 58, 0.35),
              0 0 100px rgba(241, 161, 110, 0.2),
              inset -35px -35px 70px rgba(0, 0, 0, 0.95),
              inset 15px 15px 40px rgba(255, 210, 170, 0.25)
            `,
            border: '1px solid rgba(241, 161, 110, 0.4)',
            animation: 'marsFloat 6s ease-in-out infinite'
          }}>
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
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: 'rgba(241, 161, 110, 0.4)',
                animation: 'pulse 2s infinite'
              }} />
              <div style={{
                position: 'absolute',
                top: '3px',
                left: '3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 10px #f1a16e'
              }} />
            </div>
          </div>
        </div>

        {/* Big Call to Action Button Under Mars */}
        <div style={{ marginBottom: '28px' }}>
          <button
            onClick={onStartJourney}
            style={{
              backgroundColor: '#f1a16e',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 42px',
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

        {/* About the Team Banner */}
        <div style={{
          backgroundColor: '#1b1714',
          border: '1px solid #623d40',
          borderRadius: '12px',
          maxWidth: '780px',
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
            fontSize: '14px',
            color: '#bdb0a2',
            lineHeight: 1.6,
            margin: 0
          }}>
            We build astronaut-ready surface route planners for Gale Crater & Mount Sharp.
            Using actual NASA orbital elevation models and Curiosity REMS weather telemetry, our system calculates real walking times, suit battery & oxygen draw, and safe paths avoiding steep cliffs and sand dune traps.
          </p>
        </div>
      </section>

      {/* 4 Feature Cards (Simple & Informative for Judges and Users) */}
      <section style={{
        maxWidth: '1200px',
        margin: '20px auto 40px auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: '#170f10',
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

        <div style={{
          backgroundColor: '#170f10',
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

        <div style={{
          backgroundColor: '#170f10',
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

        <div style={{
          backgroundColor: '#170f10',
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

