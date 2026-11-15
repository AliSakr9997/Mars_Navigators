import React from 'react';
import { X } from 'lucide-react';
import { RouteResponse, TelemetryResponse, TransportMode } from '../types/api';
import { SuitTelemetryView } from './SuitTelemetryView';

interface SuitTelemetryModalProps {
  isOpen?: boolean;
  onClose: () => void;
  telemetry: TelemetryResponse | null;
  route?: RouteResponse | null;
  activeOptionId?: string;
  transportMode?: TransportMode;
}

export const SuitTelemetryModal: React.FC<SuitTelemetryModalProps> = ({
  isOpen = true,
  onClose,
  telemetry,
  route = null,
  activeOptionId = 'P1',
  transportMode = 'walking'
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 8, 7, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#160f10',
        border: '1px solid #543337',
        borderRadius: '12px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close suit telemetry modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            backgroundColor: '#241819',
            border: '1px solid #623d40',
            borderRadius: '6px',
            color: '#cfb5ae',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff0e9';
            e.currentTarget.style.borderColor = '#ff9983';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#cfb5ae';
            e.currentTarget.style.borderColor = '#623d40';
          }}
        >
          <X size={20} />
        </button>

        <SuitTelemetryView
          route={route}
          activeOptionId={activeOptionId}
          transportMode={transportMode}
          telemetry={telemetry}
        />
      </div>
    </div>
  );
};
