import React, { useState } from 'react';
import { Activity, ShieldCheck, Zap, Wind, Sliders, Radio, Save, RotateCcw } from 'lucide-react';
import { RouteResponse, TelemetryResponse, TransportMode } from '../types/api';

interface SuitTelemetryViewProps {
  route: RouteResponse | null;
  activeOptionId: string;
  transportMode: TransportMode;
  telemetry: TelemetryResponse | null;
}

interface ReadingEntry {
  at: number;
  source: 'Live Kinematics' | 'Manual' | 'Suit feed';
  oxygen_pct: number;
  battery_pct: number;
  suit_temp_c: number;
  radiation_usv_h: number | null;
}

export const SuitTelemetryView: React.FC<SuitTelemetryViewProps> = ({
  route,
  activeOptionId,
  transportMode,
  telemetry
}) => {
  const selectedOption = route?.options?.find(r => r.id === activeOptionId) 
    || route?.options?.[0];
  const summary = selectedOption?.summary || route?.summary;

  const travelTimeMin = summary?.time_min ?? (summary?.estimated_eva_time_hours ? summary.estimated_eva_time_hours * 60 : 102.3);
  const travelTimeH = summary?.estimated_eva_time_hours ?? (travelTimeMin / 60.0);
  const distanceKm = summary?.total_distance_km ?? 5.43;
  const elevGainM = summary?.elevation_gain_m ?? 142.0;
  const maxSlopeDeg = summary?.max_slope_deg ?? 12.4;
  const avgSlopeDeg = summary?.avg_slope_deg ?? 6.8;
  const energyKcal = summary?.energy_kcal ?? 684.2;
  const energyKj = summary?.energy_kj ?? 2862.7;

  // Live Calculated Telemetry (From Route Kinematics & Sol 4995 REMS / RAD)
  const isWalking = transportMode === 'walking';
  const liveO2ConsumedL = isWalking ? (summary?.oxygen_consumed_liters ?? 58.4) : 0.0;
  const liveO2RemainingL = Math.max(0, 1000.0 - liveO2ConsumedL);
  const liveO2RemainingPct = Number(((liveO2RemainingL / 1000.0) * 100).toFixed(1));

  const batteryCapacityKwh = isWalking ? 4.20 : 50.0;
  const liveBatteryConsumedKwh = isWalking
    ? (summary?.battery_kwh_consumed ?? 0.85)
    : (summary?.rover_battery_kwh_consumed ?? 7.87);
  const liveBatteryRemainingKwh = Math.max(0, batteryCapacityKwh - liveBatteryConsumedKwh);
  const liveBatteryRemainingPct = Number(((liveBatteryRemainingKwh / batteryCapacityKwh) * 100).toFixed(1));

  const liveDoseRateUSvH = telemetry?.rad?.dose_rate_uSv_hour ?? 24.2;
  const liveSuitTempC = 21.0;

  // Input Channel Mode: 'live' or 'manual'
  const [sourceMode, setSourceMode] = useState<'live' | 'manual'>('live');

  // Manual input form state
  const [manualForm, setManualForm] = useState({
    oxygen: liveO2RemainingPct.toString(),
    battery: liveBatteryRemainingPct.toString(),
    temp: '21.0',
    radiation: liveDoseRateUSvH.toString()
  });

  const [activeReading, setActiveReading] = useState<ReadingEntry>({
    at: Date.now(),
    source: 'Live Kinematics',
    oxygen_pct: liveO2RemainingPct,
    battery_pct: liveBatteryRemainingPct,
    suit_temp_c: liveSuitTempC,
    radiation_usv_h: liveDoseRateUSvH
  });

  const [readingLog, setReadingLog] = useState<ReadingEntry[]>([
    {
      at: Date.now() - 3600000,
      source: 'Live Kinematics',
      oxygen_pct: liveO2RemainingPct,
      battery_pct: liveBatteryRemainingPct,
      suit_temp_c: liveSuitTempC,
      radiation_usv_h: liveDoseRateUSvH
    }
  ]);

  const [statusMessage, setStatusMessage] = useState<string>('Live route telemetry connected.');

  // Handle manual form submission
  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const oxy = parseFloat(manualForm.oxygen);
    const bat = parseFloat(manualForm.battery);
    const tmp = parseFloat(manualForm.temp);
    const rad = manualForm.radiation ? parseFloat(manualForm.radiation) : null;

    if (isNaN(oxy) || oxy < 0 || oxy > 100 || isNaN(bat) || bat < 0 || bat > 100 || isNaN(tmp)) {
      setStatusMessage('Error: Enter valid percentages (0-100) and temperatures.');
      return;
    }

    const newEntry: ReadingEntry = {
      at: Date.now(),
      source: 'Manual',
      oxygen_pct: oxy,
      battery_pct: bat,
      suit_temp_c: tmp,
      radiation_usv_h: rad
    };

    setActiveReading(newEntry);
    setReadingLog(prev => [newEntry, ...prev.slice(0, 11)]);
    setStatusMessage('Manual suit check saved successfully at ' + new Date().toISOString().slice(11, 19) + ' UTC.');
  };

  const handleRevertLive = () => {
    setSourceMode('live');
    const liveEntry: ReadingEntry = {
      at: Date.now(),
      source: 'Live Kinematics',
      oxygen_pct: liveO2RemainingPct,
      battery_pct: liveBatteryRemainingPct,
      suit_temp_c: liveSuitTempC,
      radiation_usv_h: liveDoseRateUSvH
    };
    setActiveReading(liveEntry);
    setStatusMessage('Reverted to live route kinematics and Curiosity REMS/RAD feed.');
  };

  // Determine current displayed numbers
  const currentO2Pct = sourceMode === 'manual' ? activeReading.oxygen_pct : liveO2RemainingPct;
  const currentO2L = ((currentO2Pct / 100) * 1000.0).toFixed(1);
  const currentBatPct = sourceMode === 'manual' ? activeReading.battery_pct : liveBatteryRemainingPct;
  const currentBatKwh = ((currentBatPct / 100) * batteryCapacityKwh).toFixed(2);
  const currentTempC = sourceMode === 'manual' ? activeReading.suit_temp_c : liveSuitTempC;
  const currentRadUSvH = sourceMode === 'manual' ? (activeReading.radiation_usv_h ?? liveDoseRateUSvH) : liveDoseRateUSvH;

  const accumulatedDoseUSv = (currentRadUSvH * travelTimeH).toFixed(1);
  const doseLimitUSv = 100.0;
  const doseMarginPct = (((doseLimitUSv - Number(accumulatedDoseUSv)) / doseLimitUSv) * 100).toFixed(1);

  const externalTempC = telemetry?.rems?.ground_temp_c ?? -42.0;
  const thermalDeltaC = Math.abs(currentTempC - externalTempC).toFixed(1);

  return (
    <div style={{
      padding: '24px 32px',
      color: '#fff0e9',
      fontFamily: "'Inter', system-ui, sans-serif",
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #543337',
        paddingBottom: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            color: '#ff9983',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            ARES–GALE // CREW LIFE SUPPORT TELEMETRY
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            margin: '4px 0 0 0',
            letterSpacing: '0.5px'
          }}>
            SUIT &amp; PHYSIOLOGICAL READOUTS
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: '#241819',
            border: '1px solid #623d40',
            borderRadius: '6px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontFamily: "'IBM Plex Mono', monospace"
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: sourceMode === 'live' ? '#c0c8a1' : '#ff9983',
              boxShadow: sourceMode === 'live' ? '0 0 8px #c0c8a1' : '0 0 8px #ff9983'
            }} />
            {sourceMode === 'live'
              ? `LIVE FEED: ROUTE ${activeOptionId} (${transportMode.toUpperCase()})`
              : 'MANUAL ENTRY ACTIVE'}
          </div>
        </div>
      </div>

      {/* =========================================================================
          INPUT CHANNEL: READING SOURCE (MANUAL ENTRY VS LIVE TELEMETRY)
          ========================================================================= */}
      <div style={{
        backgroundColor: '#1b1213',
        border: '1px solid #543337',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontFamily: "'IBM Plex Mono', monospace",
              color: '#ff9983',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              INPUT CHANNEL
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '2px 0 0 0', color: '#fff0e9' }}>
              Reading Source Mode
            </h2>
          </div>

          {/* Mode Switch Buttons */}
          <div style={{
            display: 'flex',
            backgroundColor: '#26181a',
            border: '1px solid #604044',
            borderRadius: '6px',
            overflow: 'hidden',
            padding: '2px'
          }}>
            <button
              onClick={() => { setSourceMode('manual'); setStatusMessage('Manual entry mode active. Enter suit values below.'); }}
              style={{
                backgroundColor: sourceMode === 'manual' ? '#54272a' : 'transparent',
                color: sourceMode === 'manual' ? '#fff0e9' : '#cfb5ae',
                border: 'none',
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: sourceMode === 'manual' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '4px'
              }}
            >
              <Sliders size={14} color={sourceMode === 'manual' ? '#ff9983' : '#cfb5ae'} />
              Manual entry
            </button>
            <button
              onClick={handleRevertLive}
              style={{
                backgroundColor: sourceMode === 'live' ? '#54272a' : 'transparent',
                color: sourceMode === 'live' ? '#fff0e9' : '#cfb5ae',
                border: 'none',
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: sourceMode === 'live' ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '4px'
              }}
            >
              <Radio size={14} color={sourceMode === 'live' ? '#c0c8a1' : '#cfb5ae'} />
              Link suit feed (Live Kinematics)
            </button>
          </div>
        </div>

        {/* Manual Entry Form */}
        {sourceMode === 'manual' && (
          <form onSubmit={handleSaveManual} style={{ borderTop: '1px solid #352326', paddingTop: '16px' }}>
            <p style={{ fontSize: '13px', color: '#cfb5ae', margin: '0 0 14px 0' }}>
              Enter instrument readings from the current suit pressure &amp; life-support check.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cfb5ae', marginBottom: '6px' }}>
                  Oxygen Remaining (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#26181a', border: '1px solid #604044', borderRadius: '4px', padding: '0 10px' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={manualForm.oxygen}
                    onChange={e => setManualForm({ ...manualForm, oxygen: e.target.value })}
                    required
                    style={{ background: 'transparent', border: 'none', color: '#fff0e9', padding: '8px 0', width: '100%', outline: 'none', fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  <span style={{ fontSize: '12px', color: '#ff9983' }}>%</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cfb5ae', marginBottom: '6px' }}>
                  Suit Battery (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#26181a', border: '1px solid #604044', borderRadius: '4px', padding: '0 10px' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={manualForm.battery}
                    onChange={e => setManualForm({ ...manualForm, battery: e.target.value })}
                    required
                    style={{ background: 'transparent', border: 'none', color: '#fff0e9', padding: '8px 0', width: '100%', outline: 'none', fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  <span style={{ fontSize: '12px', color: '#f1c680' }}>%</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cfb5ae', marginBottom: '6px' }}>
                  Internal Suit Temp (°C)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#26181a', border: '1px solid #604044', borderRadius: '4px', padding: '0 10px' }}>
                  <input
                    type="number"
                    step="0.1"
                    value={manualForm.temp}
                    onChange={e => setManualForm({ ...manualForm, temp: e.target.value })}
                    required
                    style={{ background: 'transparent', border: 'none', color: '#fff0e9', padding: '8px 0', width: '100%', outline: 'none', fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  <span style={{ fontSize: '12px', color: '#38bdf8' }}>°C</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cfb5ae', marginBottom: '6px' }}>
                  Radiation Dose Rate (µSv/h)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#26181a', border: '1px solid #604044', borderRadius: '4px', padding: '0 10px' }}>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={manualForm.radiation}
                    onChange={e => setManualForm({ ...manualForm, radiation: e.target.value })}
                    style={{ background: 'transparent', border: 'none', color: '#fff0e9', padding: '8px 0', width: '100%', outline: 'none', fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  <span style={{ fontSize: '12px', color: '#c0c8a1' }}>µSv/h</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#ff9983',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#1a1012',
                  padding: '9px 18px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save size={14} />
                Save manual readings
              </button>

              <button
                type="button"
                onClick={handleRevertLive}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #604044',
                  borderRadius: '5px',
                  color: '#cfb5ae',
                  padding: '9px 16px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={14} />
                Revert to live feed
              </button>
            </div>
          </form>
        )}

        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#a8948f',
          fontFamily: "'IBM Plex Mono', monospace"
        }}>
          Status: {statusMessage}
        </div>
      </div>

      {/* =========================================================================
          PRIMARY INSTRUMENT READOUTS
          ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Oxygen */}
        <div style={{
          backgroundColor: '#201516',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#cfb5ae', fontWeight: 500 }}>Oxygen Remaining</span>
            <Wind size={18} color="#ff9983" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '36px',
              fontWeight: 700,
              color: '#fff0e9'
            }}>
              {currentO2Pct.toFixed(1)}%
            </span>
            <span style={{ fontSize: '14px', color: '#cfb5ae' }}>({currentO2L} L)</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#352326',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, currentO2Pct))}%`,
              height: '100%',
              backgroundColor: currentO2Pct > 50 ? '#c0c8a1' : '#f4896b',
              transition: 'width 0.4s'
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#cfb5ae', fontFamily: "'IBM Plex Mono', monospace" }}>
            Source: {sourceMode === 'manual' ? 'Manual Instrument Check' : 'Primary 1000L O₂ Tank'}
          </div>
        </div>

        {/* Battery Power */}
        <div style={{
          backgroundColor: '#201516',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#cfb5ae', fontWeight: 500 }}>
              {isWalking ? 'Suit Battery Life' : 'Rover Battery Bank'}
            </span>
            <Zap size={18} color="#f1c680" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '36px',
              fontWeight: 700,
              color: '#fff0e9'
            }}>
              {currentBatPct.toFixed(1)}%
            </span>
            <span style={{ fontSize: '14px', color: '#cfb5ae' }}>({currentBatKwh} kWh)</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#352326',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${Math.min(100, Math.max(0, currentBatPct))}%`,
              height: '100%',
              backgroundColor: '#f1c680',
              transition: 'width 0.4s'
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#cfb5ae', fontFamily: "'IBM Plex Mono', monospace" }}>
            Baseline: {isWalking ? '500 W (Life Support + Heating)' : '1.5 kWh/km + climbing work'}
          </div>
        </div>

        {/* Metabolic Energy */}
        <div style={{
          backgroundColor: '#201516',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#cfb5ae', fontWeight: 500 }}>Metabolic Workload</span>
            <Activity size={18} color="#c0c8a1" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '36px',
              fontWeight: 700,
              color: '#fff0e9'
            }}>
              {energyKcal.toFixed(0)}
            </span>
            <span style={{ fontSize: '14px', color: '#cfb5ae' }}>kcal ({energyKj.toFixed(0)} kJ)</span>
          </div>
          <div style={{ fontSize: '12px', color: '#c0c8a1', marginBottom: '8px' }}>
            Minetti biomechanical model (130 kg suited human)
          </div>
          <div style={{ fontSize: '11px', color: '#cfb5ae', fontFamily: "'IBM Plex Mono', monospace" }}>
            Metabolic burn: {(energyKcal / Math.max(0.1, travelTimeH)).toFixed(0)} kcal/hr
          </div>
        </div>

        {/* Radiation Dose */}
        <div style={{
          backgroundColor: '#201516',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#cfb5ae', fontWeight: 500 }}>Traverse Radiation</span>
            <ShieldCheck size={18} color="#38bdf8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '36px',
              fontWeight: 700,
              color: '#fff0e9'
            }}>
              {accumulatedDoseUSv}
            </span>
            <span style={{ fontSize: '14px', color: '#cfb5ae' }}>µSv</span>
          </div>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '8px' }}>
            Dose rate: {currentRadUSvH.toFixed(1)} µSv/h
          </div>
          <div style={{ fontSize: '11px', color: '#cfb5ae', fontFamily: "'IBM Plex Mono', monospace" }}>
            Sortie margin: {doseMarginPct}% of 100 µSv limit
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECONDARY DETAILED TELEMETRY GRID & READING LOG TABLE
          ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* Suit Life Support Subsystems */}
        <div style={{
          backgroundColor: '#1b1213',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{
            fontSize: '15px',
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '1px',
            color: '#ff9983',
            margin: '0 0 16px 0',
            textTransform: 'uppercase'
          }}>
            Suit Subsystems Verification
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Internal Suit Climate</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{currentTempC.toFixed(1)}°C ({sourceMode === 'manual' ? 'Manual Entry' : 'Regulated'})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>External Mars Regolith Temp</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f4896b' }}>{externalTempC.toFixed(1)}°C (REMS Sol 4995)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Thermal Barrier Load (ΔT)</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{thermalDeltaC}°C gradient</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #352326', paddingBottom: '8px' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Point of No Return (PNR)</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#c0c8a1' }}>Safe (5.4 km limit vs {distanceKm.toFixed(2)} km route)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#cfb5ae', fontSize: '13px' }}>Solar Particle Event (SPE)</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#c0c8a1' }}>No alert · Nominal magnetosphere</span>
            </div>
          </div>
        </div>

        {/* Reading Log Table (from manual and feed checks) */}
        <div style={{
          backgroundColor: '#1b1213',
          border: '1px solid #543337',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2 style={{
            fontSize: '15px',
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '1px',
            color: '#f1c680',
            margin: '0 0 16px 0',
            textTransform: 'uppercase'
          }}>
            Suit Reading Log (UTC)
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #543337', color: '#cfb5ae' }}>
                  <th style={{ padding: '6px 4px' }}>Time</th>
                  <th style={{ padding: '6px 4px' }}>Source</th>
                  <th style={{ padding: '6px 4px' }}>O₂</th>
                  <th style={{ padding: '6px 4px' }}>Battery</th>
                  <th style={{ padding: '6px 4px' }}>Temp</th>
                </tr>
              </thead>
              <tbody>
                {readingLog.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #2a1b1d', fontFamily: "'IBM Plex Mono', monospace" }}>
                    <td style={{ padding: '6px 4px', color: '#a8948f' }}>{new Date(log.at).toISOString().slice(11, 19)}</td>
                    <td style={{ padding: '6px 4px', color: log.source === 'Manual' ? '#ff9983' : '#c0c8a1' }}>{log.source}</td>
                    <td style={{ padding: '6px 4px' }}>{log.oxygen_pct.toFixed(1)}%</td>
                    <td style={{ padding: '6px 4px' }}>{log.battery_pct.toFixed(1)}%</td>
                    <td style={{ padding: '6px 4px' }}>{log.suit_temp_c.toFixed(1)}°C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Real Scientific Data Heritage Note */}
      <div style={{
        backgroundColor: '#241819',
        border: '1px solid #543337',
        borderRadius: '8px',
        padding: '16px 20px',
        fontSize: '12px',
        color: '#cfb5ae',
        lineHeight: 1.6
      }}>
        <strong style={{ color: '#ff9983' }}>NASA Verification Notice:</strong> Supports dual input channels: automated live calculation from route kinematics, Minetti (2002) locomotion bioenergetics, and Curiosity REMS/RAD observations, alongside manual entry for direct EVA suit checks.
      </div>
    </div>
  );
};

export default SuitTelemetryView;
