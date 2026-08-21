/**
 * ChallengePanel — Left Sidebar for Challenge Mode
 * ===================================================
 * Shows challenge details, requirements checklist, progressive hints,
 * a countdown timer, and the submit button.
 * Powered by Hugeicons.
 */

import { useState } from 'react';
import {
  ArrowLeft01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  BulbIcon,
  ViewIcon,
  ViewOffIcon,
  Target01Icon,
  FireIcon,
  Building02Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  AiMagicIcon,
} from '../common/Icon';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Challenge } from '../../types';
import './ChallengePanel.css';

interface ChallengePanelProps {
  challenge: Challenge;
  timeElapsed: number;
  nodeCount: number;
  edgeCount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  onBack: () => void;
  isSidebarOpen: boolean;
}

/** Format seconds as MM:SS */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'var(--color-success)',
  medium: 'var(--color-warning)',
  hard: 'var(--color-danger)',
  expert: '#a855f7',
};

export default function ChallengePanel({
  challenge,
  timeElapsed,
  nodeCount,
  edgeCount,
  onSubmit,
  isSubmitting,
  onBack,
  isSidebarOpen,
}: ChallengePanelProps) {
  const [revealedHints, setRevealedHints] = useState(0);
  const [sectionsOpen, setSectionsOpen] = useState({
    functional: true,
    nonFunctional: true,
    hints: false,
  });

  const toggleSection = (key: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const timeLimitSec = challenge.time_limit_minutes * 60;
  const timeRemaining = Math.max(0, timeLimitSec - timeElapsed);
  const isOvertime = timeElapsed > timeLimitSec;
  const timePercent = Math.min((timeElapsed / timeLimitSec) * 100, 100);

  if (!isSidebarOpen) return null;

  return (
    <div className="challenge-panel">
      {/* Header */}
      <div className="cp-header">
        <button className="btn btn-ghost btn-icon btn-xs" onClick={onBack} title="Back to Challenges">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </button>
        <span className="cp-header-label">CHALLENGE</span>
      </div>

      <div className="cp-body">
        {/* Title & Difficulty */}
        <div className="cp-title-section">
          <span
            className="cp-difficulty"
            style={{ color: DIFFICULTY_COLORS[challenge.difficulty] }}
          >
            {challenge.difficulty.toUpperCase()}
          </span>
          <h2 className="cp-title">{challenge.title}</h2>
          <p className="cp-description">{challenge.description}</p>
          {challenge.companies.length > 0 && (
            <div className="cp-companies">
              <HugeiconsIcon icon={Building02Icon} size={11} />
              {challenge.companies.map((c) => (
                <span key={c} className="cp-company-tag">{c}</span>
              ))}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className={`cp-timer ${isOvertime ? 'overtime' : ''}`}>
          <div className="timer-row">
            <HugeiconsIcon icon={Clock01Icon} size={14} />
            <span className="timer-value">
              {isOvertime ? '+' : ''}{formatTime(isOvertime ? timeElapsed - timeLimitSec : timeRemaining)}
            </span>
            <span className="timer-label">
              {isOvertime ? 'overtime' : 'remaining'}
            </span>
          </div>
          <div className="timer-bar-bg">
            <div
              className={`timer-bar ${isOvertime ? 'bar-overtime' : timePercent > 75 ? 'bar-warning' : 'bar-normal'}`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        {/* Design Stats */}
        <div className="cp-stats">
          <div className="cp-stat">
            <HugeiconsIcon icon={Target01Icon} size={12} />
            <span>{nodeCount} components</span>
          </div>
          <div className="cp-stat">
            <HugeiconsIcon icon={FireIcon} size={12} />
            <span>{edgeCount} connections</span>
          </div>
        </div>

        {/* Functional Requirements */}
        <div className="cp-section">
          <button className="cp-section-header" onClick={() => toggleSection('functional')}>
            {sectionsOpen.functional ? (
              <HugeiconsIcon icon={ChevronDownIcon} size={14} />
            ) : (
              <HugeiconsIcon icon={ChevronRightIcon} size={14} />
            )}
            <span>Functional Requirements</span>
            <span className="cp-section-count">{challenge.functional_requirements.length}</span>
          </button>
          {sectionsOpen.functional && (
            <ul className="cp-checklist">
              {challenge.functional_requirements.map((req, i) => (
                <li key={i} className="cp-check-item">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="check-icon" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Non-Functional Requirements */}
        <div className="cp-section">
          <button className="cp-section-header" onClick={() => toggleSection('nonFunctional')}>
            {sectionsOpen.nonFunctional ? (
              <HugeiconsIcon icon={ChevronDownIcon} size={14} />
            ) : (
              <HugeiconsIcon icon={ChevronRightIcon} size={14} />
            )}
            <span>Non-Functional Requirements</span>
            <span className="cp-section-count">{challenge.non_functional_requirements.length}</span>
          </button>
          {sectionsOpen.nonFunctional && (
            <ul className="cp-checklist">
              {challenge.non_functional_requirements.map((req, i) => (
                <li key={i} className="cp-check-item">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="check-icon" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Hints */}
        <div className="cp-section">
          <button className="cp-section-header" onClick={() => toggleSection('hints')}>
            {sectionsOpen.hints ? (
              <HugeiconsIcon icon={ChevronDownIcon} size={14} />
            ) : (
              <HugeiconsIcon icon={ChevronRightIcon} size={14} />
            )}
            <HugeiconsIcon icon={BulbIcon} size={14} className="hint-icon" />
            <span>Hints</span>
            <span className="cp-section-count">{revealedHints}/{challenge.hints.length}</span>
          </button>
          {sectionsOpen.hints && (
            <div className="cp-hints">
              {challenge.hints.map((hint, i) => (
                <div key={i} className={`cp-hint ${i < revealedHints ? 'revealed' : 'hidden'}`}>
                  {i < revealedHints ? (
                    <>
                      <HugeiconsIcon icon={ViewIcon} size={12} />
                      <span>{hint}</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={ViewOffIcon} size={12} />
                      <span className="hint-hidden-text">Hint {i + 1} — click to reveal</span>
                    </>
                  )}
                </div>
              ))}
              {revealedHints < challenge.hints.length && (
                <button
                  className="btn btn-ghost btn-xs reveal-btn"
                  onClick={() => setRevealedHints((h) => h + 1)}
                >
                  <HugeiconsIcon icon={BulbIcon} size={12} />
                  Reveal Next Hint
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="cp-footer">
        <button
          className="btn btn-primary cp-submit-btn"
          onClick={onSubmit}
          disabled={isSubmitting || nodeCount === 0}
        >
          {isSubmitting ? (
            <>
              <span className="auth-spinner" style={{ width: 14, height: 14 }} />
              Analyzing...
            </>
          ) : (
            <>
              <HugeiconsIcon icon={AiMagicIcon} size={16} />
              Submit Design
            </>
          )}
        </button>
      </div>
    </div>
  );
}
