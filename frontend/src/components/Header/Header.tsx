/**
 * Header — Top navigation bar
 */

import { Cpu, Save, Sparkles, Menu } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  designTitle?: string;
  onSave?: () => void;
  onAnalyze?: () => void;
  onToggleSidebar?: () => void;
}

export default function Header({
  designTitle = 'Untitled Design',
  onSave,
  onAnalyze,
  onToggleSidebar,
}: HeaderProps) {
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
