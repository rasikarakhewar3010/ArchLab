/**
 * PropertiesPanel — Right Sidebar for Component Configuration
 * ==============================================================
 * 
 * When a user selects a node on the canvas, this panel shows its properties.
 * Users can edit labels, descriptions, and specific configurations
 * (like DB replication, LB algorithm, etc.).
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
}

export default function PropertiesPanel({
  selectedNodeId,
  nodes,
  onUpdateNodeData,
  onClose,
}: PropertiesPanelProps) {
  // Find the selected node
  const node = nodes.find((n) => n.id === selectedNodeId);
  const nodeData = node?.data as ArchNodeData | undefined;

  // Local state for form inputs to avoid laggy typing
  const [localLabel, setLocalLabel] = useState('');
  const [localDesc, setLocalDesc] = useState('');

  // Sync local state when selected node changes
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

  // Helper to render configuration fields dynamically based on config type
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

    // Default to text input
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

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <div className="panel-icon" style={{ background: nodeData.color }}>
            <IconComponent size={16} />
          </div>
          <h2 className="panel-title">Properties</h2>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>
          <Icons.X size={16} />
        </button>
      </div>

      <div className="panel-body">
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

        {/* Metrics (Phase 2 Preview) */}
        <div className="settings-section">
          <h3 className="section-title">Metrics (Simulation)</h3>
          <div className="metrics-placeholder">
            <Icons.Activity size={16} />
            <p>Metrics will appear here when simulation is running.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
