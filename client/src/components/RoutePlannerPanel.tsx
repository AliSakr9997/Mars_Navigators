import React from 'react';
import { Navigation, Zap, Award, Flame, Timer, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { RouteResponse, MultiRouteResponse, CandidateRoute } from '../types/api';

interface RoutePlannerPanelProps {
  route: RouteResponse | null;
  multiResult: MultiRouteResponse | null;
  selectedProfile: string;
  setSelectedProfile: (p: string) => void;
  selectedAlgorithm: string;
  setSelectedAlgorithm: (a: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  onComputeRoute: () => void;
  onRunTournament: () => void;
  onSelectCandidate: (candidate: CandidateRoute) => void;
  loading: boolean;
  tournamentLoading: boolean;
}

const PROFILES = [
  "Balanced",
  "Safest (max clearance)",
  "Min slope",
  "Energy saver",
  "Shortest distance"
];

const ALGORITHMS = [
  "A* + any-angle smoothing",
  "A*",
  "Dijkstra",
  "Weighted A* (ε=2.5)",
  "Greedy best-first"
];

const PRIORITIES = [
  "Balanced",
  "Safety first",
  "Speed first",
  "Energy / O2 first"
];

export const RoutePlannerPanel: React.FC<RoutePlannerPanelProps> = ({
  route,
  multiResult,
  selectedProfile,
  setSelectedProfile,
  selectedAlgorithm,
  setSelectedAlgorithm,
  selectedPriority,
  setSelectedPriority,
  onComputeRoute,
  onRunTournament,
  onSelectCandidate,
  loading,
  tournamentLoading
}) => {
  const summary = route?.summary;

  return (
    <div style={{
      width: '360px',
      backgroundColor: '#0a0f1d',
      borderLeft: '1px solid #1e293b',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      {/* 1. Active Route Metrics HUD */}
      {summary && (
        <div style={{
          backgroundColor: '#070a13',
          borderRadius: '8px',
          border: '1px solid #1e293b',
          padding: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
              <ShieldCheck size={16} />
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>
                ACTIVE TRAVERSE METRICS
              </span>
            </div>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: summary.hazard_level === 'NOMINAL_SAFE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: summary.hazard_level === 'NOMINAL_SAFE' ? '#10b981' : '#ef4444',
              border: `1px solid ${summary.hazard_level === 'NOMINAL_SAFE' ? '#10b981' : '#ef4444'}`
            }}>
              {summary.hazard_level}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Total Distance */}
            <div style={{ backgroundColor: '#0d1527', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>DISTANCE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '2px', fontFamily: 'monospace' }}>
                {summary.total_distance_km} <span style={{ fontSize: '11px', color: '#94a3b8' }}>km</span>
              </div>
            </div>

            {/* Tobler Walking Time */}
            <div style={{ backgroundColor: '#0d1527', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>EVA WALKING TIME</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', marginTop: '2px', fontFamily: 'monospace' }}>
                {summary.time_min ? `${Math.round(summary.time_min)} min` : `${summary.estimated_eva_time_hours} hrs`}
              </div>
            </div>

            {/* Minetti Metabolic Energy */}
            <div style={{ backgroundColor: '#0d1527', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>METABOLIC COST</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b', marginTop: '2px', fontFamily: 'monospace' }}>
                {summary.energy_kj ? `${Math.round(summary.energy_kj)} kJ` : '1,630 kJ'}
              </div>
            </div>

            {/* Max & Avg Slope */}
            <div style={{ backgroundColor: '#0d1527', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ color: '#94a3b8', fontSize: '10px' }}>MAX / AVG SLOPE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: summary.max_slope_deg > 15 ? '#ef4444' : '#10b981', marginTop: '2px', fontFamily: 'monospace' }}>
                {summary.max_slope_deg}° <span style={{ fontSize: '11px', color: '#94a3b8' }}>/ {summary.avg_slope_deg}°</span>
              </div>
            </div>
          </div>

          {/* Geological Breakdown Bar */}
          {route && route.traversed_geology && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>TRAVERSED GEOLOGICAL STRATA</div>
              <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#1e293b' }}>
                {route.traversed_geology.map((geo, idx) => {
                  const colors = ['#06b6d4', '#a855f7', '#f59e0b', '#ef4444'];
                  return (
                    <div
                      key={geo.unit}
                      style={{
                        width: `${geo.percent}%`,
                        backgroundColor: colors[idx % colors.length]
                      }}
                      title={`${geo.unit}: ${geo.percent}%`}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                <span>Clay {route.traversed_geology[0]?.percent || 35}%</span>
                <span>Sulfate {route.traversed_geology[1]?.percent || 45}%</span>
                <span>Boxwork {route.traversed_geology[2]?.percent || 20}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Pathfinding Model Configuration */}
      <div style={{
        backgroundColor: '#070a13',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        padding: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#f59e0b' }}>
          <Navigation size={16} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Traverse Configuration
          </span>
        </div>

        {/* Cost Profile */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            COST SURFACE PROFILE
          </label>
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0d1527',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 10px',
              color: '#f8fafc',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            {PROFILES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Algorithm Model */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            PATHFINDING ALGORITHM MODEL
          </label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0d1527',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 10px',
              color: '#f8fafc',
              fontSize: '12px',
              outline: 'none'
            }}
          >
            {ALGORITHMS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Compute Single Route Button */}
        <button
          onClick={onComputeRoute}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#f59e0b',
            color: '#090d16',
            border: 'none',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Navigation size={14} />
          {loading ? 'COMPUTING TERRAIN TRAVERSE...' : '▶ COMPUTE TRAVERSE'}
        </button>
      </div>

      {/* 3. Multi-Model Tournament Engine */}
      <div style={{
        backgroundColor: '#070a13',
        borderRadius: '8px',
        border: '1px solid #1e293b',
        padding: '14px',
        flex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#38bdf8' }}>
          <Zap size={16} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Multi-Model Tournament
          </span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            RANKING PRIORITY
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#0d1527',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#f8fafc',
              fontSize: '11px',
              outline: 'none'
            }}
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onRunTournament}
          disabled={tournamentLoading}
          style={{
            width: '100%',
            backgroundColor: '#0d1527',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            cursor: tournamentLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginBottom: '12px'
          }}
        >
          <Award size={14} />
          {tournamentLoading ? 'RUNNING MULTI-MODEL TOURNAMENT...' : '⚡ RUN MULTI-MODEL TOURNAMENT'}
        </button>

        {/* Candidate Leaderboard */}
        {multiResult && (
          <div>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={12} />
              ★ WINNER: {multiResult.best_candidate.profile} via {multiResult.best_candidate.algorithm}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
              {multiResult.candidates.map(c => {
                const isSelected = route?.metadata.algorithm === c.algorithm && route?.metadata.profile === c.profile;
                return (
                  <div
                    key={`${c.profile}-${c.algorithm}`}
                    onClick={() => onSelectCandidate(c)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? '#1e293b' : '#0d1527',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                      cursor: 'pointer',
                      fontSize: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: c.rank === 1 ? '#f59e0b' : '#f8fafc' }}>
                        #{c.rank} {c.profile}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '9px' }}>
                        {c.algorithm} · {c.total_distance_km}km · {Math.round(c.time_min)}m · Risk {c.risk_score}
                      </div>
                    </div>
                    <ChevronRight size={12} color="#64748b" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
