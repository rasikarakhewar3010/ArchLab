/**
 * ArchLab — Component Type Definitions
 * ======================================
 * These TypeScript types define the shape of all data in our app.
 * 
 * WHY TYPESCRIPT?
 * - Catches errors at compile time (before the user sees them)
 * - Auto-complete in your editor (huge productivity boost)
 * - Self-documenting code (types explain what data looks like)
 * - Required for working with React Flow's type system
 */

// ===== Component Types (the building blocks on the canvas) =====

/** All possible architecture component types */
export type ComponentCategory = 
  | 'compute'      // API servers, microservices, workers
  | 'storage'      // Databases, caches, object storage
  | 'networking'   // Load balancers, CDN, DNS, API gateway
  | 'security'     // Auth, rate limiter
  | 'async'        // Message queues, workers
  | 'frontend'     // Clients, browsers
  | 'operations';  // Monitoring, logging

export type ComponentType =
  | 'load_balancer'
  | 'api_gateway'
  | 'web_server'
  | 'microservice'
  | 'database_sql'
  | 'database_nosql'
  | 'cache'
  | 'message_queue'
  | 'cdn'
  | 'client'
  | 'auth_service'
  | 'object_storage'
  | 'monitoring'
  | 'rate_limiter'
  | 'worker'
  | 'notification'
  | 'search'
  | 'dns';

/** Definition of a component that appears in the palette */
export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  description: string;
  category: ComponentCategory;
  icon: string;  // Lucide icon name
  color: string; // CSS variable name
  defaultConfig: Record<string, unknown>;
}

/** Data stored inside a React Flow node */
export interface ArchNodeData {
  [key: string]: unknown;
  label: string;
  componentType: ComponentType;
  category: ComponentCategory;
  description: string;
  icon: string;
  color: string;
  config: Record<string, unknown>;
  // Simulation state (Phase 2)
  status?: 'healthy' | 'warning' | 'critical' | 'down';
  metrics?: {
    latency?: number;
    throughput?: number;
    errorRate?: number;
    saturation?: number;
  };
}


// ===== Design Types =====

export interface Design {
  id: string;
  title: string;
  description: string;
  author: string;
  author_username: string;
  author_avatar: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  viewport: Viewport;
  thumbnail: string;
  is_public: boolean;
  tags: string[];
  ai_score: number | null;
  ai_feedback: AIFeedback | null;
  stars_count: number;
  forks_count: number;
  is_starred: boolean;
  forked_from: string | null;
  created_at: string;
  updated_at: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}


// ===== React Flow Types =====
// These extend React Flow's built-in types with our custom data

import type { Node, Edge } from '@xyflow/react';

export type ArchNode = Node<ArchNodeData>;
export type ArchEdge = Edge;


// ===== AI Feedback Types =====

export interface AIFeedback {
  score: number;
  issues: AIIssue[];
  positives: AIPositive[];
  categories: {
    scalability: number;
    reliability: number;
    performance: number;
    cost: number;
    security: number;
    maintainability: number;
  };
  component_count: number;
  connection_count: number;
}

export interface AIIssue {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion: string;
}

export interface AIPositive {
  title: string;
  description: string;
}


// ===== Challenge Types =====

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  functional_requirements: string[];
  non_functional_requirements: string[];
  hints: string[];
  companies: string[];
  time_limit_minutes: number;
  is_free: boolean;
}

export interface ChallengeAttempt {
  id: string;
  challenge: string;
  challenge_title: string;
  design: string | null;
  score: number | null;
  feedback: AIFeedback | null;
  time_taken_seconds: number | null;
  status: 'in_progress' | 'submitted' | 'scored';
  started_at: string;
  submitted_at: string | null;
}


// ===== User Types =====

export interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  github_username: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  design_count: number;
  challenge_score: number;
  streak_days: number;
  date_joined: string;
  last_active: string;
}
