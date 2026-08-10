import { useState, useCallback } from 'react';
import Header from './components/Header/Header';
import ComponentPalette from './components/Sidebar/ComponentPalette';
import DesignCanvas from './components/Canvas/DesignCanvas';
import PropertiesPanel from './components/Sidebar/PropertiesPanel';
import { ReactFlowProvider } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import type { ArchNodeData } from './types';
import './App.css';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  // Function to update a specific node's data from the properties panel
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

  return (
    <div className="app-container">
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onSave={() => alert('Save functionality coming soon!')}
        onAnalyze={() => alert('AI Analysis coming soon!')}
      />
      
      <main className="app-main">
        {isSidebarOpen && <ComponentPalette />}
        
        <div className="app-canvas-area">
          <ReactFlowProvider>
            {/* 
              We need to pass down the nodes and setNodes to DesignCanvas. 
              Let's update DesignCanvas props next to accept these.
            */}
            <DesignCanvas 
              onNodeSelect={setSelectedNodeId} 
              externalNodes={nodes}
              setExternalNodes={setNodes}
            />
          </ReactFlowProvider>
        </div>

        {selectedNodeId && (
          <PropertiesPanel 
            selectedNodeId={selectedNodeId}
            nodes={nodes}
            onUpdateNodeData={handleUpdateNodeData}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </main>
    </div>
  );
}

