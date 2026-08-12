/**
 * AnimatedEdge — Custom React Flow Edge with Flowing Particles
 * ===============================================================
 * Renders animated dots along the connection path to visualize
 * data traffic flowing between architecture components.
 *
 * Particle count and speed scale with the traffic volume on the edge.
 */

import { memo } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import './AnimatedEdge.css';

const AnimatedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  // Get traffic data passed from the parent
  const trafficRps = (data as any)?.trafficRps ?? 0;

  // Calculate particle count based on traffic (1-6 particles)
  const particleCount = trafficRps > 0
    ? Math.min(Math.max(Math.ceil(Math.log10(trafficRps + 1)), 1), 6)
    : 0;

  // Calculate animation speed based on traffic (faster = more traffic)
  const baseDuration = 3; // seconds
  const speedFactor = trafficRps > 0 ? Math.max(0.4, baseDuration / Math.log10(trafficRps + 10)) : baseDuration;

  // Determine particle color based on edge status
  const status = (data as any)?.status;
  let particleColor = 'var(--color-primary)';
  if (status === 'warning') particleColor = 'var(--color-warning)';
  else if (status === 'critical' || status === 'down') particleColor = 'var(--color-danger)';
  else if (status === 'healthy') particleColor = 'var(--color-success)';

  return (
    <>
      {/* Base edge line */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: particleColor,
          strokeWidth: trafficRps > 0 ? 2.5 : 2,
          opacity: trafficRps > 0 ? 1 : 0.5,
        }}
      />

      {/* Animated particles */}
      {particleCount > 0 && (
        <g>
          {Array.from({ length: particleCount }).map((_, i) => (
            <circle
              key={`${id}-particle-${i}`}
              r={trafficRps > 10000 ? 3.5 : 2.5}
              fill={particleColor}
              filter={`drop-shadow(0 0 3px ${particleColor === 'var(--color-primary)' ? '#6366f1' : particleColor === 'var(--color-success)' ? '#10b981' : particleColor === 'var(--color-warning)' ? '#f59e0b' : '#ef4444'})`}
            >
              <animateMotion
                dur={`${speedFactor}s`}
                repeatCount="indefinite"
                begin={`${(i * speedFactor) / particleCount}s`}
                path={edgePath}
              />
            </circle>
          ))}
        </g>
      )}
    </>
  );
});

AnimatedEdge.displayName = 'AnimatedEdge';

export default AnimatedEdge;
