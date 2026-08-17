/**
 * DesignCanvas — The Main Canvas Component (Phase 2 Enhanced)
 * ==============================================================
 *
 * This is the HEART of ArchLab — the interactive canvas where
 * users build their system architectures.
 *
 * Phase 2 additions:
 *   - AnimatedEdge custom edge type with flowing particles
 *   - Edge traffic data integration for simulation visualization
 */

import { useCallback, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Connection,
  type ReactFlowInstance,
  type NodeChange,
  type EdgeChange,
  type Node,
  type Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ArchNodeComponent from './ArchNode';
import AnimatedEdge from './AnimatedEdge';
import { COMPONENT_LIBRARY } from '../../data/componentLibrary';
import type { ArchNodeData } from '../../types';
import type { EdgeTraffic } from '../../simulation/types';
import { useDesignWebSocket } from '../../hooks/useDesignWebSocket';
import './DesignCanvas.css';

// Register our custom node and edge types with React Flow
const nodeTypes = {
  archNode: ArchNodeComponent,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

// Counter for generating unique node IDs
let nodeIdCounter = 0;

interface DesignCanvasProps {
  onNodeSelect?: (nodeId: string | null) => void;
  externalNodes?: Node[];
  setExternalNodes?: React.Dispatch<React.SetStateAction<Node[]>>;
  /** External edges state lifted to App for simulation engine access */
  externalEdges?: Edge[];
  setExternalEdges?: React.Dispatch<React.SetStateAction<Edge[]>>;
  /** Edge traffic data from simulation for animated edges */
  edgeTraffic?: EdgeTraffic[];
  /** Whether simulation is currently active */
  isSimulating?: boolean;
  /** Design ID for WebSocket real-time collaboration */
  designId?: string;
  /** Unique client ID for WebSocket */
  clientId?: string;
}

export default function DesignCanvas({
  onNodeSelect,
  externalNodes,
  setExternalNodes,
  externalEdges,
  setExternalEdges,
  edgeTraffic = [],
  isSimulating = false,
  designId = '',
  clientId = 'local-client',
}: DesignCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Fallback local state if external state is not provided
  const [localNodes, setLocalNodes] = useState<Node[]>([]);
  const [localEdges, setLocalEdges] = useState<Edge[]>([]);

  const nodes = externalNodes || localNodes;
  const setNodes = setExternalNodes || setLocalNodes;
  const edges = externalEdges || localEdges;
  const setEdges = setExternalEdges || setLocalEdges;

  const { broadcastChanges } = useDesignWebSocket(
    designId,
    clientId,
    setNodes as React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges as React.Dispatch<React.SetStateAction<Edge[]>>
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      if (designId) broadcastChanges(undefined, changes);
    },
    [setEdges, broadcastChanges, designId]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      if (designId) broadcastChanges(changes, undefined);
    },
    [setNodes, broadcastChanges, designId]
  );

  /**
   * onConnect — Called when the user draws an edge between two nodes.
   * Uses our custom animated edge type during simulation.
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: {
              stroke: 'var(--color-primary)',
              strokeWidth: 2,
            },
            type: 'animated',  // Use our custom AnimatedEdge
          },
          eds
        )
      );
      if (designId) {
        // Broadcast the new edge as an 'add' change
        const edgeId = `reactflow__edge-${connection.source}${connection.sourceHandle || ''}-${connection.target}${connection.targetHandle || ''}`;
        broadcastChanges(undefined, [{
          type: 'add',
          item: {
            id: edgeId,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            animated: true,
            type: 'animated',
          }
        } as EdgeChange]);
      }
    },
    [setEdges, broadcastChanges, designId]
  );

  /**
   * Enrich edges with traffic data during simulation.
   * This passes trafficRps and status to each AnimatedEdge component.
   */
  const enrichedEdges = useMemo(() => {
    if (!isSimulating || edgeTraffic.length === 0) return edges;

    return edges.map((edge) => {
      const traffic = edgeTraffic.find(
        (t) => t.source === edge.source && t.target === edge.target
      );
      // Determine status from the source node
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const sourceData = sourceNode?.data as ArchNodeData | undefined;

      return {
        ...edge,
        type: 'animated',
        data: {
          ...((edge.data as Record<string, unknown>) || {}),
          trafficRps: traffic?.rps || 0,
          status: sourceData?.status || null,
        },
      };
    });
  }, [edges, edgeTraffic, isSimulating, nodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const componentType = event.dataTransfer.getData('application/archlab-component');
      if (!componentType) return;

      const componentDef = COMPONENT_LIBRARY.find((c) => c.type === componentType);
      if (!componentDef) return;

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: `node_${++nodeIdCounter}_${Date.now()}`,
        type: 'archNode',
        position,
        data: {
          label: componentDef.name,
          componentType: componentDef.type,
          category: componentDef.category,
          description: componentDef.description,
          icon: componentDef.icon,
          color: componentDef.color,
          config: { ...componentDef.defaultConfig },
        } as ArchNodeData,
      };

      setNodes((nds) => [...nds, newNode]);
      if (designId) {
        broadcastChanges([{ type: 'add', item: newNode }], undefined);
      }
    },
    [reactFlowInstance, setNodes, broadcastChanges, designId]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  const minimapNodeColor = useCallback((node: { data?: Record<string, unknown> }) => {
    const data = node.data as ArchNodeData | undefined;
    // During simulation, color by status
    if (isSimulating && data?.status) {
      const statusColorMap: Record<string, string> = {
        healthy: '#10b981',
        warning: '#f59e0b',
        critical: '#ef4444',
        down: '#991b1b',
      };
      return statusColorMap[data.status] || '#6366f1';
    }
    if (!data?.color) return '#6366f1';
    const colorMap: Record<string, string> = {
      'var(--color-node-compute)': '#6366f1',
      'var(--color-node-storage)': '#10b981',
      'var(--color-node-networking)': '#f59e0b',
      'var(--color-node-security)': '#ef4444',
      'var(--color-node-async)': '#8b5cf6',
      'var(--color-node-frontend)': '#06b6d4',
      'var(--color-node-operations)': '#64748b',
    };
    return colorMap[data.color] || '#6366f1';
  }, [isSimulating]);

  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
    type: 'animated' as const,
  }), []);

  return (
    <div className="design-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={enrichedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-border)"
        />

        <Controls
          className="canvas-controls"
          showInteractive={false}
        />

        <MiniMap
          className="canvas-minimap"
          nodeColor={minimapNodeColor}
          maskColor="rgba(6, 6, 11, 0.8)"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        />

        <Panel position="top-center" className="canvas-stats-panel">
          <span>{nodes.length} components</span>
          <span className="stats-divider">·</span>
          <span>{edges.length} connections</span>
          {isSimulating && (
            <>
              <span className="stats-divider">·</span>
              <span className="stats-simulating">⚡ SIMULATING</span>
            </>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
}
