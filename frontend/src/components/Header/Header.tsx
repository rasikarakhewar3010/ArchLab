/**
 * Header — Top Navigation Bar
 * ==============================
 * Shows branding, navigation links, simulation toggle, save, analyze,
 * and user auth status (login button or user avatar dropdown).
 * Powered by Hugeicons vector iconography.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu01Icon,
  Compass01Icon,
  BookOpen01Icon,
  TrophyIcon,
  PauseIcon,
  PlayIcon,
  FloppyDiskIcon,
  SparklesIcon,
  Layers01Icon,
  LogOutIcon,
  LogInIcon,
  UserIcon,
} from '../common/Icon';
import { HugeiconsIcon } from '@hugeicons/react';
import BrandLogo from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import type { SimulationState } from '../../simulation/types';
import './Header.css';

interface HeaderProps {
  designTitle?: string;
  onSave?: () => void;
  onAnalyze?: () => void;
  onToggleSidebar?: () => void;
  simState?: SimulationState;
  onSimToggle?: () => void;
  onStartTour?: () => void;
}

export default function Header({
  designTitle = 'Untitled Design',
  onSave,
  onAnalyze,
  onToggleSidebar,
  simState = 'idle',
  onSimToggle,
  onStartTour,
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isSimulating = simState !== 'idle';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="btn btn-ghost btn-icon" onClick={onToggleSidebar} title="Toggle sidebar" data-tour="sidebar-toggle">
          <HugeiconsIcon icon={Menu01Icon} size={18} />
        </button>
        
        <BrandLogo size="md" onClick={() => navigate('/')} />

        <div className="header-divider" />

        <div className="header-title" data-tour="design-title">
          <input
            type="text"
            className="title-input"
            defaultValue={designTitle}
            placeholder="Design title..."
          />
        </div>
      </div>

      <div className="header-right">
        {/* Guided Tour */}
        <button
          className="btn btn-ghost btn-sm header-tour-btn"
          onClick={onStartTour}
          title="Take a guided tour"
          data-tour="restart-tour"
        >
          <HugeiconsIcon icon={Compass01Icon} size={14} />
          Guided Tour
        </button>

        {/* Learn Link */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/learn')}
          title="Learning Hub"
          data-tour="learn-btn"
        >
          <HugeiconsIcon icon={BookOpen01Icon} size={14} />
          Learn
        </button>

        {/* Challenges Link */}
        <button
          className="btn btn-ghost btn-sm header-challenges-btn"
          onClick={() => navigate('/challenges')}
          title="System Design Challenges"
          data-tour="challenges-btn"
        >
          <HugeiconsIcon icon={TrophyIcon} size={14} />
          Challenges
        </button>

        {/* Simulation quick-toggle */}
        <button
          className={`btn btn-sm ${isSimulating ? 'btn-sim-active' : 'btn-secondary'}`}
          onClick={onSimToggle}
          title={isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          data-tour="simulate-btn"
        >
          {isSimulating ? (
            <HugeiconsIcon icon={PauseIcon} size={14} />
          ) : (
            <HugeiconsIcon icon={PlayIcon} size={14} />
          )}
          {isSimulating ? 'Simulating' : 'Simulate'}
          {isSimulating && <span className="header-sim-dot" />}
        </button>

        <button className="btn btn-secondary btn-sm" onClick={onSave} data-tour="save-btn">
          <HugeiconsIcon icon={FloppyDiskIcon} size={14} />
          Save
        </button>

        <button className="btn btn-primary btn-sm" onClick={onAnalyze} data-tour="analyze-btn">
          <HugeiconsIcon icon={SparklesIcon} size={14} />
          Analyze with AI
        </button>

        {/* User Auth */}
        {isAuthenticated && user ? (
          <div className="header-user-menu" ref={menuRef} data-tour="auth-btn">
            <button
              className="header-avatar-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={user.username}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="header-avatar-img" />
              ) : (
                <div className="header-avatar-placeholder">
                  <HugeiconsIcon icon={UserIcon} size={16} />
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="header-dropdown">
                <div className="header-dropdown-user">
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                </div>
                <div className="header-dropdown-divider" />
                <button className="header-dropdown-item" onClick={() => { navigate('/my-designs'); setShowUserMenu(false); }}>
                  <HugeiconsIcon icon={Layers01Icon} size={14} /> My Designs
                </button>
                <button className="header-dropdown-item" onClick={() => { navigate('/learn'); setShowUserMenu(false); }}>
                  <HugeiconsIcon icon={BookOpen01Icon} size={14} /> Learning Hub
                </button>
                <div className="header-dropdown-divider" />
                <button className="header-dropdown-item header-dropdown-danger" onClick={() => { logout(); setShowUserMenu(false); }}>
                  <HugeiconsIcon icon={LogOutIcon} size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm header-signin-btn" onClick={() => navigate('/auth')} data-tour="auth-btn">
            <HugeiconsIcon icon={LogInIcon} size={14} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
