/**
 * Header — Top navigation bar (Phase 2 Enhanced)
 * =================================================
 * Added simulation state indicator in the header.
 */

import { Cpu, Save, Sparkles, Menu, Play, Pause } from 'lucide-react';
import type { SimulationState } from '../../simulation/types';
import './Header.css';

interface HeaderProps {
  designTitle?: string;
  onSave?: () => void;
  onAnalyze?: () => void;
  onToggleSidebar?: () => void;
  /** Simulation state for the header indicator */
  simState?: SimulationState;
  /** Toggle simulation on/off from header */
  onSimToggle?: () => void;
}

export default function Header({
  designTitle = 'Untitled Design',
  onSave,
  onAnalyze,
  onToggleSidebar,
  simState = 'idle',
  onSimToggle,
}: HeaderProps) {
  const isSimulating = simState !== 'idle';

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="btn btn-ghost btn-icon" onClick={onToggleSidebar} title="Toggle sidebar">
          <Menu size={18} />
        </button>
        
        <div className="header-logo">
          <div className="logo-icon">
            <Cpu size={20} />
          </div>
          <span className="logo-text">ArchLab</span>
        </div>

        <div className="header-divider" />

        <div className="header-title">
          <input
            type="text"
            className="title-input"
            defaultValue={designTitle}
            placeholder="Design title..."
          />
        </div>
      </div>

      <div className="header-right">
        {/* Simulation quick-toggle */}
        <button
          className={`btn btn-sm ${isSimulating ? 'btn-sim-active' : 'btn-secondary'}`}
          onClick={onSimToggle}
          title={isSimulating ? 'Stop Simulation' : 'Start Simulation'}
        >
          {isSimulating ? <Pause size={14} /> : <Play size={14} />}
          {isSimulating ? 'Simulating' : 'Simulate'}
          {isSimulating && <span className="header-sim-dot" />}
        </button>

        <button className="btn btn-secondary btn-sm" onClick={onSave}>
          <Save size={14} />
          Save
        </button>

        <button className="btn btn-primary btn-sm" onClick={onAnalyze}>
          <Sparkles size={14} />
          Analyze with AI
        </button>
      </div>
    </header>
  );
}
