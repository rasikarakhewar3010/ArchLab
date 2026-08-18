/**
 * Header — Top Navigation Bar
 * ==============================
 * Shows branding, navigation links, simulation toggle, save, analyze,
 * and user auth status (login button or user avatar dropdown).
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Sparkles, Menu, Play, Pause, Trophy, BookOpen, LogOut, Layers, LogIn, Compass } from 'lucide-react';
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
          <Menu size={18} />
        </button>
        
        <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="ArchLab Logo" style={{ height: '28px', width: 'auto' }} />
          <span className="logo-text">ArchLab</span>
        </div>

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
          <Compass size={14} />
          Guided Tour
        </button>

        {/* Learn Link */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/learn')}
          title="Learning Hub"
          data-tour="learn-btn"
        >
          <BookOpen size={14} />
          Learn
        </button>

        {/* Challenges Link */}
        <button
          className="btn btn-ghost btn-sm header-challenges-btn"
          onClick={() => navigate('/challenges')}
          title="System Design Challenges"
          data-tour="challenges-btn"
        >
          <Trophy size={14} />
          Challenges
        </button>

        {/* Simulation quick-toggle */}
        <button
          className={`btn btn-sm ${isSimulating ? 'btn-sim-active' : 'btn-secondary'}`}
          onClick={onSimToggle}
          title={isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          data-tour="simulate-btn"
        >
          {isSimulating ? <Pause size={14} /> : <Play size={14} />}
          {isSimulating ? 'Simulating' : 'Simulate'}
          {isSimulating && <span className="header-sim-dot" />}
        </button>

        <button className="btn btn-secondary btn-sm" onClick={onSave} data-tour="save-btn">
          <Save size={14} />
          Save
        </button>

        <button className="btn btn-primary btn-sm" onClick={onAnalyze} data-tour="analyze-btn">
          <Sparkles size={14} />
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
                  {user.username.charAt(0).toUpperCase()}
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
                  <Layers size={14} /> My Designs
                </button>
                <button className="header-dropdown-item" onClick={() => { navigate('/learn'); setShowUserMenu(false); }}>
                  <BookOpen size={14} /> Learning Hub
                </button>
                <div className="header-dropdown-divider" />
                <button className="header-dropdown-item header-dropdown-danger" onClick={() => { logout(); setShowUserMenu(false); }}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm header-signin-btn" onClick={() => navigate('/auth')} data-tour="auth-btn">
            <LogIn size={14} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
