/**
 * ArchNode — Custom React Flow Node Component
 * ==============================================
 * 
 * This is what each "component" looks like on the canvas.
 * React Flow lets you define custom node types that replace
 * the default boring rectangles with our styled, interactive cards.
 * 
 * REACT FLOW CONCEPTS:
 * - Node: A box on the canvas (our architecture component)
 * - Handle: Connection point on a node (where edges attach)
 * - Edge: A line connecting two nodes (data flow)
 * 
 * HOW CUSTOM NODES WORK:
 * 1. You create a React component (this file)
 * 2. Register it with React Flow: nodeTypes={{ archNode: ArchNodeComponent }}
 * 3. When creating a node, set type: 'archNode'
 * 4. React Flow renders YOUR component instead of the default
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ArchNodeData } from '../../types';
import './ArchNode.css';

/**
 * memo() is a React performance optimization.
 * It prevents re-rendering when props haven't changed.
 * Important for canvas performance with many nodes.
 */
const ArchNodeComponent = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as ArchNodeData;
  // Dynamically get the icon component from Lucide
  const IconComponent = ((Icons as any)[nodeData.icon] || Icons.Box) as React.ComponentType<LucideProps>;

  const statusClass = nodeData.status ? `node-status-${nodeData.status}` : '';

  return (
    <div
      className={`arch-node ${statusClass} ${selected ? 'arch-node-selected' : ''}`}
      style={{ '--node-color': nodeData.color } as React.CSSProperties}
    >
      {/* 
        Handles = connection points.
        Position.Top = edge connects from the top.
        Position.Bottom = edge connects from the bottom.
        We add Left and Right too for flexible connections.
      */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="arch-handle arch-handle-target" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="arch-handle arch-handle-target" 
        id="left"
      />

      <div className="arch-node-header">
        <div className="arch-node-icon" style={{ background: nodeData.color }}>
          <IconComponent size={16} />
        </div>
        <div className="arch-node-title">{nodeData.label}</div>
      </div>

      <div className="arch-node-type">{nodeData.description}</div>

      {/* Show metrics during simulation (Phase 2) */}
      {nodeData.metrics && (
        <div className="arch-node-metrics">
          {nodeData.metrics.latency !== undefined && (
            <span className="metric">
              <Icons.Clock size={10} />
              {nodeData.metrics.latency}ms
            </span>
          )}
          {nodeData.metrics.throughput !== undefined && (
            <span className="metric">
              <Icons.TrendingUp size={10} />
              {nodeData.metrics.throughput}/s
            </span>
          )}
        </div>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="arch-handle arch-handle-source"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="arch-handle arch-handle-source"
        id="right"
      />
    </div>
  );
});

ArchNodeComponent.displayName = 'ArchNodeComponent';

export default ArchNodeComponent;
