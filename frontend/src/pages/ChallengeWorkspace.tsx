/**
 * ChallengeWorkspace — The Challenge Mode Canvas Page
 * =====================================================
 * Like DesignStudio, but with a ChallengePanel sidebar showing:
 *   - Challenge title, description, time limit (with countdown)
 *   - Functional & non-functional requirement checklists
 *   - Progressive hints
 *   - Submit button → triggers AI scoring → shows ChallengeResultModal
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import ComponentPalette from '../components/Sidebar/ComponentPalette';
import DesignCanvas from '../components/Canvas/DesignCanvas';
import PropertiesPanel from '../components/Sidebar/PropertiesPanel';
import ChallengePanel from '../components/Sidebar/ChallengePanel';
import ChallengeResultModal from '../components/Modals/ChallengeResultModal';
import SimulationPanel from '../components/Simulation/SimulationPanel';
import type { Node, Edge } from '@xyflow/react';
import type { ArchNodeData, Challenge, AIFeedback } from '../types';
import { useSimulation } from '../hooks/useSimulation';
import { analyzeDesign } from '../services/api';

// ===== Same mock data used in the dashboard =====
const MOCK_CHALLENGES: Record<string, Challenge> = {
  'url-shortener': {
    id: '1', title: 'Design a URL Shortener', slug: 'url-shortener',
    description: 'Build a service like bit.ly that takes long URLs and creates short, unique aliases.',
    difficulty: 'easy',
    functional_requirements: ['Users can create short URLs from long URLs', 'Short URLs redirect to the original URL', 'Users can optionally set custom aliases', 'URLs have an expiration time (default 5 years)'],
    non_functional_requirements: ['Handle 500M new URLs per month', '100:1 read-to-write ratio', 'URL redirection latency < 100ms', '99.9% availability'],
    hints: ['Think about how to generate unique short keys — what hashing approach works?', 'With a 100:1 read ratio, caching will be critical.', 'How do you handle hash collisions?'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'], time_limit_minutes: 30, is_free: true,
  },
  'paste-bin': {
    id: '2', title: 'Design a Paste Bin', slug: 'paste-bin',
    description: 'Design a web service where users can store and share plain text.',
    difficulty: 'easy',
    functional_requirements: ['Users can paste text and get a unique URL', 'Content can be public or private', 'Support syntax highlighting', 'Paste expiration support'],
    non_functional_requirements: ['Handle 1M new pastes per day', '5:1 read-to-write ratio', 'Low latency reads (< 200ms)', '99.9% availability'],
    hints: ['Similar to URL Shortener but with larger payloads.', 'Object storage for blobs.', 'CDN for frequently accessed pastes.'],
    companies: ['Amazon', 'Dropbox'], time_limit_minutes: 30, is_free: true,
  },
  'instagram': {
    id: '3', title: 'Design Instagram', slug: 'instagram',
    description: 'Design a photo-sharing social network.',
    difficulty: 'medium',
    functional_requirements: ['Users can upload and share photos', 'Users can follow/unfollow other users', 'Generate a news feed', 'Search photos by hashtags/location'],
    non_functional_requirements: ['Handle 500M daily active users', '2M new photos per day', 'News feed latency < 500ms', '99.99% availability'],
    hints: ['Separate read and write paths.', 'Pre-generate news feeds — push vs pull.', 'Object storage + CDN for photos.'],
    companies: ['Meta', 'Google', 'Twitter', 'Pinterest'], time_limit_minutes: 45, is_free: true,
  },
  'twitter': {
    id: '4', title: 'Design Twitter', slug: 'twitter',
    description: 'Design a social media platform for short messages.',
    difficulty: 'hard',
    functional_requirements: ['Users can post tweets', 'Follow/unfollow users', 'Home timeline', 'Search and trending topics'],
    non_functional_requirements: ['300M monthly active users', '600 tweets/second', 'Timeline latency < 300ms', 'Handle celebrity fan-out'],
    hints: ['Fan-out problem is the biggest challenge.', 'Hybrid fan-out approach.', 'Message queues for async processing.'],
    companies: ['Twitter', 'Meta', 'Google', 'Uber'], time_limit_minutes: 45, is_free: true,
  },
  'distributed-cache': {
    id: '5', title: 'Design a Distributed Cache', slug: 'distributed-cache',
    description: 'Design a distributed caching system like Memcached or Redis Cluster.',
    difficulty: 'expert',
    functional_requirements: ['GET/SET/DELETE with O(1) time', 'TTL support', 'Distribute across nodes', 'Handle rebalancing'],
    non_functional_requirements: ['Sub-millisecond latency', '1M+ ops/second', 'Minimal data movement', '99.99% availability'],
    hints: ['Consistent hashing is key.', 'LRU vs LFU eviction.', 'Heartbeats and replicas for failures.'],
    companies: ['Amazon', 'Google', 'Netflix', 'Meta'], time_limit_minutes: 60, is_free: false,
  },
};

export default function ChallengeWorkspace() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Timer
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AIFeedback | null>(null);
  const [showResult, setShowResult] = useState(false);

  const simulation = useSimulation(nodes, edges, setNodes);

  // Load challenge data
  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/challenges/${slug}/`);
        if (res.ok) {
          setChallenge(await res.json());
        } else {
          setChallenge(MOCK_CHALLENGES[slug] || null);
        }
      } catch {
        setChallenge(MOCK_CHALLENGES[slug] || null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  // Start timer when challenge loads
  useEffect(() => {
    if (challenge && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [challenge]);

  const handleUpdateNodeData = useCallback((nodeId: string, newData: Partial<ArchNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  }, []);

  /** Submit the design for AI scoring */
  const handleSubmit = useCallback(async () => {
    if (nodes.length === 0) {
      alert('Please add some components to your design before submitting.');
      return;
    }

    setIsSubmitting(true);

    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      // Try backend first, fall back to local analysis
      const feedback = await analyzeDesign(
        nodes.map((n) => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
        edges.map((e) => ({ id: e.id, source: e.source, target: e.target }))
      );
      setResult(feedback);
    } catch {
      // Backend not running — run a simple local analysis
      const localResult = runLocalAnalysis(nodes, edges);
      setResult(localResult);
    }

    setShowResult(true);
    setIsSubmitting(false);
  }, [nodes, edges]);

  const handleSimToggle = useCallback(() => {
    if (simulation.simState === 'idle') simulation.start();
    else simulation.stop();
  }, [simulation]);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading challenge...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Challenge not found.</p>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/challenges')}>Back to Challenges</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        designTitle={challenge.title}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSave={() => alert('Save functionality coming soon!')}
        onAnalyze={handleSubmit}
        simState={simulation.simState}
        onSimToggle={handleSimToggle}
      />

      <main className="app-main">
        {/* Challenge Panel (replaces ComponentPalette in challenge mode) */}
        <ChallengePanel
          challenge={challenge}
          timeElapsed={timeElapsed}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onBack={() => navigate('/challenges')}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Component Palette (collapsible, secondary) */}
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
            designId={challenge.id} // Ensure design ID is passed for websocket
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

      {/* Result Modal */}
      {showResult && result && (
        <ChallengeResultModal
          challenge={challenge}
          feedback={result}
          timeElapsed={timeElapsed}
          onClose={() => setShowResult(false)}
          onRetry={() => {
            setShowResult(false);
            setResult(null);
            setTimeElapsed(0);
            timerRef.current = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
          }}
          onBackToDashboard={() => navigate('/challenges')}
        />
      )}
    </div>
  );
}

// ===== Local (offline) analysis fallback =====

function runLocalAnalysis(nodes: Node[], edges: Edge[]): AIFeedback {
  const componentTypes = nodes.map((n) => (n.data as ArchNodeData)?.componentType || 'unknown');
  const typeCounts: Record<string, number> = {};
  for (const ct of componentTypes) {
    typeCounts[ct] = (typeCounts[ct] || 0) + 1;
  }

  const issues: AIFeedback['issues'] = [];
  const positives: AIFeedback['positives'] = [];
  const categories = { scalability: 5, reliability: 5, performance: 5, cost: 7, security: 5, maintainability: 5 };

  if (!typeCounts['database_sql'] && !typeCounts['database_nosql']) {
    issues.push({ severity: 'critical', title: 'No Database', description: 'No data storage found.', suggestion: 'Add a SQL or NoSQL database.' });
    categories.reliability -= 3;
  }

  if ((typeCounts['web_server'] || 0) + (typeCounts['microservice'] || 0) > 1 && !typeCounts['load_balancer']) {
    issues.push({ severity: 'warning', title: 'No Load Balancer', description: 'Multiple servers without load balancing.', suggestion: 'Add a Load Balancer.' });
    categories.scalability -= 2;
  } else if (typeCounts['load_balancer']) {
    positives.push({ title: 'Load Balancer', description: 'Traffic is distributed for horizontal scaling.' });
    categories.scalability += 2;
  }

  if (!typeCounts['cache'] && (typeCounts['database_sql'] || typeCounts['database_nosql'])) {
    issues.push({ severity: 'warning', title: 'Missing Cache', description: 'No caching layer detected.', suggestion: 'Add Redis/Memcached.' });
    categories.performance -= 2;
  } else if (typeCounts['cache']) {
    positives.push({ title: 'Caching Layer', description: 'Reduces DB load and improves response times.' });
    categories.performance += 2;
  }

  if (!typeCounts['monitoring']) {
    issues.push({ severity: 'info', title: 'No Monitoring', description: 'No observability.', suggestion: 'Add monitoring.' });
    categories.maintainability -= 1;
  }

  if (!typeCounts['auth_service'] && !typeCounts['api_gateway']) {
    issues.push({ severity: 'warning', title: 'No Auth', description: 'Endpoints may be unprotected.', suggestion: 'Add Auth Service or API Gateway.' });
    categories.security -= 2;
  }

  for (const k of Object.keys(categories) as (keyof typeof categories)[]) {
    categories[k] = Math.max(0, Math.min(10, categories[k]));
  }

  const weights = { scalability: 0.2, reliability: 0.25, performance: 0.2, cost: 0.1, security: 0.15, maintainability: 0.1 };
  let score = Math.round(Object.keys(categories).reduce((s, k) => s + categories[k as keyof typeof categories] * weights[k as keyof typeof weights] * 10, 0));
  if (nodes.length >= 8) score = Math.min(100, score + 5);
  if (edges.length >= 10) score = Math.min(100, score + 5);

  return {
    score: Math.min(100, Math.max(0, score)),
    issues: issues.sort((a, b) => ({ critical: 0, warning: 1, info: 2 }[a.severity] || 3) - ({ critical: 0, warning: 1, info: 2 }[b.severity] || 3)),
    positives,
    categories,
    component_count: nodes.length,
    connection_count: edges.length,
  };
}
