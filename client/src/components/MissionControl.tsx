import React from 'react';
import { Terminal, MapPin, BookOpen, Compass, ExternalLink, Activity, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { TelemetryResponse } from '../types/api';

interface MissionControlProps {
  telemetry: TelemetryResponse | null;
  onNavigateToHome: () => void;
  onNavigateToTraverse: () => void;
  onOpenSources: () => void;
  onOpenSuitTelemetry: () => void;
}

export const MissionControl: React.FC<MissionControlProps> = ({
  telemetry,
  onNavigateToHome,
  onNavigateToTraverse,
  onOpenSources,
  onOpenSuitTelemetry
}) => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#170f10',
      color: '#f3e7d8',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflowX: 'hidden'
    }}>
      {/* 83px Left Navigation Rail */}
      <aside style={{
        width: '83px',
        backgroundColor: '#241819',
        borderRight: '1px solid #332822',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        flexShrink: 0,
        zIndex: 100
      }}>
        {/* Mission Mark */}
        <div
          style={{ marginBottom: '24px', cursor: 'pointer' }}
          onClick={onNavigateToHome}
          title="Return to Home / Mars 3D"
        >
          <img
            src="/mission_mark.svg"
            alt="Mars Navigators"
            style={{ width: '40px', height: '40px', display: 'block' }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
          {/* Home Button */}
          <button
            onClick={onNavigateToHome}
            style={{
              width: '71px',
              height: '58px',
              backgroundColor: '#241819',
              border: '1px solid transparent',
              borderRadius: '6px',
              color: '#b8a99a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '4px',
              padding: '6px 0',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2520'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#241819'}
          >
            <Home size={18} color="#b8a99a" />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>Home</span>
          </button>

          {/* Console Button (Active) */}
          <button
            style={{
              width: '71px',
              height: '58px',
              backgroundColor: '#39291f',
              border: '1px solid #7c4c31',
              borderRadius: '6px',
              color: '#ed9d66',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '4px',
              padding: '6px 0'
            }}
          >
            <Terminal size={18} color="#ed9d66" />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Console</span>
          </button>

          {/* Traverse Button */}
          <button
            onClick={onNavigateToTraverse}
            style={{
              width: '71px',
              height: '58px',
              backgroundColor: '#241819',
              border: '1px solid transparent',
              borderRadius: '6px',
              color: '#b8a99a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '4px',
              padding: '6px 0',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2520'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#241819'}
          >
            <MapPin size={18} color="#b8a99a" />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>Traverse</span>
          </button>

          {/* Sources Button */}
          <button
            onClick={onOpenSources}
            style={{
              width: '71px',
              height: '58px',
              backgroundColor: '#241819',
              border: '1px solid transparent',
              borderRadius: '6px',
              color: '#b8a99a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: '4px',
              padding: '6px 0',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c2520'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#241819'}
          >
            <BookOpen size={18} color="#b8a99a" />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>Sources</span>
          </button>
        </div>
      </aside>

      {/* Main Mission Control Content */}
      <main style={{
        flex: 1,
        padding: '24px 36px',
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Command Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #332822',
          paddingBottom: '20px'
        }}>
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              letterSpacing: '1.5px',
              color: '#ed9d66',
              marginBottom: '4px'
            }}>
              TEAM MARS NAVIGATORS &nbsp;/&nbsp; SURFACE OPERATIONS
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '48px',
              fontWeight: 600,
              letterSpacing: '1px',
              color: '#f3e7d8',
              lineHeight: 1
            }}>
              Mission control
            </h1>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              color: '#b8a99a',
              marginTop: '6px'
            }}>
              GALE CRATER &nbsp;/&nbsp; LOWER MOUNT SHARP
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            <div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                color: '#b8a99a',
                letterSpacing: '1px'
              }}>
                ARCHIVE DATE
              </div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '20px',
                fontWeight: 500,
                color: '#f3e7d8'
              }}>
                25 AUG 2026
              </div>
            </div>

            <div style={{ width: '1px', height: '42px', backgroundColor: '#3d3027' }} />

            <div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                color: '#b8a99a',
                letterSpacing: '1px'
              }}>
                CURIOSITY SOL
              </div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '42px',
                fontWeight: 600,
                color: '#ed9d66',
                lineHeight: 1
              }}>
                {telemetry?.sol || 4995}
              </div>
            </div>
          </div>
        </div>

        {/* Mission Timeline Banner */}
        <div style={{
          backgroundColor: '#211d19',
          border: '1px solid #443b32',
          borderRadius: '8px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              color: '#b8a99a',
              letterSpacing: '1.2px'
            }}>
              EVA SEQUENCE / SIMULATION
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '24px',
              fontWeight: 500,
              color: '#f3e7d8',
              marginTop: '2px'
            }}>
              T+ 01:24:36
            </div>
          </div>

          {/* Stepper Line */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            maxWidth: '900px',
            position: 'relative'
          }}>
            {[
              { label: 'Briefing', state: 'done' },
              { label: 'Egress', state: 'done' },
              { label: 'Traverse', state: 'active' },
              { label: 'Sampling', state: 'pending' },
              { label: 'Return', state: 'pending' }
            ].map((step, idx, arr) => (
              <React.Fragment key={step.label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: step.state === 'active' ? '22px' : '14px',
                    height: step.state === 'active' ? '22px' : '14px',
                    borderRadius: '50%',
                    backgroundColor: step.state === 'active' ? '#f1a16e' : step.state === 'done' ? '#c0c8a1' : '#392d24',
                    border: step.state === 'active' ? '4px solid #5a3725' : '1px solid #5a473a',
                    boxShadow: step.state === 'active' ? '0 0 12px rgba(241, 161, 110, 0.6)' : 'none'
                  }} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: step.state === 'active' ? 600 : 400,
                    color: step.state === 'active' ? '#f1a16e' : step.state === 'done' ? '#f3e7d8' : '#8c7d70'
                  }}>
                    {step.label}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: idx < 2 ? '#c0c8a1' : '#392d24',
                    marginBottom: '20px'
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Middle 3 Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 1fr) minmax(460px, 2fr) minmax(320px, 1.2fr)',
          gap: '20px'
        }}>
          {/* 01 / FIELD SYSTEMS */}
          <div
            onClick={onOpenSuitTelemetry}
            style={{
              backgroundColor: '#201c19',
              border: '1px solid #623d40',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
              minHeight: '380px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f1a16e'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#623d40'}
          >
            <div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#b8a99a',
                letterSpacing: '1px'
              }}>
                01 &nbsp;/&nbsp; FIELD SYSTEMS
              </div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 600,
                color: '#f3e7d8',
                margin: '4px 0 16px 0'
              }}>
                Crew & relay
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Life Support */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#b8a99a' }}>Life support</span>
                    <span style={{ color: '#f3e7d8', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>84%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#332922', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '84%', height: '100%', backgroundColor: '#f1a16e' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#8c7d70', marginTop: '4px' }}>Calculated from EVA duration</div>
                </div>

                {/* Suit Battery */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#b8a99a' }}>Suit battery</span>
                    <span style={{ color: '#f3e7d8', fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>72%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#332922', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', backgroundColor: '#c0c8a1' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#8c7d70', marginTop: '4px' }}>Thermal heaters & comms load</div>
                </div>

                {/* Orbiter Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #332922' }}>
                  <div>
                    <div style={{ color: '#b8a99a', fontSize: '13px' }}>Orbiter link</div>
                    <div style={{ fontSize: '11px', color: '#8c7d70' }}>UHF Relay to Mars Odyssey</div>
                  </div>
                  <span style={{
                    color: '#c0c8a1',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: '#272b20',
                    border: '1px solid #4a543b',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    LINK UP
                  </span>
                </div>

                {/* One-way Delay */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #332922' }}>
                  <div>
                    <div style={{ color: '#b8a99a', fontSize: '13px' }}>One-way light time</div>
                    <div style={{ fontSize: '11px', color: '#8c7d70' }}>Earth-Mars orbital geometry</div>
                  </div>
                  <span style={{
                    color: '#f3e7d8',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    12m 08s
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #332922',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#f1a16e'
            }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>EVA SIMULATION</span>
              <span style={{ color: '#b8a99a' }}>Open telemetry feed ↗</span>
            </div>
          </div>

          {/* 02 / PLANETARY VIEW */}
          <div style={{
            backgroundColor: '#201c19',
            border: '1px solid #623d40',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '380px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: '#b8a99a',
                  letterSpacing: '1px'
                }}>
                  02 &nbsp;/&nbsp; PLANETARY VIEW
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: '#f1a16e',
                  backgroundColor: '#302923',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  VIKING ORBITER
                </span>
              </div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 600,
                color: '#f3e7d8',
                margin: '4px 0 12px 0'
              }}>
                Mars
              </h2>
            </div>

            {/* Central Globe Image with Annotations */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              margin: '12px 0'
            }}>
              {/* Globe */}
              <div style={{
                width: '210px',
                height: '210px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(241, 161, 110, 0.4)',
                boxShadow: '0 0 35px rgba(224, 108, 58, 0.25), inset 0 0 20px rgba(0,0,0,0.8)'
              }}>
                <img
                  src="/mars_globe.jpg"
                  alt="Viking Mars Hemisphere"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = "/viking_mosaic.jpg";
                  }}
                />
              </div>

              {/* Pin pointing to Gale Crater */}
              <div style={{
                position: 'absolute',
                top: '48%',
                left: '60%',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f1a16e',
                  boxShadow: '0 0 10px #f1a16e'
                }} />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: '#f1a16e',
                  fontWeight: 600,
                  backgroundColor: 'rgba(24, 21, 18, 0.85)',
                  padding: '1px 6px',
                  borderRadius: '3px'
                }}>
                  Gale Crater
                </span>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #332922',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '12px', color: '#8c7d70' }}>
                Orbital mosaic &nbsp;/&nbsp; NASA · JPL-Caltech
              </span>
              <button
                onClick={onNavigateToTraverse}
                style={{
                  backgroundColor: '#302923',
                  border: '1px solid #7c4c31',
                  color: '#f1a16e',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#423329'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#302923'}
              >
                Gale traverse &nbsp;↗
              </button>
            </div>
          </div>

          {/* 03 / OBSERVATION LOG */}
          <div style={{
            backgroundColor: '#201c19',
            border: '1px solid #623d40',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '380px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: '#b8a99a',
                  letterSpacing: '1px'
                }}>
                  03 &nbsp;/&nbsp; OBSERVATION LOG
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '11px',
                  color: '#ed9d66'
                }}>
                  CURIOSITY · REMS
                </span>
              </div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 600,
                color: '#f3e7d8',
                margin: '4px 0 16px 0'
              }}>
                Gale environment
              </h2>

              {/* Big Pressure Callout */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                borderBottom: '1px solid #332822',
                paddingBottom: '14px',
                marginBottom: '14px'
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '48px',
                  fontWeight: 600,
                  color: '#f3e7d8',
                  lineHeight: 1
                }}>
                  {telemetry?.rems?.pressure_pa ? Math.round(telemetry.rems.pressure_pa) : 777}
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '18px',
                  color: '#ed9d66'
                }}>
                  Pa
                </span>
                <span style={{ fontSize: '12px', color: '#b8a99a', marginLeft: 'auto' }}>
                  Atmospheric pressure
                </span>
              </div>

              {/* Weather Attributes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#b8a99a' }}>Ground temperature</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f3e7d8' }}>
                    −84 to +4 °C
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#b8a99a' }}>Air temperature</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f3e7d8' }}>
                    −71 to −5 °C
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#b8a99a' }}>UV irradiance</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f1c680' }}>
                    {telemetry?.rems?.uv_index || 'Moderate'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#b8a99a' }}>Radiation dose rate</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#c0c8a1' }}>
                    {telemetry?.rad?.dose_rate_uSv_hour || 24.2} µSv/h
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #332922',
              paddingTop: '12px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#8c7d70'
            }}>
              Archived observation &nbsp;/&nbsp; Sol {telemetry?.sol || 4995}
            </div>
          </div>
        </div>

        {/* 04 / SURFACE WEATHER (Weekly Temperature Profile) */}
        <div style={{
          backgroundColor: '#201c19',
          border: '1px solid #623d40',
          borderRadius: '10px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#b8a99a',
                letterSpacing: '1px'
              }}>
                04 &nbsp;/&nbsp; SURFACE WEATHER
              </span>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600, color: '#f3e7d8' }}>
                Ground temperature
              </h3>
            </div>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              color: '#b8a99a'
            }}>
              19 – 25 AUG 2026
            </span>
          </div>

          {/* SVG Weekly Temperature Profile Chart */}
          <div style={{ width: '100%', height: '140px', position: 'relative' }}>
            <svg
              viewBox="0 0 940 140"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              {/* Horizontal Reference Lines */}
              <line x1="60" y1="20" x2="920" y2="20" stroke="#332922" strokeDasharray="3 3" />
              <text x="25" y="24" fill="#8c7d70" fontSize="11" fontFamily="'IBM Plex Mono', monospace">0°</text>

              <line x1="60" y1="65" x2="920" y2="65" stroke="#332922" strokeDasharray="3 3" />
              <text x="18" y="69" fill="#8c7d70" fontSize="11" fontFamily="'IBM Plex Mono', monospace">-40°</text>

              <line x1="60" y1="110" x2="920" y2="110" stroke="#332922" strokeDasharray="3 3" />
              <text x="18" y="114" fill="#8c7d70" fontSize="11" fontFamily="'IBM Plex Mono', monospace">-80°</text>

              {/* Day Coordinates: Sols 4989 to 4995 */}
              <path
                d="M 100 18 L 230 20 L 360 21 L 490 20 L 620 22 L 750 19 L 880 18"
                fill="none"
                stroke="#f1a16e"
                strokeWidth="2"
              />
              <path
                d="M 100 114 L 230 111 L 360 115 L 490 114 L 620 116 L 750 113 L 880 114"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              <path
                d="M 100 18 L 230 20 L 360 21 L 490 20 L 620 22 L 750 19 L 880 18 L 880 114 L 750 113 L 620 116 L 490 114 L 360 115 L 230 111 L 100 114 Z"
                fill="rgba(241, 161, 110, 0.08)"
              />

              {[
                { sol: 4989, x: 100, max: 2, min: -84 },
                { sol: 4990, x: 230, max: 0, min: -82 },
                { sol: 4991, x: 360, max: -1, min: -85 },
                { sol: 4992, x: 490, max: 0, min: -84 },
                { sol: 4993, x: 620, max: -2, min: -86 },
                { sol: 4994, x: 750, max: 1, min: -83 },
                { sol: 4995, x: 880, max: 2, min: -84 }
              ].map((pt) => (
                <g key={pt.sol}>
                  <circle cx={pt.x} cy="20" r="3" fill="#f1a16e" />
                  <circle cx={pt.x} cy="114" r="3" fill="#38bdf8" />
                  <text
                    x={pt.x}
                    y="135"
                    textAnchor="middle"
                    fill="#8c7d70"
                    fontSize="11"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    {pt.sol}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
};

