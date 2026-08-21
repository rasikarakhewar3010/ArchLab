/**
 * DesignStudio — The Free-Form Design Canvas Page
 * ==================================================
 * Contains: Header + ComponentPalette + Canvas + PropertiesPanel + SimulationPanel
 *
 * Features:
 *   - Save/Load designs via the API
 *   - AI Analysis with feedback modal
 *   - Load existing designs via ?id=<uuid> query parameter
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import ComponentPalette from '../components/Sidebar/ComponentPalette';
import DesignCanvas from '../components/Canvas/DesignCanvas';
import PropertiesPanel from '../components/Sidebar/PropertiesPanel';
import SimulationPanel from '../components/Simulation/SimulationPanel';
import AIFeedbackModal from '../components/Modals/AIFeedbackModal';
import OnboardingTour from '../components/Onboarding/OnboardingTour';
import type { Node, Edge } from '@xyflow/react';
import type { ArchNodeData, AIFeedback } from '../types';
import { useSimulation } from '../hooks/useSimulation';
import { useAuth } from '../context/AuthContext';
import { createDesign, updateDesign, getDesign, analyzeDesign } from '../services/api';
import { CheckmarkCircle01Icon, AlertCircleIcon, SparklesIcon } from '../components/common/Icon';
import { HugeiconsIcon } from '@hugeicons/react';

export default function DesignStudio() {
  const [searchParams] = useSearchParams();
  const designIdParam = searchParams.get('id');

  const { isAuthenticated } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Save state
  const [designId, setDesignId] = useState<string | null>(designIdParam);
  const [designTitle, setDesignTitle] = useState('Untitled Design');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Initialize the simulation hook
  const simulation = useSimulation(nodes, edges, setNodes);

  // Onboarding tour state
  const [isTourActive, setIsTourActive] = useState(false);

  // Auto-launch tour for first-time visitors
  useEffect(() => {
    const tourCompleted = localStorage.getItem('archlab-tour-completed');
    if (!tourCompleted) {
      // Small delay so the UI renders first and elements are in the DOM
      const timer = setTimeout(() => setIsTourActive(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Load existing design if ?id= is present
  useEffect(() => {
    if (designIdParam) {
      getDesign(designIdParam)
        .then((design) => {
          setDesignId(design.id);
          setDesignTitle(design.title);
          setNodes(design.nodes as Node[]);
          setEdges(design.edges as Edge[]);
        })
        .catch(() => {
          // Design not found — start fresh
        });
    }
  }, [designIdParam]);

  // Clear save message after 3 seconds
  const flashSaveMessage = (msg: string) => {
    setSaveMessage(msg);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaveMessage(null), 3000);
  };

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

  /** Save the current design to the backend */
  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      // Redirect to auth if not logged in
      window.location.href = '/auth';
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: designTitle,
        nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
        edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, animated: e.animated, type: e.type })),
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      if (designId) {
        // Update existing design
        await updateDesign(designId, payload);
        flashSaveMessage('Design saved successfully!');
      } else {
        // Create new design
        const created = await createDesign(payload);
        setDesignId(created.id);
        // Update URL without navigation
        window.history.replaceState(null, '', `/?id=${created.id}`);
        flashSaveMessage('Design created successfully!');
      }
    } catch {
      flashSaveMessage('Save failed — are you logged in?');
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, designId, designTitle, nodes, edges]);

  /** Analyze the current design with the AI engine */
  const handleAnalyze = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Please add some components to your design before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const feedback = await analyzeDesign(
        nodes.map((n) => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
        edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
        designId || undefined
      );
      setAiFeedback(feedback);
      setShowFeedback(true);
    } catch {
      // If backend is down, use a local fallback
      alert('AI analysis is not available right now. Please make sure the backend server is running.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [nodes, edges, designId]);

  return (
    <div className="app-container">
      <Header
        designTitle={designTitle}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSave={handleSave}
        onAnalyze={handleAnalyze}
        simState={simulation.simState}
        onSimToggle={handleSimToggle}
        onStartTour={() => setIsTourActive(true)}
      />

      {/* Save/Analyze status toast */}
      {(saveMessage || isSaving || isAnalyzing) && (
        <div style={{
          position: 'fixed', top: 'calc(var(--header-height) + 12px)', left: '50%',
          transform: 'translateX(-50%)', zIndex: 500,
          padding: '8px 20px', borderRadius: '24px',
          background: 'rgba(13,13,20,0.9)', border: '1px solid var(--color-border)',
          backdropFilter: 'blur(12px)',
          fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)',
          animation: 'slideInUp 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          {isSaving && <span className="auth-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
          {isAnalyzing && <HugeiconsIcon icon={SparklesIcon} size={14} className="animate-pulse" />}
          {!isSaving && !isAnalyzing && (
            saveMessage?.includes('failed') ? (
              <HugeiconsIcon icon={AlertCircleIcon} size={14} primaryColor="var(--color-danger)" />
            ) : (
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} primaryColor="var(--color-success)" />
            )
          )}
          {isSaving ? 'Saving...' : isAnalyzing ? 'Analyzing design...' : saveMessage}
        </div>
      )}

      <main className="app-main">
        {isSidebarOpen && <ComponentPalette />}

        <div className="app-canvas-area" data-tour="design-canvas">
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

      {/* AI Feedback Modal */}
      {showFeedback && aiFeedback && (
        <AIFeedbackModal
          feedback={aiFeedback}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {/* Onboarding Guided Tour */}
      <OnboardingTour
        isActive={isTourActive}
        onEnd={() => setIsTourActive(false)}
      />
    </div>
  );
}
