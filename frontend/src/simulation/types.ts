/**
 * Simulation Types — Phase 2 Type Definitions
 * ==============================================
 * All TypeScript interfaces used by the simulation engine,
 * the useSimulation hook, and the UI components.
 */

/** The three possible states of the simulation */
export type SimulationState = 'idle' | 'running' | 'paused';

/** Configuration for a simulation run */
export interface SimulationConfig {
  /** Requests per second entering the system from source nodes */
  rps: number;
  /** How often the engine recalculates (in ms) */
  tickIntervalMs: number;
  /** Simulation speed multiplier (1x, 2x, 5x) */
  speedMultiplier: number;
}

/** Default simulation config */
export const DEFAULT_SIM_CONFIG: SimulationConfig = {
  rps: 1000,
  tickIntervalMs: 200,
  speedMultiplier: 1,
};

/** Runtime metrics calculated per-node during simulation */
export interface NodeSimMetrics {
  /** Requests arriving at this node per second */
  throughputIn: number;
  /** Requests leaving this node per second */
  throughputOut: number;
  /** Average response latency in milliseconds */
  latency: number;
  /** Percentage of requests that errored (0-100) */
  errorRate: number;
  /** How loaded this node is as a percentage (0-100) */
  saturation: number;
  /** Current queue depth (for async components) */
  queueDepth: number;
}

/** The result for a single node from one simulation tick */
export interface NodeTickResult {
  metrics: NodeSimMetrics;
  status: 'healthy' | 'warning' | 'critical' | 'down';
}

/** The full result from one simulation tick */
export type SimulationTickResult = Map<string, NodeTickResult>;

/** Traffic flowing through a specific edge */
export interface EdgeTraffic {
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Requests per second flowing through this edge */
  rps: number;
}

/** Aggregated system-wide metrics shown in the control panel */
export interface SystemMetrics {
  totalThroughput: number;
  averageLatency: number;
  overallErrorRate: number;
  healthyNodes: number;
  warningNodes: number;
  criticalNodes: number;
  downNodes: number;
}
