import React, { useState, useEffect } from 'react';
import { Compass, Radio, ShieldCheck, Clock, BookOpen, BatteryMedium, Wind } from 'lucide-react';

interface HeaderProps {
  onOpenAttribution: () => void;
  evaTimeHours?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAttribution, evaTimeHours = 2.1 }) => {
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
      backgroundColor: '#070a13',
      borderBottom: '1px solid #1e293b',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 1000
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)'
        }}>
          <Compass size={22} color="#090d16" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '1.5px', color: '#f8fafc' }}>
              ARES–GALE
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              backgroundColor: '#1e293b',
              color: '#f59e0b',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              FIELD CONSOLE v2.0
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.5px' }}>
            MOUNT SHARP // BOXWORK STUDY REGION — NASA SPACE APPS 2026
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Sol */}
        <div style={{
          backgroundColor: '#0d1527',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 600 }}>SOL</span>
          <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>4000</span>
        </div>

        {/* EVA Elapsed Timer */}
        <div style={{
          backgroundColor: '#0d1527',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Clock size={14} color="#f59e0b" />
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>EVA CLOCK:</span>
          <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
            {formatTime(seconds)}
          </span>
        </div>

        {/* Suit O2 */}
        <div style={{
          backgroundColor: '#0d1527',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Wind size={14} color="#06b6d4" />
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>SUIT O₂:</span>
          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>94%</span>
        </div>

        {/* Suit Battery */}
        <div style={{
          backgroundColor: '#0d1527',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <BatteryMedium size={14} color="#10b981" />
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>PWR:</span>
          <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>88%</span>
        </div>

        {/* Comms */}
        <div style={{
          backgroundColor: '#0d1527',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Radio size={14} color="#10b981" />
          <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>MRO RELAY ACTIVE</span>
        </div>

        {/* NASA Attributions Modal Button */}
        <button
          onClick={onOpenAttribution}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#f8fafc',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
        >
          <BookOpen size={14} color="#f59e0b" />
          NASA DATA SOURCES
        </button>
      </div>
    </header>
  );
};
