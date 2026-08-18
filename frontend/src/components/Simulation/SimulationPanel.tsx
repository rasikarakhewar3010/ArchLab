/**
 * SimulationPanel — Floating Control Panel for the Simulation
 * ==============================================================
 * A sleek glassmorphic panel at the bottom of the canvas with:
 *   - Play / Pause / Stop controls
 *   - RPS slider (logarithmic scale: 100 → 1,000,000)
 *   - Speed control (1x, 2x, 5x)
 *   - Live system metrics dashboard
 */

import { Play, Pause, Square, Gauge, Zap, AlertTriangle, Clock, Activity } from 'lucide-react';
import type { SimulationState, SystemMetrics } from '../../simulation/types';
import './SimulationPanel.css';

interface SimulationPanelProps {
  simState: SimulationState;
  rps: number;
  speedMultiplier: number;
  systemMetrics: SystemMetrics;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRpsChange: (rps: number) => void;
  onSpeedChange: (speed: number) => void;
}

/** Convert a linear slider value (0-100) to logarithmic RPS (100 → 1,000,000) */
function sliderToRps(value: number): number {
  const minLog = Math.log10(100);    // 2
  const maxLog = Math.log10(1000000); // 6
  const logValue = minLog + (value / 100) * (maxLog - minLog);
  return Math.round(Math.pow(10, logValue));
}

/** Convert RPS back to slider value (0-100) */
function rpsToSlider(rps: number): number {
  const minLog = Math.log10(100);
  const maxLog = Math.log10(1000000);
  const logRps = Math.log10(Math.max(rps, 100));
  return ((logRps - minLog) / (maxLog - minLog)) * 100;
}

/** Format large numbers for display */
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

export default function SimulationPanel({
  simState,
  rps,
  speedMultiplier,
  systemMetrics,
  onStart,
  onPause,
  onResume,
  onStop,
  onRpsChange,
  onSpeedChange,
}: SimulationPanelProps) {
  const isRunning = simState === 'running';
  const isPaused = simState === 'paused';
  const isIdle = simState === 'idle';

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sliderValue = Number(e.target.value);
    onRpsChange(sliderToRps(sliderValue));
  };

  return (
    <div className={`simulation-panel ${isIdle ? '' : 'simulation-panel-active'}`} data-tour="simulation-panel">
      {/* Left: Controls */}
      <div className="sim-controls">
        {isIdle && (
          <button className="sim-btn sim-btn-play" onClick={onStart} title="Start Simulation">
            <Play size={16} />
          </button>
        )}
        {isRunning && (
          <button className="sim-btn sim-btn-pause" onClick={onPause} title="Pause Simulation">
            <Pause size={16} />
          </button>
        )}
        {isPaused && (
          <button className="sim-btn sim-btn-play" onClick={onResume} title="Resume Simulation">
            <Play size={16} />
          </button>
        )}
        {!isIdle && (
          <button className="sim-btn sim-btn-stop" onClick={onStop} title="Stop Simulation">
            <Square size={14} />
          </button>
        )}

        <div className="sim-status">
          <span className={`sim-status-dot sim-status-${simState}`} />
          <span className="sim-status-text">
            {isIdle ? 'IDLE' : isRunning ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Center: RPS Slider */}
      <div className="sim-rps-section">
        <div className="sim-rps-label">
          <Gauge size={12} />
          <span>Traffic</span>
        </div>
        <input
          type="range"
          className="sim-rps-slider"
          min={0}
          max={100}
          step={1}
          value={rpsToSlider(rps)}
          onChange={handleSliderChange}
        />
        <span className="sim-rps-value">{formatNumber(rps)} req/s</span>
      </div>

      {/* Speed Controls */}
      <div className="sim-speed-section">
        {[1, 2, 5].map((speed) => (
          <button
            key={speed}
            className={`sim-speed-btn ${speedMultiplier === speed ? 'active' : ''}`}
            onClick={() => onSpeedChange(speed)}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Right: Live Metrics */}
      {!isIdle && (
        <div className="sim-metrics">
          <div className="sim-metric">
            <Activity size={11} />
            <span className="sim-metric-value">{formatNumber(systemMetrics.totalThroughput)}</span>
            <span className="sim-metric-label">req/s</span>
          </div>
          <div className="sim-metric">
            <Clock size={11} />
            <span className="sim-metric-value">{systemMetrics.averageLatency.toFixed(1)}</span>
            <span className="sim-metric-label">ms</span>
          </div>
          <div className="sim-metric">
            <AlertTriangle size={11} />
            <span className={`sim-metric-value ${systemMetrics.overallErrorRate > 5 ? 'text-danger' : ''}`}>
              {systemMetrics.overallErrorRate.toFixed(1)}%
            </span>
            <span className="sim-metric-label">err</span>
          </div>
          <div className="sim-metric">
            <Zap size={11} />
            <span className="sim-metric-value sim-node-counts">
              <span className="count-healthy">{systemMetrics.healthyNodes}</span>
              {systemMetrics.warningNodes > 0 && <span className="count-warning">{systemMetrics.warningNodes}</span>}
              {systemMetrics.criticalNodes > 0 && <span className="count-critical">{systemMetrics.criticalNodes}</span>}
              {systemMetrics.downNodes > 0 && <span className="count-down">{systemMetrics.downNodes}</span>}
            </span>
            <span className="sim-metric-label">nodes</span>
          </div>
        </div>
      )}
    </div>
  );
}
