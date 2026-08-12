/**
 * PropertiesPanel — Right Sidebar for Component Configuration (Phase 2 Enhanced)
 * ================================================================================
 *
 * When a user selects a node on the canvas, this panel shows its properties.
 * Phase 2 additions:
 *   - Live simulation metrics with color-coded badges
 *   - Status indicator
 *   - Saturation visual
 */

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { Node } from '@xyflow/react';
import type { ArchNodeData } from '../../types';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  selectedNodeId: string | null;
  nodes: Node[];
  onUpdateNodeData: (nodeId: string, newData: Partial<ArchNodeData>) => void;
  onClose: () => void;
  /** Whether simulation is currently active */
  isSimulating?: boolean;
}

/** Format large numbers */
function formatMetric(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

export default function PropertiesPanel({
  selectedNodeId,
  nodes,
  onUpdateNodeData,
  onClose,
  isSimulating = false,
}: PropertiesPanelProps) {
  const node = nodes.find((n) => n.id === selectedNodeId);
  const nodeData = node?.data as ArchNodeData | undefined;

  const [localLabel, setLocalLabel] = useState('');
  const [localDesc, setLocalDesc] = useState('');

  useEffect(() => {
    if (nodeData) {
      setLocalLabel(nodeData.label || '');
      setLocalDesc(nodeData.description || '');
    }
  }, [nodeData]);

  if (!selectedNodeId || !node || !nodeData) {
    return (
      <div className="properties-panel empty">
        <Icons.MousePointerClick size={48} className="empty-icon" />
        <p className="empty-text">Select a component on the canvas to configure it.</p>
      </div>
    );
  }

  const IconComponent = ((Icons as any)[nodeData.icon] || Icons.Box) as React.ComponentType<LucideProps>;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalLabel(e.target.value);
    onUpdateNodeData(node.id, { label: e.target.value });
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalDesc(e.target.value);
    onUpdateNodeData(node.id, { description: e.target.value });
  };

  const handleConfigChange = (key: string, value: unknown) => {
    onUpdateNodeData(node.id, {
      config: {
        ...nodeData.config,
        [key]: value,
      },
    });
  };

  const renderConfigField = (key: string, value: unknown) => {
    if (typeof value === 'boolean') {
      return (
        <label key={key} className="config-field checkbox-field">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleConfigChange(key, e.target.checked)}
          />
          <span className="field-label">{key}</span>
        </label>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <div key={key} className="config-field">
          <label className="field-label">{key}</label>
          <input
            type="number"
            className="input"
            value={value}
            onChange={(e) => handleConfigChange(key, Number(e.target.value))}
          />
        </div>
      );
    }

    return (
      <div key={key} className="config-field">
        <label className="field-label">{key}</label>
        <input
          type="text"
          className="input"
          value={String(value)}
          onChange={(e) => handleConfigChange(key, e.target.value)}
        />
      </div>
    );
  };

  // Live simulation metrics
  const hasLiveMetrics = isSimulating && nodeData.metrics && nodeData.status;

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <div className="panel-icon" style={{ background: nodeData.color }}>
            <IconComponent size={16} />
          </div>
          <h2 className="panel-title">Properties</h2>
          {/* Status badge during simulation */}
          {nodeData.status && (
            <span className={`badge badge-status badge-${nodeData.status}`}>
              {nodeData.status.toUpperCase()}
            </span>
          )}
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>
          <Icons.X size={16} />
        </button>
      </div>

      <div className="panel-body">
        {/* Live Metrics Section (Phase 2) */}
        {hasLiveMetrics && nodeData.metrics && (
          <div className="settings-section">
            <h3 className="section-title">
              <Icons.Activity size={12} />
              Live Metrics
            </h3>
            <div className="live-metrics-grid">
              <div className="live-metric-card">
                <div className="live-metric-icon"><Icons.TrendingUp size={14} /></div>
                <div className="live-metric-data">
                  <span className="live-metric-value">{formatMetric(nodeData.metrics.throughput || 0)}/s</span>
                  <span className="live-metric-label">Throughput</span>
                </div>
              </div>
              <div className="live-metric-card">
                <div className="live-metric-icon"><Icons.Clock size={14} /></div>
                <div className="live-metric-data">
                  <span className="live-metric-value">{nodeData.metrics.latency || 0}ms</span>
                  <span className="live-metric-label">Latency</span>
                </div>
              </div>
              <div className="live-metric-card">
                <div className={`live-metric-icon ${(nodeData.metrics.errorRate || 0) > 5 ? 'metric-danger' : ''}`}>
                  <Icons.AlertTriangle size={14} />
                </div>
                <div className="live-metric-data">
                  <span className={`live-metric-value ${(nodeData.metrics.errorRate || 0) > 5 ? 'metric-danger' : ''}`}>
                    {(nodeData.metrics.errorRate || 0).toFixed(1)}%
                  </span>
                  <span className="live-metric-label">Error Rate</span>
                </div>
              </div>
              <div className="live-metric-card">
                <div className="live-metric-icon"><Icons.Gauge size={14} /></div>
                <div className="live-metric-data">
                  <span className="live-metric-value">{(nodeData.metrics.saturation || 0).toFixed(1)}%</span>
                  <span className="live-metric-label">Saturation</span>
                </div>
                {/* Saturation bar */}
                <div className="panel-saturation-bar-container">
                  <div
                    className={`panel-saturation-bar ${
                      (nodeData.metrics.saturation || 0) < 50 ? 'sat-healthy' :
                      (nodeData.metrics.saturation || 0) < 75 ? 'sat-warning' :
                      'sat-critical'
                    }`}
                    style={{ width: `${Math.min(nodeData.metrics.saturation || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Settings */}
        <div className="settings-section">
          <h3 className="section-title">General</h3>
          
          <div className="config-field">
            <label className="field-label">Name</label>
            <input
              type="text"
              className="input"
              value={localLabel}
              onChange={handleLabelChange}
            />
          </div>

          <div className="config-field">
            <label className="field-label">Description</label>
            <textarea
              className="input textarea"
              value={localDesc}
              onChange={handleDescChange}
              rows={3}
            />
          </div>
        </div>

        {/* Specific Configuration */}
        {nodeData.config && Object.keys(nodeData.config).length > 0 && (
          <div className="settings-section">
            <h3 className="section-title">Configuration</h3>
            <div className="config-list">
              {Object.entries(nodeData.config).map(([key, value]) =>
                renderConfigField(key, value)
              )}
            </div>
          </div>
        )}

        {/* Metrics placeholder when not simulating */}
        {!hasLiveMetrics && (
          <div className="settings-section">
            <h3 className="section-title">Metrics (Simulation)</h3>
            <div className="metrics-placeholder">
              <Icons.Activity size={16} />
              <p>Metrics will appear here when simulation is running.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
