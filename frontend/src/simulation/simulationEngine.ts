/**
 * Simulation Engine — The Core Traffic Simulation Logic
 * =======================================================
 * This class runs the simulation loop. On each tick it:
 *   1. Finds source nodes (clients) and injects traffic at the configured RPS
 *   2. Traverses the graph following edges, propagating traffic downstream
 *   3. Applies each component's behavior (latency, capacity, passthrough rate)
 *   4. Calculates per-node metrics (saturation, latency, error rate)
 *   5. Determines node status (healthy → warning → critical → down)
 *   6. Fires a callback with the results so React can update the UI
 */

import type { Node, Edge } from '@xyflow/react';
import type { ArchNodeData, ComponentType } from '../types';
import type {
  SimulationConfig,
  NodeSimMetrics,
  NodeTickResult,
  SimulationTickResult,
  EdgeTraffic,
  SystemMetrics,
} from './types';
import { COMPONENT_BEHAVIORS } from './componentBehaviors';

/** Callback invoked after every simulation tick with updated node data */
export type OnTickCallback = (
  result: SimulationTickResult,
  edgeTraffic: EdgeTraffic[],
  systemMetrics: SystemMetrics
) => void;

export class SimulationEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private config: SimulationConfig;
  private onTick: OnTickCallback;

  /** Adjacency list: nodeId → list of downstream nodeIds */
  private adjacency: Map<string, string[]> = new Map();
  /** Reverse adjacency: nodeId → list of upstream nodeIds */
  private reverseAdjacency: Map<string, string[]> = new Map();
  /** Map of nodeId → ArchNodeData for quick lookup */
  private nodeDataMap: Map<string, ArchNodeData> = new Map();

  constructor(config: SimulationConfig, onTick: OnTickCallback) {
    this.config = config;
    this.onTick = onTick;
  }

  /** Update the graph topology (call when nodes/edges change while running) */
  updateGraph(nodes: Node[], edges: Edge[]): void {
    this.nodes = nodes;
    this.edges = edges;
    this.buildAdjacencyLists();
  }

  /** Update simulation configuration (RPS, speed, etc.) */
  updateConfig(config: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** Start the simulation loop */
  start(nodes: Node[], edges: Edge[]): void {
    this.updateGraph(nodes, edges);
    this.stop(); // Clear any previous interval

    const effectiveInterval = this.config.tickIntervalMs / this.config.speedMultiplier;

    this.intervalId = setInterval(() => {
      this.tick();
    }, effectiveInterval);
  }

  /** Stop the simulation loop */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Build adjacency lists from the current edges */
  private buildAdjacencyLists(): void {
    this.adjacency.clear();
    this.reverseAdjacency.clear();
    this.nodeDataMap.clear();

    // Initialize all nodes in the maps
    for (const node of this.nodes) {
      this.adjacency.set(node.id, []);
      this.reverseAdjacency.set(node.id, []);
      this.nodeDataMap.set(node.id, node.data as unknown as ArchNodeData);
    }

    // Populate adjacency from edges
    for (const edge of this.edges) {
      const downstream = this.adjacency.get(edge.source);
      if (downstream) {
        downstream.push(edge.target);
      }
      const upstream = this.reverseAdjacency.get(edge.target);
      if (upstream) {
        upstream.push(edge.source);
      }
    }
  }

  /** Execute a single simulation tick */
  private tick(): void {
    // Re-read node data in case it changed
    for (const node of this.nodes) {
      this.nodeDataMap.set(node.id, node.data as unknown as ArchNodeData);
    }

    // Map: nodeId → incoming RPS
    const incomingTraffic = new Map<string, number>();
    const edgeTrafficList: EdgeTraffic[] = [];

    // Initialize all nodes with zero incoming traffic
    for (const node of this.nodes) {
      incomingTraffic.set(node.id, 0);
    }

    // Step 1: Find source nodes and inject traffic
    const sourceNodes = this.nodes.filter((node) => {
      const data = this.nodeDataMap.get(node.id);
      if (!data) return false;
      const behavior = COMPONENT_BEHAVIORS[data.componentType as ComponentType];
      return behavior?.isSource;
    });

    // Distribute total RPS across all source nodes
    const rpsPerSource = sourceNodes.length > 0
      ? this.config.rps / sourceNodes.length
      : 0;

    for (const source of sourceNodes) {
      incomingTraffic.set(source.id, rpsPerSource);
    }

    // Step 2: Topological traversal — propagate traffic through the graph
    // Use BFS from source nodes
    const visited = new Set<string>();
    const queue = sourceNodes.map((n) => n.id);

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const data = this.nodeDataMap.get(nodeId);
      if (!data) continue;

      const behavior = COMPONENT_BEHAVIORS[data.componentType as ComponentType];
      if (!behavior) continue;

      const incoming = incomingTraffic.get(nodeId) || 0;

      // Calculate effective capacity (accounting for scaling)
      let effectiveCapacity = behavior.maxCapacityRps;
      if (behavior.scalable && data.config) {
        const instances = Number(data.config.instances) || 1;
        const concurrency = Number(data.config.concurrency) || 1;
        effectiveCapacity *= Math.max(instances, concurrency);
      }

      // Calculate how much traffic passes through to downstream nodes
      const outgoingRps = incoming * behavior.trafficPassthroughRate;

      // Distribute outgoing traffic to downstream nodes
      const downstream = this.adjacency.get(nodeId) || [];
      const downstreamCount = downstream.length;

      if (downstreamCount > 0 && outgoingRps > 0) {
        const rpsPerChild = outgoingRps / downstreamCount;
        for (const childId of downstream) {
          const currentTraffic = incomingTraffic.get(childId) || 0;
          incomingTraffic.set(childId, currentTraffic + rpsPerChild);

          edgeTrafficList.push({
            source: nodeId,
            target: childId,
            rps: rpsPerChild,
          });

          // Add to BFS queue
          if (!visited.has(childId)) {
            queue.push(childId);
          }
        }
      }
    }

    // Step 3: Calculate per-node metrics and status
    const tickResult: SimulationTickResult = new Map();

    let totalThroughput = 0;
    let totalLatency = 0;
    let totalErrorRate = 0;
    let nodeCount = 0;
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let downCount = 0;

    for (const node of this.nodes) {
      const data = this.nodeDataMap.get(node.id);
      if (!data) continue;

      const behavior = COMPONENT_BEHAVIORS[data.componentType as ComponentType];
      if (!behavior) continue;

      const incoming = incomingTraffic.get(node.id) || 0;

      // Calculate effective capacity
      let effectiveCapacity = behavior.maxCapacityRps;
      if (behavior.scalable && data.config) {
        const instances = Number(data.config.instances) || 1;
        const concurrency = Number(data.config.concurrency) || 1;
        effectiveCapacity *= Math.max(instances, concurrency);
      }

      // Saturation: how loaded is this node (0-100)
      const saturation = effectiveCapacity === Infinity
        ? Math.min(incoming / 100000 * 5, 15) // Source/monitoring nodes show minimal load
        : Math.min((incoming / effectiveCapacity) * 100, 100);

      // Latency increases under load (exponential curve near capacity)
      const loadFactor = saturation / 100;
      const latencyMultiplier = 1 + Math.pow(loadFactor, 3) * 10;
      const latency = Math.round(behavior.baseLatencyMs * latencyMultiplier * 10) / 10;

      // Error rate: starts at 0, climbs past the error threshold
      let errorRate = 0;
      if (saturation > behavior.errorThresholdPercent) {
        const overload = saturation - behavior.errorThresholdPercent;
        const range = 100 - behavior.errorThresholdPercent;
        errorRate = Math.min((overload / range) * 80, 80); // Max 80% errors
      }

      // Throughput out
      const outgoingRps = incoming * behavior.trafficPassthroughRate;

      // Add some jitter for realism (±5%)
      const jitter = 0.95 + Math.random() * 0.1;

      const metrics: NodeSimMetrics = {
        throughputIn: Math.round(incoming * jitter),
        throughputOut: Math.round(outgoingRps * jitter),
        latency: Math.round(latency * jitter * 10) / 10,
        errorRate: Math.round(errorRate * jitter * 10) / 10,
        saturation: Math.round(saturation * 10) / 10,
        queueDepth: behavior.trafficPassthroughRate < 1
          ? Math.round(incoming * (1 - behavior.trafficPassthroughRate) * 0.001)
          : 0,
      };

      // Determine node status based on saturation
      let status: NodeTickResult['status'];
      if (saturation < 50) {
        status = 'healthy';
      } else if (saturation < 75) {
        status = 'warning';
      } else if (saturation < 95) {
        status = 'critical';
      } else {
        status = 'down';
      }

      tickResult.set(node.id, { metrics, status });

      // Aggregate system metrics
      totalThroughput += metrics.throughputIn;
      totalLatency += metrics.latency;
      totalErrorRate += metrics.errorRate;
      nodeCount++;

      switch (status) {
        case 'healthy': healthyCount++; break;
        case 'warning': warningCount++; break;
        case 'critical': criticalCount++; break;
        case 'down': downCount++; break;
      }
    }

    const systemMetrics: SystemMetrics = {
      totalThroughput: Math.round(totalThroughput),
      averageLatency: nodeCount > 0 ? Math.round(totalLatency / nodeCount * 10) / 10 : 0,
      overallErrorRate: nodeCount > 0 ? Math.round(totalErrorRate / nodeCount * 10) / 10 : 0,
      healthyNodes: healthyCount,
      warningNodes: warningCount,
      criticalNodes: criticalCount,
      downNodes: downCount,
    };

    // Fire the callback so React can update
    this.onTick(tickResult, edgeTrafficList, systemMetrics);
  }
}
