/**
 * DesignStudio — The Free-Form Design Canvas Page
 * ==================================================
 * This is the original "main view" of ArchLab, extracted into its own page
 * so we can add routing for the Challenge Dashboard and Challenge Workspace.
 *
 * Contains: Header + ComponentPalette + Canvas + PropertiesPanel + SimulationPanel
 */

import { useState, useCallback } from 'react';
import Header from '../components/Header/Header';
import ComponentPalette from '../components/Sidebar/ComponentPalette';
import DesignCanvas from '../components/Canvas/DesignCanvas';
import PropertiesPanel from '../components/Sidebar/PropertiesPanel';
import SimulationPanel from '../components/Simulation/SimulationPanel';
import type { Node, Edge } from '@xyflow/react';
import type { ArchNodeData } from '../types';
import { useSimulation } from '../hooks/useSimulation';

export default function DesignStudio() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Initialize the simulation hook
  const simulation = useSimulation(nodes, edges, setNodes);

  const handleUpdateNodeData = useCallback((nodeId: string, newData: Partial<ArchNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const handleSimToggle = useCallback(() => {
    if (simulation.simState === 'idle') {
      simulation.start();
    } else {
      simulation.stop();
    }
  }, [simulation]);

  return (
    <div className="app-container">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSave={() => alert('Save functionality coming soon!')}
        onAnalyze={() => alert('AI Analysis coming soon!')}
        simState={simulation.simState}
        onSimToggle={handleSimToggle}
      />

      <main className="app-main">
        {isSidebarOpen && <ComponentPalette />}

        <div className="app-canvas-area">
          <DesignCanvas
            onNodeSelect={setSelectedNodeId}
            externalNodes={nodes}
            setExternalNodes={setNodes}
            externalEdges={edges}
            setExternalEdges={setEdges}
            edgeTraffic={simulation.edgeTraffic}
            isSimulating={simulation.isActive}
          />

          <SimulationPanel
            simState={simulation.simState}
            rps={simulation.rps}
            speedMultiplier={simulation.speedMultiplier}
            systemMetrics={simulation.systemMetrics}
            onStart={simulation.start}
            onPause={simulation.pause}
            onResume={simulation.resume}
            onStop={simulation.stop}
            onRpsChange={simulation.setRps}
            onSpeedChange={simulation.setSpeedMultiplier}
          />
        </div>

        {selectedNodeId && (
          <PropertiesPanel
            selectedNodeId={selectedNodeId}
            nodes={nodes}
            onUpdateNodeData={handleUpdateNodeData}
            onClose={() => setSelectedNodeId(null)}
            isSimulating={simulation.isActive}
          />
        )}
      </main>
    </div>
  );
}
