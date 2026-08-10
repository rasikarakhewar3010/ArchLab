/**
 * DesignCanvas — The Main Canvas Component
 * ==========================================
 * 
 * This is the HEART of ArchLab — the interactive canvas where
 * users build their system architectures.
 * 
 * REACT FLOW CONCEPTS:
 * - ReactFlow: The main canvas component
 * - useNodesState: Hook to manage nodes (add, remove, update)
 * - useEdgesState: Hook to manage edges (connections)
 * - onConnect: Callback when user draws a connection between nodes
 * - onDrop: Callback when user drops a component from the palette
 * - nodeTypes: Map of custom node type names → React components
 * 
 * DRAG & DROP FLOW:
 * 1. User drags a component from the ComponentPalette (sidebar)
 * 2. The palette sets drag data via dataTransfer.setData()
 * 3. User drops it on the canvas
 * 4. onDrop reads the data, creates a new node at the drop position
 * 5. React Flow renders our custom ArchNodeComponent
 */

import { useCallback, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Connection,
  type ReactFlowInstance,
  type NodeChange,
  type Node,
  type Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ArchNodeComponent from './ArchNode';
import { COMPONENT_LIBRARY } from '../../data/componentLibrary';
import type { ArchNodeData } from '../../types';
import './DesignCanvas.css';

// Register our custom node type with React Flow
const nodeTypes = {
  archNode: ArchNodeComponent,
};

// Counter for generating unique node IDs
let nodeIdCounter = 0;

interface DesignCanvasProps {
  onNodeSelect?: (nodeId: string | null) => void;
  externalNodes?: Node[];
  setExternalNodes?: React.Dispatch<React.SetStateAction<Node[]>>;
}

export default function DesignCanvas({ onNodeSelect, externalNodes, setExternalNodes }: DesignCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Fallback local state if external state is not provided
  const [localNodes, setLocalNodes] = useState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodes = externalNodes || localNodes;
  const setNodes = setExternalNodes || setLocalNodes;

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );



  /**
   * onConnect — Called when the user draws an edge between two nodes.
   * addEdge() is a React Flow utility that adds the new edge to the list.
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,  // Animated dashed line = data flowing
            style: { 
              stroke: 'var(--color-primary)', 
              strokeWidth: 2,
            },
            type: 'smoothstep',  // Smooth curved edges (looks professional)
          },
          eds
        )
      );
    },
    [setEdges]
  );

  /**
   * onDragOver — Needed to allow dropping on the canvas.
   * Without this, the browser won't let you drop anything.
   */
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * onDrop — The magic of drag-and-drop!
   * 
   * 1. Read the component type from drag data
   * 2. Find the component definition from our library
   * 3. Convert screen coordinates to canvas coordinates
   * 4. Create a new node at that position
   * 5. Add it to the canvas
   */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Read the component type that was dragged
      const componentType = event.dataTransfer.getData('application/archlab-component');
      if (!componentType) return;

      // Find the component definition
      const componentDef = COMPONENT_LIBRARY.find((c) => c.type === componentType);
      if (!componentDef) return;

      // Convert screen position to canvas position
      // (accounts for zoom and pan)
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      // Create the new node
      const newNode: Node = {
        id: `node_${++nodeIdCounter}_${Date.now()}`,
        type: 'archNode',  // Use our custom node component
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

      // Add to canvas
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  /**
   * Handle node selection — notify parent so the config panel can update
   */
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      onNodeSelect?.(node.id);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  /**
   * MiniMap node color — color-code by category
   */
  const minimapNodeColor = useCallback((node: { data?: Record<string, unknown> }) => {
    const data = node.data as ArchNodeData | undefined;
    if (!data?.color) return '#6366f1';
    // Extract color from CSS variable (simplified)
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
  }, []);

  // Memoize default edge options for performance
  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
    type: 'smoothstep' as const,
  }), []);

  return (
    <div className="design-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        proOptions={{ hideAttribution: true }}
      >
        {/* Dot grid background (like Figma/Excalidraw) */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-border)"
        />

        {/* Controls: zoom in/out, fit view, lock */}
        <Controls 
          className="canvas-controls"
          showInteractive={false}
        />

        {/* MiniMap: bird's eye view in the corner */}
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

        {/* Node/Edge count panel */}
        <Panel position="bottom-center" className="canvas-stats-panel">
          <span>{nodes.length} components</span>
          <span className="stats-divider">·</span>
          <span>{edges.length} connections</span>
        </Panel>
      </ReactFlow>
    </div>
  );
}
