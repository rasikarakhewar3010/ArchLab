/**
 * ArchNode — Custom React Flow Node Component (Phase 2 Enhanced)
 * ================================================================
 *
 * This is what each "component" looks like on the canvas.
 * Powered by Hugeicons for crisp visual rendering.
 * Features:
 *   - Pulsing status indicator dot (green/yellow/red) top-right
 *   - Live metrics display (latency, throughput, error rate)
 *   - Saturation progress bar at bottom (green → yellow → red gradient)
 *   - Glow effects for overloaded nodes
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Icon,
  Activity01Icon,
  Clock01Icon,
  TriangleAlertIcon,
} from '../common/Icon';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ArchNodeData } from '../../types';
import './ArchNode.css';

/** Format large numbers for compact display */
function formatMetric(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

const ArchNodeComponent = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ArchNodeData;

  const statusClass = nodeData.status ? `node-status-${nodeData.status}` : '';
  const hasMetrics = nodeData.metrics && nodeData.status;

  return (
    <div
      className={`arch-node ${statusClass} ${selected ? 'arch-node-selected' : ''} ${hasMetrics ? 'arch-node-simulating' : ''}`}
      style={{ '--node-color': nodeData.color } as React.CSSProperties}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="arch-handle arch-handle-target" />
      <Handle type="target" position={Position.Left} className="arch-handle arch-handle-target" id="left" />

      {/* Status indicator dot */}
      {nodeData.status && (
        <div className={`node-status-indicator status-${nodeData.status}`} />
      )}

      <div className="arch-node-header">
        <div className="arch-node-icon" style={{ background: nodeData.color }}>
          <Icon name={nodeData.icon} size={16} color="#ffffff" />
        </div>
        <div className="arch-node-title">{nodeData.label}</div>
      </div>

      <div className="arch-node-type">{nodeData.description}</div>

      {/* Live metrics during simulation */}
      {hasMetrics && nodeData.metrics && (
        <div className="arch-node-metrics">
          {nodeData.metrics.throughput !== undefined && (
            <span className="metric">
              <HugeiconsIcon icon={Activity01Icon} size={11} />
              {formatMetric(nodeData.metrics.throughput)}/s
            </span>
          )}
          {nodeData.metrics.latency !== undefined && (
            <span className="metric">
              <HugeiconsIcon icon={Clock01Icon} size={11} />
              {nodeData.metrics.latency}ms
            </span>
          )}
          {nodeData.metrics.errorRate !== undefined && nodeData.metrics.errorRate > 0 && (
            <span className="metric metric-error">
              <HugeiconsIcon icon={TriangleAlertIcon} size={11} />
              {nodeData.metrics.errorRate.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      {/* Saturation bar */}
      {hasMetrics && nodeData.metrics?.saturation !== undefined && (
        <div className="node-saturation-bar-container">
          <div
            className={`node-saturation-bar ${
              nodeData.metrics.saturation < 50 ? 'saturation-healthy' :
              nodeData.metrics.saturation < 75 ? 'saturation-warning' :
              'saturation-critical'
            }`}
            style={{ width: `${Math.min(nodeData.metrics.saturation, 100)}%` }}
          />
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="arch-handle arch-handle-source" />
      <Handle type="source" position={Position.Right} className="arch-handle arch-handle-source" id="right" />
    </div>
  );
});

ArchNodeComponent.displayName = 'ArchNodeComponent';

export default ArchNodeComponent;
