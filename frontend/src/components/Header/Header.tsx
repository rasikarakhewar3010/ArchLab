/**
 * Header — Top navigation bar (Phase 3 Enhanced)
 * =================================================
 * Added navigation link to Challenges dashboard.
 */

import { useNavigate } from 'react-router-dom';
import { Save, Sparkles, Menu, Play, Pause, Trophy } from 'lucide-react';
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
  const navigate = useNavigate();
  const isSimulating = simState !== 'idle';

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="btn btn-ghost btn-icon" onClick={onToggleSidebar} title="Toggle sidebar">
          <Menu size={18} />
        </button>
        
        <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="ArchLab Logo" style={{ height: '28px', width: 'auto' }} />
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
        {/* Challenges Link */}
        <button
          className="btn btn-ghost btn-sm header-challenges-btn"
          onClick={() => navigate('/challenges')}
          title="System Design Challenges"
        >
          <Trophy size={14} />
          Challenges
        </button>

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
