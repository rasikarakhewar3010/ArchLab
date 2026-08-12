/**
 * useSimulation — Custom React Hook for the Simulation Engine
 * ==============================================================
 * Encapsulates the SimulationEngine lifecycle and wires it to React state.
 * Provides: start, pause, resume, stop controls + live metrics.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { SimulationEngine } from '../simulation/simulationEngine';
import type { SimulationState, SimulationConfig, EdgeTraffic, SystemMetrics, SimulationTickResult } from '../simulation/types';
import { DEFAULT_SIM_CONFIG } from '../simulation/types';

interface UseSimulationReturn {
  /** Current simulation state */
  simState: SimulationState;
  /** Current RPS setting */
  rps: number;
  /** Current speed multiplier */
  speedMultiplier: number;
  /** Live system-wide metrics */
  systemMetrics: SystemMetrics;
  /** Live edge traffic data */
  edgeTraffic: EdgeTraffic[];
  /** Whether simulation is active (running or paused) */
  isActive: boolean;
  /** Set RPS */
  setRps: (rps: number) => void;
  /** Set speed multiplier */
  setSpeedMultiplier: (speed: number) => void;
  /** Start the simulation */
  start: () => void;
  /** Pause the simulation */
  pause: () => void;
  /** Resume the simulation */
  resume: () => void;
  /** Stop the simulation and reset all metrics */
  stop: () => void;
}

const EMPTY_SYSTEM_METRICS: SystemMetrics = {
  totalThroughput: 0,
  averageLatency: 0,
  overallErrorRate: 0,
  healthyNodes: 0,
  warningNodes: 0,
  criticalNodes: 0,
  downNodes: 0,
};

export function useSimulation(
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
): UseSimulationReturn {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [simState, setSimState] = useState<SimulationState>('idle');
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_SIM_CONFIG);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(EMPTY_SYSTEM_METRICS);
  const [edgeTraffic, setEdgeTraffic] = useState<EdgeTraffic[]>([]);

  // Keep refs for the latest nodes/edges so the tick callback always has fresh data
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  /** The tick callback — updates React state with simulation results */
  const handleTick = useCallback(
    (result: SimulationTickResult, traffic: EdgeTraffic[], metrics: SystemMetrics) => {
      setSystemMetrics(metrics);
      setEdgeTraffic(traffic);

      // Update node data with new metrics and status
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          const tickData = result.get(node.id);
          if (!tickData) return node;

          return {
            ...node,
            data: {
              ...node.data,
              status: tickData.status,
              metrics: {
                latency: tickData.metrics.latency,
                throughput: tickData.metrics.throughputIn,
                errorRate: tickData.metrics.errorRate,
                saturation: tickData.metrics.saturation,
              },
            },
          };
        })
      );
    },
    [setNodes]
  );

  /** Create the engine instance (lazily) */
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new SimulationEngine(config, handleTick);
    }
    return engineRef.current;
  }, [config, handleTick]);

  /** Start simulation */
  const start = useCallback(() => {
    const engine = getEngine();
    engine.updateConfig(config);
    engine.start(nodesRef.current, edgesRef.current);
    setSimState('running');
  }, [getEngine, config]);

  /** Pause simulation */
  const pause = useCallback(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.stop(); // Stop the interval but keep state
    }
    setSimState('paused');
  }, []);

  /** Resume simulation */
  const resume = useCallback(() => {
    const engine = getEngine();
    engine.updateConfig(config);
    engine.start(nodesRef.current, edgesRef.current);
    setSimState('running');
  }, [getEngine, config]);

  /** Stop simulation and reset all metrics */
  const stop = useCallback(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.stop();
    }
    setSimState('idle');
    setSystemMetrics(EMPTY_SYSTEM_METRICS);
    setEdgeTraffic([]);

    // Reset node metrics and status
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: undefined,
          metrics: undefined,
        },
      }))
    );
  }, [setNodes]);

  /** Update RPS */
  const setRps = useCallback(
    (rps: number) => {
      setConfig((prev) => ({ ...prev, rps }));
      if (engineRef.current) {
        engineRef.current.updateConfig({ rps });
      }
    },
    []
  );

  /** Update speed multiplier */
  const setSpeedMultiplier = useCallback(
    (speedMultiplier: number) => {
      setConfig((prev) => ({ ...prev, speedMultiplier }));
      // Need to restart the interval with new speed
      if (simState === 'running' && engineRef.current) {
        engineRef.current.stop();
        engineRef.current.updateConfig({ speedMultiplier });
        engineRef.current.start(nodesRef.current, edgesRef.current);
      }
    },
    [simState]
  );

  // Keep the engine's graph in sync when nodes/edges change during simulation
  useEffect(() => {
    if (simState === 'running' && engineRef.current) {
      engineRef.current.updateGraph(nodesRef.current, edgesRef.current);
    }
  }, [nodes, edges, simState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, []);

  return {
    simState,
    rps: config.rps,
    speedMultiplier: config.speedMultiplier,
    systemMetrics,
    edgeTraffic,
    isActive: simState !== 'idle',
    setRps,
    setSpeedMultiplier,
    start,
    pause,
    resume,
    stop,
  };
}
