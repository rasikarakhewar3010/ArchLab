/**
 * Component Library — The "Smart Components" for the Canvas
 * ===========================================================
 * 
 * This file defines ALL the architecture components that users can
 * drag onto the canvas. Each component has:
 * - A type (unique identifier)
 * - A name (human-readable)
 * - A description (tooltip/help text)
 * - A category (for grouping in the palette)
 * - An icon (from Lucide React)
 * - A color (mapped to our design system)
 * - Default configuration (properties the user can edit)
 * 
 * These are NOT just shapes — they're "smart components" that
 * understand what they represent in a system architecture.
 */

import type { ComponentDefinition } from '../types';

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // ===== FRONTEND =====
  {
    type: 'client',
    name: 'Client',
    description: 'Web browser, mobile app, or desktop client that users interact with',
    category: 'frontend',
    icon: 'Monitor',
    color: 'var(--color-node-frontend)',
    defaultConfig: {
      platform: 'web',  // web, mobile, desktop
      framework: 'React',
    },
  },

  // ===== NETWORKING =====
  {
    type: 'dns',
    name: 'DNS',
    description: 'Domain Name System — translates domain names to IP addresses',
    category: 'networking',
    icon: 'Globe',
    color: 'var(--color-node-networking)',
    defaultConfig: {
      provider: 'Route53',
      ttl: 300,
    },
  },
  {
    type: 'cdn',
    name: 'CDN',
    description: 'Content Delivery Network — caches static content at edge locations worldwide',
    category: 'networking',
    icon: 'Radio',
    color: 'var(--color-node-networking)',
    defaultConfig: {
      provider: 'CloudFront',
      cachePolicy: 'static-assets',
    },
  },
  {
    type: 'load_balancer',
    name: 'Load Balancer',
    description: 'Distributes incoming traffic across multiple servers',
    category: 'networking',
    icon: 'GitFork',
    color: 'var(--color-node-networking)',
    defaultConfig: {
      algorithm: 'round-robin',  // round-robin, least-connections, ip-hash, consistent-hashing
      healthCheck: true,
      provider: 'Nginx',
    },
  },
  {
    type: 'api_gateway',
    name: 'API Gateway',
    description: 'Single entry point for APIs — handles routing, auth, rate limiting',
    category: 'networking',
    icon: 'ArrowRightLeft',
    color: 'var(--color-node-networking)',
    defaultConfig: {
      provider: 'Kong',
      rateLimiting: true,
      authentication: true,
    },
  },

  // ===== COMPUTE =====
  {
    type: 'web_server',
    name: 'Web Server',
    description: 'Application server that handles HTTP requests and business logic',
    category: 'compute',
    icon: 'Server',
    color: 'var(--color-node-compute)',
    defaultConfig: {
      framework: 'Django',
      instances: 3,
      autoScaling: true,
    },
  },
  {
    type: 'microservice',
    name: 'Microservice',
    description: 'Independent service handling a specific business domain',
    category: 'compute',
    icon: 'Box',
    color: 'var(--color-node-compute)',
    defaultConfig: {
      name: 'UserService',
      framework: 'Flask',
      protocol: 'REST',  // REST, gRPC, GraphQL
    },
  },
  {
    type: 'worker',
    name: 'Worker Service',
    description: 'Background worker that processes async tasks from a queue',
    category: 'compute',
    icon: 'Cog',
    color: 'var(--color-node-compute)',
    defaultConfig: {
      framework: 'Celery',
      concurrency: 4,
    },
  },

  // ===== STORAGE =====
  {
    type: 'database_sql',
    name: 'SQL Database',
    description: 'Relational database for structured data with ACID transactions',
    category: 'storage',
    icon: 'Database',
    color: 'var(--color-node-storage)',
    defaultConfig: {
      engine: 'PostgreSQL',  // PostgreSQL, MySQL, SQLite
      replication: 'none',   // none, primary-replica, multi-master
      sharding: false,
      shardKey: '',
    },
  },
  {
    type: 'database_nosql',
    name: 'NoSQL Database',
    description: 'Document/key-value store for flexible, schema-less data',
    category: 'storage',
    icon: 'Database',
    color: 'var(--color-node-storage)',
    defaultConfig: {
      engine: 'MongoDB',  // MongoDB, DynamoDB, Cassandra
      replication: 'replica-set',
      consistency: 'eventual',  // strong, eventual
    },
  },
  {
    type: 'cache',
    name: 'Cache',
    description: 'In-memory data store for fast reads — sits between servers and database',
    category: 'storage',
    icon: 'Zap',
    color: 'var(--color-node-storage)',
    defaultConfig: {
      engine: 'Redis',       // Redis, Memcached
      evictionPolicy: 'LRU', // LRU, LFU, TTL
      writeStrategy: 'cache-aside',  // cache-aside, write-through, write-back
      capacity: '16GB',
    },
  },
  {
    type: 'object_storage',
    name: 'Object Storage',
    description: 'Blob storage for files, images, videos, backups (like S3)',
    category: 'storage',
    icon: 'HardDrive',
    color: 'var(--color-node-storage)',
    defaultConfig: {
      provider: 'S3',
      versioning: true,
      lifecycle: '90-day-glacier',
    },
  },
  {
    type: 'search',
    name: 'Search Engine',
    description: 'Full-text search engine for fast, relevant search results',
    category: 'storage',
    icon: 'Search',
    color: 'var(--color-node-storage)',
    defaultConfig: {
      engine: 'Elasticsearch',
      indexStrategy: 'real-time',
    },
  },

  // ===== ASYNC =====
  {
    type: 'message_queue',
    name: 'Message Queue',
    description: 'Asynchronous message broker for decoupling services',
    category: 'async',
    icon: 'Layers',
    color: 'var(--color-node-async)',
    defaultConfig: {
      engine: 'Kafka',  // Kafka, RabbitMQ, SQS
      deliveryGuarantee: 'at-least-once',  // at-most-once, at-least-once, exactly-once
      partitions: 6,
    },
  },
  {
    type: 'notification',
    name: 'Notification Service',
    description: 'Sends notifications via email, SMS, push, or in-app',
    category: 'async',
    icon: 'Bell',
    color: 'var(--color-node-async)',
    defaultConfig: {
      channels: ['email', 'push'],
      provider: 'SNS',
    },
  },

  // ===== SECURITY =====
  {
    type: 'auth_service',
    name: 'Auth Service',
    description: 'Authentication and authorization — manages user identity and permissions',
    category: 'security',
    icon: 'Shield',
    color: 'var(--color-node-security)',
    defaultConfig: {
      method: 'JWT',  // JWT, OAuth2, Session
      providers: ['email', 'github', 'google'],
      mfa: false,
    },
  },
  {
    type: 'rate_limiter',
    name: 'Rate Limiter',
    description: 'Limits API request rate to prevent abuse and DDoS attacks',
    category: 'security',
    icon: 'ShieldAlert',
    color: 'var(--color-node-security)',
    defaultConfig: {
      algorithm: 'token-bucket',  // token-bucket, sliding-window, fixed-window
      limit: 100,
      window: '1m',
    },
  },

  // ===== OPERATIONS =====
  {
    type: 'monitoring',
    name: 'Monitoring & Logging',
    description: 'Observability stack — metrics, logs, traces, and alerts',
    category: 'operations',
    icon: 'Activity',
    color: 'var(--color-node-operations)',
    defaultConfig: {
      metrics: 'Prometheus',
      logging: 'ELK Stack',
      tracing: 'Jaeger',
      alerting: true,
    },
  },
];

/** Group components by category for the palette sidebar */
export const COMPONENT_CATEGORIES: Record<string, { label: string; components: ComponentDefinition[] }> = {};

COMPONENT_LIBRARY.forEach((comp) => {
  if (!COMPONENT_CATEGORIES[comp.category]) {
    const labels: Record<string, string> = {
      frontend: '🖥️ Frontend',
      networking: '🌐 Networking',
      compute: '⚙️ Compute',
      storage: '💾 Storage',
      async: '📬 Async',
      security: '🔐 Security',
      operations: '📊 Operations',
    };
    COMPONENT_CATEGORIES[comp.category] = {
      label: labels[comp.category] || comp.category,
      components: [],
    };
  }
  COMPONENT_CATEGORIES[comp.category].components.push(comp);
});
