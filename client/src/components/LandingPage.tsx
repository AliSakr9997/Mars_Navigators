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
              border: '1px solid #443a33',
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
              e.currentTarget.style.borderColor = '#443a33';
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
          margin: '25px auto 40px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Phobos Orbital Ellipse Track */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '430px',
            height: '144px',
            marginTop: '-72px',
            marginLeft: '-215px',
            borderRadius: '50%',
            border: '1px dashed rgba(241, 161, 110, 0.22)',
            transform: 'rotate(-14deg)',
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Deimos Orbital Ellipse Track */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '580px',
            height: '190px',
            marginTop: '-95px',
            marginLeft: '-290px',
            borderRadius: '50%',
            border: '1px dashed rgba(214, 200, 184, 0.16)',
            transform: 'rotate(12deg)',
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Phobos Moon Orbit Container (Self-spin like Mars + Orbit around Mars) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              animation: 'orbitPhobos 24s linear infinite',
              pointerEvents: 'auto'
            }}
          >
            <div
              title="PHOBOS (Inner Moon) — Distance: 9,376 km | Orbit: 7h 39m | Main Feature: Stickney Crater"
              style={{
                position: 'absolute',
                top: '-15px',
                left: '-16px',
                width: '32px',
                height: '28px',
                cursor: 'pointer',
                borderRadius: '46% 54% 48% 52% / 54% 46% 52% 48%',
                overflow: 'hidden',
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.95), 0 0 3px rgba(241, 161, 110, 0.3)'
              }}
            >
              {/* Seamless Axis-Spinning Phobos Surface Map (Spins like Mars!) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '400%',
                  height: '100%',
                  display: 'flex',
                  animation: 'phobosSpin 12s linear infinite',
                  willChange: 'transform'
                }}
              >
                <img
                  src="/phobos_map_web.jpg"
                  alt="Phobos Surface 1"
                  style={{
                    width: '50%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <img
                  src="/phobos_map_web.jpg"
                  alt="Phobos Surface 2"
                  style={{
                    width: '50%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>

              {/* 3D Spherical Solar Shading on Phobos */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle at 30% 28%, rgba(255, 235, 210, 0.22) 0%, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.88) 90%)',
                  boxShadow: 'inset -5px -5px 8px rgba(0, 0, 0, 0.96), inset 2px 2px 4px rgba(255, 220, 180, 0.25)',
                  border: '1px solid rgba(241, 161, 110, 0.25)'
                }}
              />

              {/* Telemetry Tag */}
              <div style={{
                position: 'absolute',
                bottom: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '8px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#f1a16e',
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
                opacity: 0.85,
                pointerEvents: 'none',
                textShadow: '0 2px 4px rgba(0,0,0,0.9)'
              }}>
                PHOBOS
              </div>
            </div>
          </div>

          {/* Deimos Moon Orbit Container (Self-spin like Mars + Orbit around Mars) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              animation: 'orbitDeimos 32s linear infinite',
              pointerEvents: 'auto'
            }}
          >
            <div
              title="DEIMOS (Outer Moon) — Distance: 23,463 km | Orbit: 30.3h | Main Feature: Regolith Blanket & Voltaire Crater"
              style={{
                position: 'absolute',
                top: '-11px',
                left: '-11px',
                width: '22px',
                height: '20px',
                cursor: 'pointer',
                borderRadius: '52% 48% 46% 54% / 48% 52% 54% 46%',
                overflow: 'hidden',
                boxShadow: '0 0 6px rgba(0, 0, 0, 0.95), 0 0 2px rgba(214, 200, 184, 0.25)'
              }}
            >
              {/* Seamless Axis-Spinning Deimos Surface Map (Spins like Mars!) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '400%',
                  height: '100%',
                  display: 'flex',
                  animation: 'deimosSpin 16s linear infinite',
                  willChange: 'transform'
                }}
              >
                <img
                  src="/deimos_map_web.jpg"
                  alt="Deimos Surface 1"
                  style={{
                    width: '50%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <img
                  src="/deimos_map_web.jpg"
                  alt="Deimos Surface 2"
                  style={{
                    width: '50%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>

              {/* 3D Spherical Solar Shading on Deimos */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle at 30% 28%, rgba(255, 235, 210, 0.22) 0%, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.85) 90%)',
                  boxShadow: 'inset -3px -3px 6px rgba(0, 0, 0, 0.96), inset 1px 1px 3px rgba(255, 220, 180, 0.25)',
                  border: '1px solid rgba(214, 200, 184, 0.2)'
                }}
              />

              {/* Telemetry Tag */}
              <div style={{
                position: 'absolute',
                bottom: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '8px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#d6c8b8',
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
                opacity: 0.85,
                pointerEvents: 'none',
                textShadow: '0 2px 4px rgba(0,0,0,0.9)'
              }}>
                DEIMOS
              </div>
            </div>
          </div>

          {/* Mars Sphere with Floating Animation & Realistic 3D Atmosphere */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10,
            boxShadow: `
              0 0 50px rgba(224, 108, 58, 0.38),
              0 0 100px rgba(241, 161, 110, 0.22)
            `,
            border: '1px solid rgba(241, 161, 110, 0.45)',
            animation: 'marsFloat 6s ease-in-out infinite'
          }}>
            {/* Seamless 360-Degree Continuous Rotating Mars Texture */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '400%',
              height: '100%',
              display: 'flex',
              animation: 'marsSeamlessSpin 40s linear infinite',
              willChange: 'transform'
            }}>
              <img
                src="/mars_texture_2k.jpg"
                alt="Mars Rotating Surface Part 1"
                style={{
                  width: '50%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <img
                src="/mars_texture_2k.jpg"
                alt="Mars Rotating Surface Part 2"
                style={{
                  width: '50%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* 3D Spherical Curvature, Shadow & Specular Atmosphere Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              pointerEvents: 'none',
              background: 'radial-gradient(circle at 32% 30%, rgba(255, 230, 200, 0.22) 0%, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.65) 75%, rgba(0, 0, 0, 0.95) 100%)',
              boxShadow: `
                inset -38px -38px 75px rgba(0, 0, 0, 0.96),
                inset 16px 16px 42px rgba(255, 215, 175, 0.3)
              `
            }} />
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
          border: '1px solid #443a33',
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
        @keyframes marsSeamlessSpin {
          0% {
            transform: translate3d(0%, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
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
        @keyframes phobosSpin {
          0% {
            transform: translate3d(0%, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes deimosSpin {
          0% {
            transform: translate3d(0%, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes orbitPhobos {
          0.0% { transform: translate(208.6px, -52.0px) scale(1.000); z-index: 25; }
          2.5% { transform: translate(208.8px, -40.4px) scale(1.019); z-index: 25; }
          5.0% { transform: translate(203.8px, -27.9px) scale(1.037); z-index: 25; }
          7.5% { transform: translate(193.8px, -14.6px) scale(1.054); z-index: 25; }
          10.0% { transform: translate(179.0px, -1.0px) scale(1.071); z-index: 25; }
          12.5% { transform: translate(159.8px, 12.6px) scale(1.085); z-index: 25; }
          15.0% { transform: translate(136.7px, 25.9px) scale(1.097); z-index: 25; }
          17.5% { transform: translate(110.2px, 38.6px) scale(1.107); z-index: 25; }
          20.0% { transform: translate(81.0px, 50.4px) scale(1.114); z-index: 25; }
          22.5% { transform: translate(49.8px, 60.9px) scale(1.119); z-index: 25; }
          25.0% { transform: translate(17.4px, 69.9px) scale(1.120); z-index: 25; }
          27.5% { transform: translate(-15.4px, 77.1px) scale(1.119); z-index: 25; }
          30.0% { transform: translate(-47.9px, 82.5px) scale(1.114); z-index: 25; }
          32.5% { transform: translate(-79.2px, 85.9px) scale(1.107); z-index: 25; }
          35.0% { transform: translate(-108.5px, 87.1px) scale(1.097); z-index: 25; }
          37.5% { transform: translate(-135.2px, 86.2px) scale(1.085); z-index: 25; }
          40.0% { transform: translate(-158.5px, 83.1px) scale(1.071); z-index: 25; }
          42.5% { transform: translate(-178.0px, 78.1px) scale(1.054); z-index: 25; }
          45.0% { transform: translate(-193.0px, 71.1px) scale(1.037); z-index: 25; }
          47.5% { transform: translate(-203.3px, 62.3px) scale(1.019); z-index: 25; }
          50.0% { transform: translate(-208.6px, 52.0px) scale(1.000); z-index: 25; }
          52.5% { transform: translate(-208.8px, 40.4px) scale(0.981); z-index: 2; }
          55.0% { transform: translate(-203.8px, 27.9px) scale(0.963); z-index: 2; }
          57.5% { transform: translate(-193.8px, 14.6px) scale(0.946); z-index: 2; }
          60.0% { transform: translate(-179.0px, 1.0px) scale(0.929); z-index: 2; }
          62.5% { transform: translate(-159.8px, -12.6px) scale(0.915); z-index: 2; }
          65.0% { transform: translate(-136.7px, -25.9px) scale(0.903); z-index: 2; }
          67.5% { transform: translate(-110.2px, -38.6px) scale(0.893); z-index: 2; }
          70.0% { transform: translate(-81.0px, -50.4px) scale(0.886); z-index: 2; }
          72.5% { transform: translate(-49.8px, -60.9px) scale(0.881); z-index: 2; }
          75.0% { transform: translate(-17.4px, -69.9px) scale(0.880); z-index: 2; }
          77.5% { transform: translate(15.4px, -77.1px) scale(0.881); z-index: 2; }
          80.0% { transform: translate(47.9px, -82.5px) scale(0.886); z-index: 2; }
          82.5% { transform: translate(79.2px, -85.9px) scale(0.893); z-index: 2; }
          85.0% { transform: translate(108.5px, -87.1px) scale(0.903); z-index: 2; }
          87.5% { transform: translate(135.2px, -86.2px) scale(0.915); z-index: 2; }
          90.0% { transform: translate(158.5px, -83.1px) scale(0.929); z-index: 2; }
          92.5% { transform: translate(178.0px, -78.1px) scale(0.946); z-index: 2; }
          95.0% { transform: translate(193.0px, -71.1px) scale(0.963); z-index: 2; }
          97.5% { transform: translate(203.3px, -62.3px) scale(0.981); z-index: 2; }
          100.0% { transform: translate(208.6px, -52.0px) scale(1.000); z-index: 25; }
        }

        @keyframes orbitDeimos {
          0.0% { transform: translate(283.7px, 60.3px) scale(1.000); z-index: 25; }
          2.5% { transform: translate(277.1px, 74.1px) scale(1.019); z-index: 25; }
          5.0% { transform: translate(263.7px, 86.1px) scale(1.037); z-index: 25; }
          7.5% { transform: translate(243.8px, 95.9px) scale(1.054); z-index: 25; }
          10.0% { transform: translate(217.9px, 103.4px) scale(1.071); z-index: 25; }
          12.5% { transform: translate(186.6px, 108.3px) scale(1.085); z-index: 25; }
          15.0% { transform: translate(150.8px, 110.6px) scale(1.097); z-index: 25; }
          17.5% { transform: translate(111.2px, 110.2px) scale(1.107); z-index: 25; }
          20.0% { transform: translate(68.9px, 107.0px) scale(1.114); z-index: 25; }
          22.5% { transform: translate(24.9px, 101.2px) scale(1.119); z-index: 25; }
          25.0% { transform: translate(-19.8px, 92.9px) scale(1.120); z-index: 25; }
          27.5% { transform: translate(-63.9px, 82.3px) scale(1.119); z-index: 25; }
          30.0% { transform: translate(-106.4px, 69.7px) scale(1.114); z-index: 25; }
          32.5% { transform: translate(-146.4px, 55.4px) scale(1.107); z-index: 25; }
          35.0% { transform: translate(-182.7px, 39.7px) scale(1.097); z-index: 25; }
          37.5% { transform: translate(-214.5px, 23.1px) scale(1.085); z-index: 25; }
          40.0% { transform: translate(-241.1px, 5.8px) scale(1.071); z-index: 25; }
          42.5% { transform: translate(-261.7px, -11.5px) scale(1.054); z-index: 25; }
          45.0% { transform: translate(-275.9px, -28.6px) scale(1.037); z-index: 25; }
          47.5% { transform: translate(-283.3px, -45.0px) scale(1.019); z-index: 25; }
          50.0% { transform: translate(-283.7px, -60.3px) scale(1.000); z-index: 25; }
          52.5% { transform: translate(-277.1px, -74.1px) scale(0.981); z-index: 2; }
          55.0% { transform: translate(-263.7px, -86.1px) scale(0.963); z-index: 2; }
          57.5% { transform: translate(-243.8px, -95.9px) scale(0.946); z-index: 2; }
          60.0% { transform: translate(-217.9px, -103.4px) scale(0.929); z-index: 2; }
          62.5% { transform: translate(-186.6px, -108.3px) scale(0.915); z-index: 2; }
          65.0% { transform: translate(-150.8px, -110.6px) scale(0.903); z-index: 2; }
          67.5% { transform: translate(-111.2px, -110.2px) scale(0.893); z-index: 2; }
          70.0% { transform: translate(-68.9px, -107.0px) scale(0.886); z-index: 2; }
          72.5% { transform: translate(-24.9px, -101.2px) scale(0.881); z-index: 2; }
          75.0% { transform: translate(19.8px, -92.9px) scale(0.880); z-index: 2; }
          77.5% { transform: translate(63.9px, -82.3px) scale(0.881); z-index: 2; }
          80.0% { transform: translate(106.4px, -69.7px) scale(0.886); z-index: 2; }
          82.5% { transform: translate(146.4px, -55.4px) scale(0.893); z-index: 2; }
          85.0% { transform: translate(182.7px, -39.7px) scale(0.903); z-index: 2; }
          87.5% { transform: translate(214.5px, -23.1px) scale(0.915); z-index: 2; }
          90.0% { transform: translate(241.1px, -5.8px) scale(0.929); z-index: 2; }
          92.5% { transform: translate(261.7px, 11.5px) scale(0.946); z-index: 2; }
          95.0% { transform: translate(275.9px, 28.6px) scale(0.963); z-index: 2; }
          97.5% { transform: translate(283.3px, 45.0px) scale(0.981); z-index: 2; }
          100.0% { transform: translate(283.7px, 60.3px) scale(1.000); z-index: 25; }
        }
      `}</style>
    </div>
  );
};
