/**
 * AIFeedbackModal — Design Analysis Results
 * ============================================
 * Displays AI analysis scores, issues, and positives in a premium modal.
 * Used in the free-form DesignStudio (separate from ChallengeResultModal).
 * Powered by Hugeicons vector iconography (zero emojis).
 */

import {
  Cancel01Icon,
  TriangleAlertIcon,
  AlertCircleIcon,
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  SparklesIcon,
  Target01Icon,
  Link01Icon,
  BulbIcon,
  ChartIncreaseIcon,
  ShieldCheckIcon,
  FlashIcon,
  Coins01Icon,
  LockPasswordIcon,
  Wrench01Icon,
} from '../common/Icon';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import type { AIFeedback } from '../../types';
import './AIFeedbackModal.css';

interface AIFeedbackModalProps {
  feedback: AIFeedback;
  onClose: () => void;
}

const CATEGORY_META: Record<string, { label: string; icon: IconSvgElement }> = {
  scalability:     { label: 'Scalability',     icon: ChartIncreaseIcon },
  reliability:     { label: 'Reliability',     icon: ShieldCheckIcon },
  performance:     { label: 'Performance',     icon: FlashIcon },
  cost:            { label: 'Cost Efficiency', icon: Coins01Icon },
  security:        { label: 'Security',        icon: LockPasswordIcon },
  maintainability: { label: 'Maintainability', icon: Wrench01Icon },
};

export default function AIFeedbackModal({ feedback, onClose }: AIFeedbackModalProps) {
  const scoreColor =
    feedback.score >= 80 ? 'var(--color-success)' :
    feedback.score >= 60 ? 'var(--color-info)' :
    feedback.score >= 40 ? 'var(--color-warning)' :
    'var(--color-danger)';

  const scoreLabel =
    feedback.score >= 80 ? 'Excellent' :
    feedback.score >= 60 ? 'Good' :
    feedback.score >= 40 ? 'Needs Work' :
    'Critical Issues';

  return (
    <div className="aifeedback-overlay" onClick={onClose}>
      <div className="aifeedback-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="aifeedback-header">
          <div className="aifeedback-header-left">
            <HugeiconsIcon icon={SparklesIcon} size={18} />
            <h2>AI Architecture Analysis</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        {/* Score */}
        <div className="aifeedback-score-section">
          <div className="aifeedback-score-ring" style={{ '--score-color': scoreColor, '--score-deg': `${(feedback.score / 100) * 360}deg` } as React.CSSProperties}>
            <div className="aifeedback-score-inner">
              <span className="aifeedback-score-number">{feedback.score}</span>
              <span className="aifeedback-score-label">{scoreLabel}</span>
            </div>
          </div>
          <div className="aifeedback-score-meta">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <HugeiconsIcon icon={Target01Icon} size={13} />
              {feedback.component_count} components
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <HugeiconsIcon icon={Link01Icon} size={13} />
              {feedback.connection_count} connections
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="aifeedback-categories">
          <h3 className="aifeedback-section-title">Category Breakdown</h3>
          <div className="aifeedback-category-grid">
            {Object.entries(feedback.categories).map(([key, value]) => {
              const meta = CATEGORY_META[key] || { label: key, icon: SparklesIcon };
              return (
                <div key={key} className="aifeedback-category">
                  <div className="aifeedback-category-header">
                    <span className="aifeedback-category-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <HugeiconsIcon icon={meta.icon} size={13} />
                      {meta.label}
                    </span>
                    <span className="aifeedback-category-score">{value}/10</span>
                  </div>
                  <div className="aifeedback-category-bar">
                    <div
                      className="aifeedback-category-fill"
                      style={{
                        width: `${(value / 10) * 100}%`,
                        background: value >= 7 ? 'var(--color-success)' : value >= 4 ? 'var(--color-warning)' : 'var(--color-danger)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issues */}
        {feedback.issues.length > 0 && (
          <div className="aifeedback-section">
            <h3 className="aifeedback-section-title">Issues Found</h3>
            <div className="aifeedback-issues">
              {feedback.issues.map((issue, i) => (
                <div key={i} className={`aifeedback-issue issue-${issue.severity}`}>
                  <div className="aifeedback-issue-icon">
                    {issue.severity === 'critical' ? (
                      <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                    ) : issue.severity === 'warning' ? (
                      <HugeiconsIcon icon={TriangleAlertIcon} size={16} />
                    ) : (
                      <HugeiconsIcon icon={InformationCircleIcon} size={16} />
                    )}
                  </div>
                  <div className="aifeedback-issue-content">
                    <strong>{issue.title}</strong>
                    <p>{issue.description}</p>
                    <p className="aifeedback-suggestion" style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <HugeiconsIcon icon={BulbIcon} size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{issue.suggestion}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positives */}
        {feedback.positives.length > 0 && (
          <div className="aifeedback-section">
            <h3 className="aifeedback-section-title">What You Did Well</h3>
            <div className="aifeedback-positives">
              {feedback.positives.map((pos, i) => (
                <div key={i} className="aifeedback-positive">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                  <div>
                    <strong>{pos.title}</strong>
                    <p>{pos.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary aifeedback-close-btn" onClick={onClose}>
          Got it — Back to Canvas
        </button>
      </div>
    </div>
  );
}
