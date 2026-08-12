/**
 * Component Behaviors — How Each Architecture Component Behaves Under Load
 * ==========================================================================
 * This defines the "personality" of each component type during simulation.
 * Each entry describes:
 *   - baseLatencyMs: The minimum latency this component adds
 *   - maxCapacityRps: Maximum requests per second before saturation hits 100%
 *   - isSource: Whether this component generates traffic (e.g., Client)
 *   - isSink: Whether this component absorbs traffic without forwarding
 *   - trafficMultiplier: How traffic is modified (e.g., cache reduces downstream)
 *   - errorThreshold: Saturation % at which errors start occurring
 */

import type { ComponentType } from '../types';

export interface ComponentBehavior {
  /** Minimum latency added by this component (in ms) */
  baseLatencyMs: number;
  /** Maximum requests per second this component can handle */
  maxCapacityRps: number;
  /** If true, this component generates traffic (source node) */
  isSource: boolean;
  /** If true, this component absorbs traffic and does not forward it */
  isSink: boolean;
  /**
   * What fraction of incoming traffic is forwarded downstream.
   * 1.0 = forwards everything (default)
   * 0.05 = cache hit rate of 95%, only 5% goes downstream
   */
  trafficPassthroughRate: number;
  /** Saturation % at which errors start being generated (0-100) */
  errorThresholdPercent: number;
  /** Per-instance capacity multiplier (scales with config.instances) */
  scalable: boolean;
}

/**
 * Behavior definitions for every ComponentType.
 * These are carefully tuned to produce realistic simulation results.
 */
export const COMPONENT_BEHAVIORS: Record<ComponentType, ComponentBehavior> = {
  // --- Frontend ---
  client: {
    baseLatencyMs: 0,
    maxCapacityRps: Infinity,
    isSource: true,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 100,
    scalable: false,
  },

  // --- Networking ---
  dns: {
    baseLatencyMs: 2,
    maxCapacityRps: 500000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 90,
    scalable: false,
  },
  cdn: {
    baseLatencyMs: 5,
    maxCapacityRps: 200000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 0.15, // 85% cache hit rate
    errorThresholdPercent: 95,
    scalable: false,
  },
  load_balancer: {
    baseLatencyMs: 1,
    maxCapacityRps: 100000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 85,
    scalable: false,
  },
  api_gateway: {
    baseLatencyMs: 5,
    maxCapacityRps: 50000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 80,
    scalable: false,
  },

  // --- Compute ---
  web_server: {
    baseLatencyMs: 20,
    maxCapacityRps: 10000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 75,
    scalable: true,
  },
  microservice: {
    baseLatencyMs: 15,
    maxCapacityRps: 8000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 75,
    scalable: true,
  },
  worker: {
    baseLatencyMs: 50,
    maxCapacityRps: 5000,
    isSource: false,
    isSink: true,
    trafficPassthroughRate: 0,
    errorThresholdPercent: 90,
    scalable: true,
  },

  // --- Storage ---
  database_sql: {
    baseLatencyMs: 50,
    maxCapacityRps: 5000,
    isSource: false,
    isSink: true,
    trafficPassthroughRate: 0,
    errorThresholdPercent: 70,
    scalable: false,
  },
  database_nosql: {
    baseLatencyMs: 10,
    maxCapacityRps: 25000,
    isSource: false,
    isSink: true,
    trafficPassthroughRate: 0,
    errorThresholdPercent: 80,
    scalable: false,
  },
  cache: {
    baseLatencyMs: 1,
    maxCapacityRps: 100000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 0.05, // 95% hit rate → only 5% passes through
    errorThresholdPercent: 95,
    scalable: false,
  },
  object_storage: {
    baseLatencyMs: 30,
    maxCapacityRps: 10000,
    isSource: false,
    isSink: true,
    trafficPassthroughRate: 0,
    errorThresholdPercent: 85,
    scalable: false,
  },
  search: {
    baseLatencyMs: 25,
    maxCapacityRps: 8000,
    isSource: false,
    isSink: true,
    trafficPassthroughRate: 0,
    errorThresholdPercent: 75,
    scalable: false,
  },

  // --- Async ---
  message_queue: {
    baseLatencyMs: 3,
    maxCapacityRps: 80000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 90,
    scalable: false,
  },
  notification: {
    baseLatencyMs: 10,
    maxCapacityRps: 20000,
    isSource: false,
    isSink: true,
    trafficPassthroughRate: 0,
    errorThresholdPercent: 85,
    scalable: false,
  },

  // --- Security ---
  auth_service: {
    baseLatencyMs: 15,
    maxCapacityRps: 15000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 80,
    scalable: true,
  },
  rate_limiter: {
    baseLatencyMs: 1,
    maxCapacityRps: 200000,
    isSource: false,
    isSink: false,
    trafficPassthroughRate: 1.0,
    errorThresholdPercent: 95,
    scalable: false,
  },

  // --- Operations ---
  monitoring: {
    baseLatencyMs: 0,
    maxCapacityRps: Infinity,
    isSource: false,
    isSink: true,
    trafficPassthroughRate: 0,
    errorThresholdPercent: 100,
    scalable: false,
  },
};
