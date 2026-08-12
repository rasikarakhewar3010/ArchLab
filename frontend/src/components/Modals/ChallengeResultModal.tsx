/**
 * ChallengeResultModal — AI Score & Feedback Modal
 * ===================================================
 * Displays after submitting a challenge design:
 *   - Overall AI score (animated circular gauge)
 *   - Category breakdown (radar-style bars)
 *   - Issues list with severity badges
 *   - Positives list
 *   - Retry / Back to Dashboard actions
 */

import {
  X,
  Trophy,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowLeft,
  Boxes,
  Link2,
} from 'lucide-react';
import type { Challenge, AIFeedback } from '../../types';
import './ChallengeResultModal.css';

interface ChallengeResultModalProps {
  challenge: Challenge;
  feedback: AIFeedback;
  timeElapsed: number;
  onClose: () => void;
  onRetry: () => void;
  onBackToDashboard: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getScoreGrade(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent', color: 'var(--color-success)' };
  if (score >= 75) return { label: 'Good', color: '#22d3ee' };
  if (score >= 60) return { label: 'Fair', color: 'var(--color-warning)' };
  if (score >= 40) return { label: 'Needs Work', color: '#f97316' };
  return { label: 'Poor', color: 'var(--color-danger)' };
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, color: 'var(--color-danger)', label: 'Critical' },
  warning:  { icon: AlertTriangle, color: 'var(--color-warning)', label: 'Warning' },
  info:     { icon: Info, color: 'var(--color-primary)', label: 'Info' },
};

const CATEGORY_LABELS: Record<string, string> = {
  scalability: 'Scalability',
  reliability: 'Reliability',
  performance: 'Performance',
  cost: 'Cost Efficiency',
  security: 'Security',
  maintainability: 'Maintainability',
};

export default function ChallengeResultModal({
  challenge,
  feedback,
  timeElapsed,
  onClose,
  onRetry,
  onBackToDashboard,
}: ChallengeResultModalProps) {
  const grade = getScoreGrade(feedback.score);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Header */}
        <div className="result-header">
          <Trophy size={24} className="result-trophy" />
          <h2 className="result-title">Challenge Complete!</h2>
          <p className="result-challenge-name">{challenge.title}</p>
        </div>

        {/* Score Circle */}
        <div className="result-score-section">
          <div className="score-circle" style={{ '--score-color': grade.color } as React.CSSProperties}>
            <svg className="score-ring" viewBox="0 0 120 120">
              <circle className="ring-bg" cx="60" cy="60" r="52" />
              <circle
                className="ring-progress"
                cx="60" cy="60" r="52"
                strokeDasharray={`${(feedback.score / 100) * 326.7} 326.7`}
                style={{ stroke: grade.color }}
              />
            </svg>
            <div className="score-inner">
              <span className="score-number">{feedback.score}</span>
              <span className="score-label">{grade.label}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="result-quick-stats">
            <div className="quick-stat">
              <Clock size={14} />
              <span>{formatTime(timeElapsed)}</span>
            </div>
            <div className="quick-stat">
              <Boxes size={14} />
              <span>{feedback.component_count} components</span>
            </div>
            <div className="quick-stat">
              <Link2 size={14} />
              <span>{feedback.connection_count} connections</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="result-section">
          <h3 className="result-section-title">Category Scores</h3>
          <div className="category-grid">
            {Object.entries(feedback.categories).map(([key, value]) => (
              <div key={key} className="category-item">
                <div className="category-label-row">
                  <span className="category-name">{CATEGORY_LABELS[key] || key}</span>
                  <span className="category-value">{value}/10</span>
                </div>
                <div className="category-bar-bg">
                  <div
                    className="category-bar"
                    style={{
                      width: `${(value / 10) * 100}%`,
                      background: value >= 7 ? 'var(--color-success)' : value >= 4 ? 'var(--color-warning)' : 'var(--color-danger)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues */}
        {feedback.issues.length > 0 && (
          <div className="result-section">
            <h3 className="result-section-title">Issues Found ({feedback.issues.length})</h3>
            <div className="issues-list">
              {feedback.issues.map((issue, i) => {
                const config = SEVERITY_CONFIG[issue.severity];
                const Icon = config.icon;
                return (
                  <div key={i} className="issue-item">
                    <div className="issue-header">
                      <Icon size={14} style={{ color: config.color }} />
                      <span className="issue-severity" style={{ color: config.color }}>
                        {config.label}
                      </span>
                      <span className="issue-title">{issue.title}</span>
                    </div>
                    <p className="issue-description">{issue.description}</p>
                    <p className="issue-suggestion">💡 {issue.suggestion}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Positives */}
        {feedback.positives.length > 0 && (
          <div className="result-section">
            <h3 className="result-section-title">What You Did Well ({feedback.positives.length})</h3>
            <div className="positives-list">
              {feedback.positives.map((pos, i) => (
                <div key={i} className="positive-item">
                  <CheckCircle2 size={14} className="positive-icon" />
                  <div>
                    <span className="positive-title">{pos.title}</span>
                    <p className="positive-desc">{pos.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="result-actions">
          <button className="btn btn-secondary btn-sm" onClick={onRetry}>
            <RotateCcw size={14} />
            Try Again
          </button>
          <button className="btn btn-primary btn-sm" onClick={onBackToDashboard}>
            <ArrowLeft size={14} />
            Back to Challenges
          </button>
        </div>
      </div>
    </div>
  );
}
