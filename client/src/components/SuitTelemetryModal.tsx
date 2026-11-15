import React, { useState } from 'react';
import { X, ArrowLeft, Activity, Radio, Plus, Check } from 'lucide-react';
import { TelemetryResponse } from '../types/api';

interface SuitTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryResponse | null;
  evaTimeHours?: number;
}

interface TelemetryEntry {
  time: string;
  source: string;
  oxygen: string;
  battery: string;
  suitTemp: string;
  radiation: string;
}

export const SuitTelemetryModal: React.FC<SuitTelemetryModalProps> = ({
  isOpen,
  onClose,
  telemetry
}) => {
  if (!isOpen) return null;

  const [channel, setChannel] = useState<'manual' | 'feed'>('manual');
  const [oxygenInput, setOxygenInput] = useState<string>('84');
  const [batteryInput, setBatteryInput] = useState<string>('72');
  const [suitTempInput, setSuitTempInput] = useState<string>('21.5');
  const [radiationInput, setRadiationInput] = useState<string>('24.2');

  const [latestReadings, setLatestReadings] = useState({
    oxygen: '84',
    battery: '72',
    suitTemp: '21.5',
    radiation: '24.2'
  });

  const [savedEntries, setSavedEntries] = useState<TelemetryEntry[]>([
    {
      time: '14:22:08',
      source: 'Suit UHF-1',
      oxygen: '86%',
      battery: '75%',
      suitTemp: '21.2°C',
      radiation: '23.8 µSv/h'
    },
    {
      time: '14:24:36',
      source: 'Suit UHF-1',
      oxygen: '84%',
      battery: '72%',
      suitTemp: '21.5°C',
      radiation: '24.2 µSv/h'
    }
  ]);

  const handleSaveSample = () => {
    const newEntry: TelemetryEntry = {
      time: new Date().toISOString().substring(11, 19),
      source: channel === 'manual' ? 'Manual entry' : 'Suit UHF-1',
      oxygen: `${oxygenInput}%`,
      battery: `${batteryInput}%`,
      suitTemp: `${suitTempInput}°C`,
      radiation: `${radiationInput} µSv/h`
    };

    setLatestReadings({
      oxygen: oxygenInput,
      battery: batteryInput,
      suitTemp: suitTempInput,
      radiation: radiationInput
    });

    setSavedEntries([newEntry, ...savedEntries.slice(0, 11)]);
  };

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
        backgroundColor: '#170f10',
        border: '1px solid #623d40',
        borderRadius: '12px',
        maxWidth: '1100px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '32px',
        color: '#f3e7d8',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              color: '#ed9d66',
              letterSpacing: '1.2px',
              marginBottom: '4px'
            }}>
              ARES–GALE &nbsp;/&nbsp; SURFACE OPERATIONS
            </div>
            <h1 style={{
              margin: 0,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '44px',
              fontWeight: 600,
              color: '#f3e7d8'
            }}>
              Suit telemetry
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#302923',
                border: '1px solid #7c4c31',
                color: '#f1a16e',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} />
              ← &nbsp; Mission control
            </button>
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
              <X size={22} />
            </button>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#332822', marginBottom: '24px' }} />

        {/* 2-Column Split: Reading Source & Latest Readings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Left Column: Reading source */}
          <div style={{
            backgroundColor: '#201c19',
            border: '1px solid #623d40',
            borderRadius: '10px',
            padding: '24px'
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#b8a99a',
              letterSpacing: '1px',
              marginBottom: '2px'
            }}>
              INPUT CHANNEL
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f3e7d8', margin: '0 0 16px 0' }}>
              Reading source
            </h2>

            {/* Toggle Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => setChannel('manual')}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: channel === 'manual' ? '#39291f' : '#241819',
                  border: channel === 'manual' ? '1px solid #f1a16e' : '1px solid #623d40',
                  color: channel === 'manual' ? '#f1a16e' : '#b8a99a',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Manual entry
              </button>
              <button
                onClick={() => setChannel('feed')}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: channel === 'feed' ? '#39291f' : '#241819',
                  border: channel === 'feed' ? '1px solid #f1a16e' : '1px solid #623d40',
                  color: channel === 'feed' ? '#f1a16e' : '#b8a99a',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Link suit feed
              </button>
            </div>

            {/* Input Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#b8a99a', display: 'block', marginBottom: '6px' }}>
                  Oxygen remaining
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#302923',
                  border: '1px solid #623d40',
                  borderRadius: '6px',
                  padding: '8px 14px'
                }}>
                  <input
                    type="number"
                    value={oxygenInput}
                    onChange={(e) => setOxygenInput(e.target.value)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f3e7d8',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '15px',
                      flex: 1,
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: '#8c7d70', fontSize: '13px' }}>%</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#b8a99a', display: 'block', marginBottom: '6px' }}>
                  Suit battery
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#302923',
                  border: '1px solid #623d40',
                  borderRadius: '6px',
                  padding: '8px 14px'
                }}>
                  <input
                    type="number"
                    value={batteryInput}
                    onChange={(e) => setBatteryInput(e.target.value)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f3e7d8',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '15px',
                      flex: 1,
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: '#8c7d70', fontSize: '13px' }}>%</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#b8a99a', display: 'block', marginBottom: '6px' }}>
                  Internal suit temperature
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#302923',
                  border: '1px solid #623d40',
                  borderRadius: '6px',
                  padding: '8px 14px'
                }}>
                  <input
                    type="number"
                    step="0.1"
                    value={suitTempInput}
                    onChange={(e) => setSuitTempInput(e.target.value)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f3e7d8',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '15px',
                      flex: 1,
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: '#8c7d70', fontSize: '13px' }}>°C</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: '#b8a99a', display: 'block', marginBottom: '6px' }}>
                  Radiation dose rate (optional)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#302923',
                  border: '1px solid #623d40',
                  borderRadius: '6px',
                  padding: '8px 14px'
                }}>
                  <input
                    type="number"
                    step="0.1"
                    value={radiationInput}
                    onChange={(e) => setRadiationInput(e.target.value)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f3e7d8',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '15px',
                      flex: 1,
                      outline: 'none'
                    }}
                  />
                  <span style={{ color: '#8c7d70', fontSize: '13px' }}>µSv/h</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSample}
              style={{
                marginTop: '20px',
                width: '100%',
                backgroundColor: '#f1a16e',
                color: '#151210',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Check size={16} />
              Save sample &nbsp;↗
            </button>
          </div>

          {/* Right Column: Latest readings */}
          <div style={{
            backgroundColor: '#201c19',
            border: '1px solid #623d40',
            borderRadius: '10px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: '#b8a99a',
                letterSpacing: '1px',
                marginBottom: '2px'
              }}>
                INSTRUMENT READOUT
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#f3e7d8', margin: '0 0 16px 0' }}>
                Latest readings
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #332822', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#f3e7d8', fontWeight: 500 }}>Oxygen remaining</div>
                    <div style={{ fontSize: '12px', color: '#c0c8a1' }}>Normal metabolic draw</div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '26px', fontWeight: 600, color: '#f3e7d8' }}>
                    {latestReadings.oxygen}%
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #332822', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#f3e7d8', fontWeight: 500 }}>Suit battery</div>
                    <div style={{ fontSize: '12px', color: '#c0c8a1' }}>Thermal heating active</div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '26px', fontWeight: 600, color: '#f3e7d8' }}>
                    {latestReadings.battery}%
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #332822', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#f3e7d8', fontWeight: 500 }}>Internal suit temperature</div>
                    <div style={{ fontSize: '12px', color: '#f1a16e' }}>Core environment setpoint</div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '26px', fontWeight: 600, color: '#f3e7d8' }}>
                    {latestReadings.suitTemp}°C
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#f3e7d8', fontWeight: 500 }}>Radiation dose rate</div>
                    <div style={{ fontSize: '12px', color: '#f1c680' }}>Curiosity RAD in-situ baseline</div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '26px', fontWeight: 600, color: '#f3e7d8' }}>
                    {latestReadings.radiation} µSv/h
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#8c7d70',
              paddingTop: '16px',
              borderTop: '1px solid #332822'
            }}>
              GALE CRATER &nbsp;/&nbsp; CREW SYSTEMS
            </div>
          </div>
        </div>

        {/* Bottom Section: Reading Log */}
        <div style={{
          backgroundColor: '#201c19',
          border: '1px solid #623d40',
          borderRadius: '10px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f3e7d8' }}>
              Reading log
            </h3>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: '#b8a99a'
            }}>
              LATEST 12 &nbsp;/&nbsp; UTC
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #332822', color: '#8c7d70' }}>
                <th style={{ padding: '8px 12px' }}>Time</th>
                <th style={{ padding: '8px 12px' }}>Source</th>
                <th style={{ padding: '8px 12px' }}>Oxygen</th>
                <th style={{ padding: '8px 12px' }}>Battery</th>
                <th style={{ padding: '8px 12px' }}>Suit temp.</th>
                <th style={{ padding: '8px 12px' }}>Radiation dose rate</th>
              </tr>
            </thead>
            <tbody>
              {savedEntries.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #28211b' }}>
                  <td style={{ padding: '10px 12px', fontFamily: "'IBM Plex Mono', monospace", color: '#f1a16e' }}>{row.time}</td>
                  <td style={{ padding: '10px 12px', color: '#b8a99a' }}>{row.source}</td>
                  <td style={{ padding: '10px 12px', fontFamily: "'IBM Plex Mono', monospace", color: '#f3e7d8' }}>{row.oxygen}</td>
                  <td style={{ padding: '10px 12px', fontFamily: "'IBM Plex Mono', monospace", color: '#f3e7d8' }}>{row.battery}</td>
                  <td style={{ padding: '10px 12px', fontFamily: "'IBM Plex Mono', monospace", color: '#f3e7d8' }}>{row.suitTemp}</td>
                  <td style={{ padding: '10px 12px', fontFamily: "'IBM Plex Mono', monospace", color: '#f1c680' }}>{row.radiation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

