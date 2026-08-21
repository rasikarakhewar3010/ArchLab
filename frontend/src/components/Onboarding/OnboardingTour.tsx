/**
 * OnboardingTour — Interactive Guided Tour Component
 * =====================================================
 * Renders a step-by-step spotlight tour over the ArchLab UI.
 * Powered by Hugeicons.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
} from '../common/Icon';
import { HugeiconsIcon } from '@hugeicons/react';
import { TOUR_STEPS } from './tourSteps';
import './OnboardingTour.css';

interface OnboardingTourProps {
  isActive: boolean;
  onEnd: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 12;
const TOOLTIP_GAP = 18;

export default function OnboardingTour({ isActive, onEnd }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isFullScreen = step.target === null;

  /**
   * Measure the target element and compute spotlight + tooltip positions.
   */
  const measureTarget = useCallback(() => {
    if (!step.target) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top - SPOTLIGHT_PADDING,
      left: rect.left - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    });

    // Position tooltip
    requestAnimationFrame(() => {
      if (!tooltipRef.current) return;
      const tooltip = tooltipRef.current;
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = 0;
      let left = 0;
      let finalPosition = step.position;

      const positions: Array<'bottom' | 'top' | 'right' | 'left'> = [
        step.position as 'bottom' | 'top' | 'right' | 'left',
        'bottom', 'top', 'right', 'left',
      ];

      for (const pos of positions) {
        let ok = true;

        switch (pos) {
          case 'bottom':
            top = rect.bottom + SPOTLIGHT_PADDING + TOOLTIP_GAP;
            left = rect.left + rect.width / 2 - tw / 2;
            ok = top + th < vh - 16 && left > 8 && left + tw < vw - 8;
            break;
          case 'top':
            top = rect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - th;
            left = rect.left + rect.width / 2 - tw / 2;
            ok = top > 8 && left > 8 && left + tw < vw - 8;
            break;
          case 'right':
            top = rect.top + rect.height / 2 - th / 2;
            left = rect.right + SPOTLIGHT_PADDING + TOOLTIP_GAP;
            ok = left + tw < vw - 16 && top > 8 && top + th < vh - 8;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - th / 2;
            left = rect.left - SPOTLIGHT_PADDING - TOOLTIP_GAP - tw;
            ok = left > 8 && top > 8 && top + th < vh - 8;
            break;
        }

        if (ok) {
          finalPosition = pos;
          break;
        }
      }

      // Clamp to viewport
      top = Math.max(8, Math.min(top, vh - th - 8));
      left = Math.max(8, Math.min(left, vw - tw - 8));

      setTooltipStyle({ top, left });
      setArrowPosition(
        finalPosition === 'bottom' ? 'bottom' :
        finalPosition === 'top' ? 'top' :
        finalPosition === 'right' ? 'right' :
        'left'
      );
    });
  }, [step]);

  // Measure on step change
  useEffect(() => {
    if (!isActive) return;
    measureTarget();
  }, [isActive, currentStep, step.target, measureTarget]);

  // Re-measure on resize or scroll
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureTarget);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, measureTarget]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          e.preventDefault();
          handleSkip();
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('archlab-tour-completed', 'true');
    setCurrentStep(0);
    onEnd();
  }, [onEnd]);

  const handleComplete = useCallback(() => {
    localStorage.setItem('archlab-tour-completed', 'true');
    setCurrentStep(0);
    onEnd();
  }, [onEnd]);

  const goNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setIsTransitioning(false);
      }, 180);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((s) => s - 1);
        setIsTransitioning(false);
      }, 180);
    }
  }, [currentStep]);

  if (!isActive) return null;

  const totalContentSteps = TOUR_STEPS.length - 2; // exclude welcome + completion
  const contentStepIndex = currentStep - 1; // 0-indexed within content steps
  const progressPercent = isFullScreen
    ? (isFirstStep ? 0 : 100)
    : ((contentStepIndex / (totalContentSteps - 1)) * 100);

  // --- Full-screen welcome/completion ---
  if (isFullScreen) {
    return createPortal(
      <div className="tour-overlay tour-fade-active">
        <div className="tour-backdrop" />
        <div className="tour-fullscreen">
          <div className="tour-fullscreen-card">
            <div className="tour-fullscreen-icon">
              <Icon name={step.icon} size={32} />
            </div>
            <h2 className="tour-fullscreen-title">{step.title}</h2>
            <p className="tour-fullscreen-desc">{step.description}</p>
            <div className="tour-fullscreen-actions">
              {isFirstStep ? (
                <>
                  <button className="tour-btn-start" onClick={goNext}>
                    Start Tour
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} style={{ marginLeft: 8 }} />
                  </button>
                  <button className="tour-btn tour-btn-ghost" onClick={handleSkip}>
                    Skip
                  </button>
                </>
              ) : (
                <>
                  <button className="tour-btn tour-btn-secondary" onClick={goPrev}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                    Back
                  </button>
                  <button className="tour-btn-start" onClick={handleComplete}>
                    Start Designing
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} style={{ marginLeft: 8 }} />
                  </button>
                </>
              )}
            </div>
            <div className="tour-keyboard-hint">
              <span>
                <span className="tour-kbd">&#8592;</span> <span className="tour-kbd">&#8594;</span> to navigate
              </span>
              <span>
                <span className="tour-kbd">Esc</span> to skip
              </span>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // --- Spotlight step ---
  const arrowClass =
    arrowPosition === 'bottom' ? 'tour-arrow-bottom' :
    arrowPosition === 'top' ? 'tour-arrow-top' :
    arrowPosition === 'right' ? 'tour-arrow-right' :
    'tour-arrow-left';

  return createPortal(
    <div className="tour-overlay tour-fade-active">
      {/* Spotlight cutout */}
      {targetRect ? (
        <div
          className="tour-spotlight"
          onClick={handleSkip}
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            opacity: isTransitioning ? 0 : 1,
          }}
        />
      ) : (
        <div className="tour-backdrop" onClick={handleSkip} />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="tour-tooltip"
        style={{
          ...tooltipStyle,
          opacity: isTransitioning ? 0 : 1,
        }}
      >
        <div className={`tour-arrow ${arrowClass}`} />
        <div className="tour-tooltip-inner">
          {/* Header */}
          <div className="tour-step-header">
            <div className="tour-step-icon">
              <Icon name={step.icon} size={18} />
            </div>
            <span className="tour-step-title">{step.title}</span>
            <span className="tour-step-counter">
              {contentStepIndex + 1} of {totalContentSteps}
            </span>
          </div>

          {/* Description */}
          <p className="tour-step-description">{step.description}</p>

          {/* Progress bar */}
          <div className="tour-progress-bar-track">
            <div
              className="tour-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Actions */}
          <div className="tour-actions">
            <button className="tour-btn tour-btn-ghost" onClick={handleSkip}>
              Skip Tour
            </button>
            <div className="tour-actions-right">
              {currentStep > 1 && (
                <button className="tour-btn tour-btn-secondary" onClick={goPrev}>
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                  Back
                </button>
              )}
              <button className="tour-btn tour-btn-primary" onClick={goNext}>
                {currentStep === TOUR_STEPS.length - 2 ? 'Finish' : 'Next'}
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
