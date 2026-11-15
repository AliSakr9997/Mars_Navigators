import React, { useState, useEffect } from 'react';
import { Compass, Radio, Clock, Database, HeartPulse, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenAttribution: () => void;
  onOpenSuitTelemetry: () => void;
  evaTimeHours?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAttribution,
  onOpenSuitTelemetry,
  evaTimeHours = 2.1
}) => {
  const [seconds, setSeconds] = useState(9840); // 02:44:00 baseline

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <header style={{
      backgroundColor: '#0c0d10',
      borderBottom: '1px solid #1e222a',
      padding: '10px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      position: 'relative',
      zIndex: 1000
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          backgroundColor: '#e06c3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(224, 108, 58, 0.45)'
        }}>
          <Compass size={20} color="#0c0d10" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '1.2px', color: '#f3f4f6' }}>
              ARES–GALE
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              backgroundColor: '#1b1f27',
              color: '#e06c3a',
              padding: '2px 7px',
              borderRadius: '4px',
              border: '1px solid rgba(224, 108, 58, 0.3)'
            }}>
              MARS FIELD CONSOLE
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.4px' }}>
            LOWER MOUNT SHARP // BOXWORK FORMATIONS — NASA SPACE APPS 2026
          </div>
        </div>
      </div>

      {/* Center & Right Telemetry Quick Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {/* Sol */}
        <div style={{
          backgroundColor: '#13161c',
          border: '1px solid #232732',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ color: '#38bdf8', fontSize: '10px', fontWeight: 700 }}>SOL</span>
          <span style={{ color: '#f3f4f6', fontSize: '13px', fontWeight: 800, fontFamily: 'monospace' }}>4000</span>
        </div>

        {/* EVA Elapsed Timer */}
        <div style={{
          backgroundColor: '#13161c',
          border: '1px solid #232732',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Clock size={13} color="#e06c3a" />
          <span style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 600 }}>EVA CLOCK:</span>
          <span style={{ color: '#e06c3a', fontSize: '13px', fontWeight: 800, fontFamily: 'monospace' }}>
            {formatTime(seconds)}
          </span>
        </div>

        {/* Suit Telemetry Modal Button */}
        <button
          onClick={onOpenSuitTelemetry}
          style={{
            backgroundColor: '#13161c',
            border: '1px solid #232732',
            borderRadius: '6px',
            color: '#f3f4f6',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e06c3a'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#232732'}
        >
          <HeartPulse size={14} color="#f97316" />
          SUIT TELEMETRY
        </button>

        {/* NASA Data Sources Button */}
        <button
          onClick={onOpenAttribution}
          style={{
            backgroundColor: '#13161c',
            border: '1px solid #232732',
            borderRadius: '6px',
            color: '#f3f4f6',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#232732'}
        >
          <Database size={13} color="#38bdf8" />
          NASA DATA
        </button>

        {/* Comms */}
        <div style={{
          backgroundColor: '#13161c',
          border: '1px solid #232732',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Radio size={13} color="#10b981" />
          <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 800 }}>ORBITER LINK ACTIVE</span>
        </div>
      </div>
    </header>
  );
};
