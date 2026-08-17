/**
 * AuthPage — Premium Login & Register Page
 * ===========================================
 * Full-viewport glassmorphism auth UI with animated form transitions.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Eye, EyeOff, ArrowRight, UserPlus, LogIn, Sparkles } from 'lucide-react';
import './AuthPage.css';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, error, clearError, isLoading } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
    setUsername('');
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        if (password !== passwordConfirm) {
          return; // Let the backend catch this too
        }
        await register(username, email, password, passwordConfirm);
      }
      navigate('/');
    } catch {
      // Error is already set in AuthContext
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-bg-gradient" />
        <div className="auth-bg-grid" />
        <div className="auth-bg-glow auth-bg-glow-1" />
        <div className="auth-bg-glow auth-bg-glow-2" />
      </div>

      <div className="auth-container">
        {/* Logo + Branding */}
        <div className="auth-brand" onClick={() => navigate('/')}>
          <div className="auth-logo">
            <Cpu size={28} />
          </div>
          <h1 className="auth-brand-name">ArchLab</h1>
          <p className="auth-tagline">
            <Sparkles size={14} />
            Master System Design
          </p>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          {/* Mode Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              <LogIn size={14} />
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              <UserPlus size={14} />
              Create Account
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input auth-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            {mode === 'register' && (
              <div className="auth-field animate-slide-in-up">
                <label className="auth-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="auth-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input auth-input"
                  placeholder={mode === 'register' ? 'Min 8 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="auth-field animate-slide-in-up">
                <label className="auth-label" htmlFor="passwordConfirm">Confirm Password</label>
                <input
                  id="passwordConfirm"
                  type="password"
                  className="input auth-input"
                  placeholder="Repeat your password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Guest */}
          <button
            className="btn btn-ghost auth-guest-btn"
            onClick={() => navigate('/')}
          >
            Continue as Guest →
          </button>
        </div>

        {/* Footer */}
        <p className="auth-footer">
          Build, simulate, and master system architectures.
        </p>
      </div>
    </div>
  );
}
