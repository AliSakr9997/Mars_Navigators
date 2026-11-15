import React from 'react';
import { ExternalLink, Globe, Layers, Navigation, X, ShieldAlert, Sparkles, Compass } from 'lucide-react';

interface NasaTrekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoutePlanner?: () => void;
}

export const NASA_TREK_URLS = {
  full: "https://trek.nasa.gov/mars/#v=0.1&x=-64.68780746180258&y=15.918765262591346&z=2&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905&d=&locale=&b=mars&e=-198.98467995668688%2C-45.42888984305606%2C69.60906503308172%2C77.26642036823876&sfz=&w=",
  lite: "https://trek.nasa.gov/treklite//?l=Mars_Viking_MDIM21_ClrMosaic_global_232m,true,1&v=0.1&x=-64.68780746180258&y=15.918765262591346&z=2&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905&d=&locale=&b=mars&e=-198.98467995668688%2C-45.42888984305606%2C69.60906503308172%2C77.26642036823876&sfz=&w="
};

export const NasaTrekModal: React.FC<NasaTrekModalProps> = ({
  isOpen,
  onClose,
  onOpenRoutePlanner
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(12, 10, 9, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1c1714',
        border: '1px solid #7c4c31',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 40px rgba(241, 161, 110, 0.2)',
        color: '#f2e7d8'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #3d3129',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#241e1a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(241, 161, 110, 0.15)',
              border: '1px solid #f1a16e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={20} color="#f1a16e" />
            </div>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#f3e7d8'
              }}>
                NASA MARS TREK // OFFICIAL INTERACTIVE MAP
              </div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#f1a16e',
                letterSpacing: '0.8px'
              }}>
                NASA JPL-CALTECH / USGS ASTROGEOLOGY EXPLORER
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#bdb0a2',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px' }}>
          {/* Mission Context Hero */}
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #443a33',
            marginBottom: '24px',
            backgroundColor: '#120f0d'
          }}>
            <img
              src="/mars_globe.jpg"
              alt="NASA Mars Trek Globe"
              style={{
                width: '100%',
                height: '180px',
                objectFit: 'cover',
                opacity: 0.75,
                filter: 'brightness(0.9) contrast(1.1)'
              }}
              onError={(e) => {
                e.currentTarget.src = "/viking_mosaic.jpg";
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #120f0d 15%, transparent 90%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '16px 20px'
            }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#f1a16e',
                fontWeight: 600,
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>
                GALE CRATER VIEWPORT // LAT -4.685° S, LON 137.435° E
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#f3e7d8',
                maxWidth: '650px',
                lineHeight: 1.4
              }}>
                Explore the actual whole-planet Martian surface powered by NASA JPL Mars Trek. 
                Inspect high-resolution global Viking color mosaics, HRSC 3D topography, and Curiosity rover traverse paths.
              </div>
            </div>
          </div>

          {/* Interactive Portal Choice Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px',
            marginBottom: '26px'
          }}>
            {/* Option A: Full NASA Mars Trek 3D */}
            <div style={{
              backgroundColor: '#26201b',
              border: '1px solid #574134',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.2s'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    backgroundColor: 'rgba(241, 161, 110, 0.15)',
                    color: '#f1a16e',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    FULL 3D GLOBE
                  </span>
                  <ExternalLink size={16} color="#f1a16e" />
                </div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#f3e7d8'
                }}>
                  NASA Mars Trek 3D
                </h3>
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '13px',
                  color: '#bdb0a2',
                  lineHeight: 1.4
                }}>
                  Interactive WebGL 3D globe with whole-planet rotation, zoom into Gale Crater, elevation profiles, sun angle simulation, and VR exploration modes.
                </p>
              </div>

              <a
                href={NASA_TREK_URLS.full}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#f1a16e',
                  color: '#151210',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '17px',
                  letterSpacing: '0.8px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
              >
                OPEN NASA MARS TREK (3D) &nbsp;↗
              </a>
            </div>

            {/* Option B: NASA Trek Lite */}
            <div style={{
              backgroundColor: '#26201b',
              border: '1px solid #574134',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.2s'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    FAST 2D/3D LITE
                  </span>
                  <ExternalLink size={16} color="#38bdf8" />
                </div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#f3e7d8'
                }}>
                  NASA Trek Lite Viewer
                </h3>
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '13px',
                  color: '#bdb0a2',
                  lineHeight: 1.4
                }}>
                  Streamlined Viking MDIM2.1 Color Mosaic (232m global resolution) with coordinates pre-anchored to the Curiosity / Mount Sharp traverse area.
                </p>
              </div>

              <a
                href={NASA_TREK_URLS.lite}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#302923',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '17px',
                  letterSpacing: '0.8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                OPEN NASA TREK LITE &nbsp;↗
              </a>
            </div>
          </div>

          {/* Integrated Basemap Information */}
          <div style={{
            backgroundColor: '#171311',
            border: '1px solid #3d3129',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}>
            <Layers size={22} color="#f1a16e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3e7d8', marginBottom: '4px' }}>
                Directly Synchronized in Mars Navigators Console
              </div>
              <div style={{ fontSize: '13px', color: '#bdb0a2', lineHeight: 1.4 }}>
                Our console map incorporates authentic Martian imagery tiles from NASA JPL and USGS Astrogeology. 
                When planning paths, our multi-route engine calculates slope, hazard clearance, and life-support limits across this exact Gale Crater terrain model.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #3d3129',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#241e1a'
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#8e8175'
          }}>
            DATA: NASA / JPL-CALTECH / USGS ASTROGEOLOGY
          </span>

          <div style={{ display: 'flex', gap: '12px' }}>
            {onOpenRoutePlanner && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRoutePlanner();
                }}
                style={{
                  backgroundColor: '#f1a16e',
                  border: 'none',
                  color: '#151210',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Launch Route Planner &nbsp;→
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#302923',
                border: '1px solid #443a33',
                color: '#bdb0a2',
                padding: '9px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
