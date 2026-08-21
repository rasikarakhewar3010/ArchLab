/**
 * LearningHub — Interactive System Design Learning Paths
 * ========================================================
 * A complete, gamified learning experience with:
 * - Visual Roadmap (Duolingo-style phased skill tree)
 * - Interactive Topic Panels with key concepts & quizzes
 * - XP, Streaks, Levels, and Celebration animations
 * - Enhanced resource cards with filters and search
 *
 * Designed for progressive disclosure: learn → quiz → master → advance.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen01Icon,
  LinkSquare01Icon,
  Video01Icon,
  File01Icon,
  GraduationCapIcon,
  StarIcon,
  Clock01Icon,
  FilterIcon,
  Search01Icon,
  CheckmarkCircle01Icon,
  SparklesIcon,
  TrophyIcon,
  Compass01Icon,
  LayoutGridIcon,
  FlashIcon,
  FireIcon,
  SecurityLockIcon,
  Target01Icon,
  BulbIcon,
  Cancel01Icon,
  ChevronRightIcon,
  Award01Icon,
  GlobalIcon,
  Database01Icon,
  ServerIcon,
  Shield01Icon,
  Comment01Icon,
  CloudIcon,
  NetworkIcon,
  Activity01Icon,
  Layers01Icon,
  GitForkIcon,
  Brain01Icon,
  SourceCodeIcon,
  ArrowLeft01Icon,
} from '../components/common/Icon';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import BrandLogo from '../components/common/BrandLogo';
import {
  getResources,
  markResourceComplete,
  type LearningResource,
} from '../services/api';
import './LearningHub.css';

// ===== Types =====

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TopicNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  estimatedMinutes: number;
  concepts: string[];
  quiz: QuizQuestion[];
  resources: { title: string; url: string; author: string; type: string }[];
}

interface LearningPhase {
  id: string;
  phaseNumber: number;
  title: string;
  subtitle: string;
  accentColor: string;
  nodes: TopicNode[];
}

// ===== Comprehensive Curriculum Data =====
// Based on researched system-design roadmaps (System Design Primer,
// DDIA, ByteByteGo, Grokking SDI) — ordered from fundamentals → expert.

const LEARNING_PHASES: LearningPhase[] = [
  {
    id: 'foundations',
    phaseNumber: 1,
    title: 'Foundations',
    subtitle: 'The building blocks every system designer must know',
    accentColor: 'var(--color-success)',
    nodes: [
      {
        id: 'client-server',
        title: 'Client–Server Model',
        description: 'How the internet works — requests, responses, and the client-server architecture.',
        icon: 'globe',
        xp: 50,
        estimatedMinutes: 15,
        concepts: [
          'The client sends a request (HTTP) to a server, which processes it and returns a response.',
          'Servers can be physical machines or virtual instances in the cloud.',
          'Stateless vs. Stateful — HTTP is inherently stateless; sessions are maintained using cookies/tokens.',
          'DNS (Domain Name System) translates human-readable domain names to IP addresses.',
        ],
        quiz: [
          {
            question: 'What does it mean for HTTP to be "stateless"?',
            options: [
              'The server cannot process requests',
              'Each request is independent — the server doesn\'t remember previous requests',
              'The client must always send data',
              'HTTP connections are always encrypted',
            ],
            correctIndex: 1,
            explanation: 'HTTP is stateless — each request carries all information the server needs. Sessions are maintained separately via cookies, tokens, or session IDs.',
          },
          {
            question: 'What does DNS do?',
            options: [
              'Encrypts data in transit',
              'Translates domain names (like google.com) into IP addresses',
              'Compresses HTTP responses',
              'Load balances traffic across servers',
            ],
            correctIndex: 1,
            explanation: 'DNS is the "phone book of the internet" — it maps human-readable domain names to the numeric IP addresses computers use to locate each other.',
          },
        ],
        resources: [
          { title: 'How the Internet Works (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/How_does_the_Internet_work', author: 'MDN Web Docs', type: 'documentation' },
          { title: 'DNS Explained (ByteByteGo)', url: 'https://bytebytego.com', author: 'Alex Xu', type: 'video' },
        ],
      },
      {
        id: 'apis-protocols',
        title: 'APIs & Communication Protocols',
        description: 'REST, GraphQL, gRPC, WebSockets — how services talk to each other.',
        icon: 'code',
        xp: 75,
        estimatedMinutes: 25,
        concepts: [
          'REST (Representational State Transfer) uses HTTP methods: GET, POST, PUT, DELETE on resources.',
          'GraphQL lets clients request exactly the data they need — reducing over-fetching.',
          'gRPC uses Protocol Buffers for fast, binary serialization — ideal for service-to-service communication.',
          'WebSockets enable full-duplex, real-time communication (chat apps, live feeds).',
          'API versioning strategies: URL path (/v1/), query params, or headers.',
        ],
        quiz: [
          {
            question: 'When would you choose WebSockets over REST?',
            options: [
              'For a static blog page',
              'For a real-time chat application',
              'For a simple CRUD API',
              'For batch data processing',
            ],
            correctIndex: 1,
            explanation: 'WebSockets provide full-duplex, persistent connections — perfect for real-time features like chat, live dashboards, and collaborative editing where both client and server need to push data.',
          },
          {
            question: 'What is the main advantage of GraphQL over REST?',
            options: [
              'It is faster than REST',
              'It uses binary serialization',
              'Clients can request exactly the data they need, avoiding over-fetching',
              'It only works with NoSQL databases',
            ],
            correctIndex: 2,
            explanation: 'GraphQL allows clients to specify exactly which fields they need in a single query, eliminating the over-fetching and under-fetching problems common with fixed REST endpoints.',
          },
        ],
        resources: [
          { title: 'REST API Tutorial', url: 'https://restfulapi.net/', author: 'RESTful API', type: 'documentation' },
          { title: 'GraphQL vs REST (ByteByteGo)', url: 'https://bytebytego.com', author: 'Alex Xu', type: 'video' },
        ],
      },
      {
        id: 'scaling-basics',
        title: 'Scaling 101',
        description: 'Vertical vs. Horizontal scaling, latency vs. throughput, and availability.',
        icon: 'activity',
        xp: 75,
        estimatedMinutes: 20,
        concepts: [
          'Vertical Scaling (Scale Up): Add more CPU/RAM to one machine. Simple but has physical limits.',
          'Horizontal Scaling (Scale Out): Add more machines. Harder but virtually unlimited.',
          'Latency = time for a single request. Throughput = total requests handled per second.',
          'Availability = percentage of time the system is operational (99.9% = 8.76 hours downtime/year).',
          'The "9s" of availability: 99.99% ("four nines") = 52.6 minutes downtime/year.',
        ],
        quiz: [
          {
            question: 'A system with 99.99% availability can have at most how much downtime per year?',
            options: [
              '8.76 hours',
              '52.6 minutes',
              '5.26 minutes',
              '26.3 seconds',
            ],
            correctIndex: 1,
            explanation: 'Four nines (99.99%) availability allows approximately 52.6 minutes of downtime per year. Each additional "9" dramatically reduces allowed downtime.',
          },
        ],
        resources: [
          { title: 'System Design Primer — Scalability', url: 'https://github.com/donnemartin/system-design-primer#scalability', author: 'Donne Martin', type: 'github' },
        ],
      },
      {
        id: 'load-balancers',
        title: 'Load Balancers & Reverse Proxies',
        description: 'Distributing traffic across servers for reliability and performance.',
        icon: 'network',
        xp: 100,
        estimatedMinutes: 25,
        concepts: [
          'A Load Balancer distributes incoming requests across multiple servers.',
          'Algorithms: Round Robin, Least Connections, IP Hash, Weighted.',
          'Layer 4 (TCP/UDP) vs. Layer 7 (HTTP) load balancing — L7 can route based on URL/headers.',
          'Reverse Proxy sits in front of servers — provides SSL termination, caching, and security.',
          'Health checks ensure traffic only goes to healthy servers.',
        ],
        quiz: [
          {
            question: 'What is the key difference between L4 and L7 load balancing?',
            options: [
              'L4 is faster because it operates at the transport layer without inspecting content; L7 can route based on HTTP content (URL, headers)',
              'L4 works only with TCP; L7 works only with UDP',
              'L4 is for internal traffic; L7 is for external traffic',
              'There is no meaningful difference',
            ],
            correctIndex: 0,
            explanation: 'L4 load balancers make routing decisions based on TCP/UDP info (IP, port) — faster but less flexible. L7 load balancers can inspect HTTP headers, URLs, and cookies for smarter routing.',
          },
        ],
        resources: [
          { title: 'Load Balancing (System Design Primer)', url: 'https://github.com/donnemartin/system-design-primer#load-balancer', author: 'Donne Martin', type: 'github' },
          { title: 'NGINX as Reverse Proxy', url: 'https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/', author: 'NGINX', type: 'documentation' },
        ],
      },
    ],
  },
  {
    id: 'data-storage',
    phaseNumber: 2,
    title: 'Data Storage & Databases',
    subtitle: 'Master how to store, retrieve, and scale your data',
    accentColor: 'var(--color-info)',
    nodes: [
      {
        id: 'sql-vs-nosql',
        title: 'SQL vs. NoSQL',
        description: 'Relational databases vs. NoSQL — when to use which and why.',
        icon: 'database',
        xp: 100,
        estimatedMinutes: 30,
        concepts: [
          'SQL (Relational): Tables with rows/columns, strict schemas, ACID transactions. (PostgreSQL, MySQL)',
          'NoSQL Key-Value: Fast lookups by key, great for caching/sessions. (Redis, DynamoDB)',
          'NoSQL Document: Flexible JSON-like documents, nested data. (MongoDB, CouchDB)',
          'NoSQL Column-Family: Optimized for writes and time-series data. (Cassandra, HBase)',
          'NoSQL Graph: Relationships are first-class citizens. (Neo4j, Amazon Neptune)',
          'Choose SQL when you need ACID, complex joins, and structured data. Choose NoSQL for flexibility, scale, and specific access patterns.',
        ],
        quiz: [
          {
            question: 'A social network needs to store and query complex relationships between users (friends, followers, mutual connections). Which database type is best suited?',
            options: [
              'Key-Value store (Redis)',
              'Relational database (PostgreSQL)',
              'Graph database (Neo4j)',
              'Column-family store (Cassandra)',
            ],
            correctIndex: 2,
            explanation: 'Graph databases like Neo4j model relationships as first-class entities, making queries like "friends of friends" or "shortest path between users" extremely efficient compared to JOIN-heavy SQL queries.',
          },
          {
            question: 'What does ACID stand for in database transactions?',
            options: [
              'Automatic, Consistent, Isolated, Durable',
              'Atomicity, Consistency, Isolation, Durability',
              'Asynchronous, Concurrent, Independent, Distributed',
              'Available, Consistent, Isolated, Dependable',
            ],
            correctIndex: 1,
            explanation: 'ACID guarantees: Atomicity (all-or-nothing), Consistency (valid state transitions), Isolation (concurrent transactions don\'t interfere), Durability (committed data persists).',
          },
        ],
        resources: [
          { title: 'Designing Data-Intensive Applications (Ch. 2)', url: 'https://dataintensive.net', author: 'Martin Kleppmann', type: 'documentation' },
          { title: 'SQL vs NoSQL (ByteByteGo)', url: 'https://bytebytego.com', author: 'Alex Xu', type: 'video' },
        ],
      },
      {
        id: 'db-indexing',
        title: 'Database Indexing',
        description: 'How indexes speed up queries and the trade-offs involved.',
        icon: 'search',
        xp: 75,
        estimatedMinutes: 20,
        concepts: [
          'An index is a data structure (usually B-Tree or Hash) that speeds up lookups at the cost of extra storage and slower writes.',
          'B-Tree indexes support range queries and ordering. Hash indexes are O(1) for exact lookups.',
          'Composite indexes cover multiple columns — column order matters for query optimization.',
          'Covering indexes include all columns a query needs, avoiding table lookups entirely.',
          'Too many indexes slow down writes (INSERT/UPDATE/DELETE) because every index must be updated.',
        ],
        quiz: [
          {
            question: 'Why might adding too many indexes hurt performance?',
            options: [
              'Indexes use too much network bandwidth',
              'Every INSERT/UPDATE/DELETE must also update all indexes, slowing write operations',
              'Indexes prevent queries from running in parallel',
              'Indexes are incompatible with SQL databases',
            ],
            correctIndex: 1,
            explanation: 'Each index is a separate data structure that must be maintained. On every write, the database must update all relevant indexes, adding I/O overhead. It\'s a trade-off: faster reads vs. slower writes.',
          },
        ],
        resources: [
          { title: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/', author: 'Markus Winand', type: 'article' },
        ],
      },
      {
        id: 'sharding-replication',
        title: 'Sharding & Replication',
        description: 'Partitioning data across machines and replicating for reliability.',
        icon: 'layers',
        xp: 125,
        estimatedMinutes: 35,
        concepts: [
          'Sharding (Partitioning): Split data across multiple databases to distribute load.',
          'Shard key selection is critical — poor choices lead to hotspots (uneven load).',
          'Strategies: Hash-based (even distribution), Range-based (sequential access), Directory-based.',
          'Replication: Copy data to multiple nodes for fault tolerance and read scaling.',
          'Leader-Follower: One leader handles writes; followers handle reads. Simple but leader is a bottleneck.',
          'Multi-Leader / Leaderless: Better availability but introduces conflict resolution complexity.',
        ],
        quiz: [
          {
            question: 'What is the biggest risk of choosing a bad shard key?',
            options: [
              'Data gets encrypted incorrectly',
              'All traffic hits one shard (hotspot) while others sit idle',
              'The database schema becomes invalid',
              'Indexes stop working',
            ],
            correctIndex: 1,
            explanation: 'A poorly chosen shard key can cause "hotspots" — one shard receives disproportionate traffic while others are underutilized. For example, sharding by country would overload the US shard.',
          },
        ],
        resources: [
          { title: 'DDIA Chapter 6 — Partitioning', url: 'https://dataintensive.net', author: 'Martin Kleppmann', type: 'documentation' },
          { title: 'Database Sharding Explained', url: 'https://github.com/donnemartin/system-design-primer#database', author: 'Donne Martin', type: 'github' },
        ],
      },
      {
        id: 'cap-theorem',
        title: 'CAP Theorem & Consistency Models',
        description: 'The fundamental trade-off in distributed databases.',
        icon: 'git-branch',
        xp: 100,
        estimatedMinutes: 25,
        concepts: [
          'CAP Theorem: In a network partition, you must choose between Consistency and Availability.',
          'Consistency: Every read receives the most recent write (or an error).',
          'Availability: Every request receives a response (but it may not be the most recent data).',
          'Partition Tolerance: The system continues despite network failures. (Always required in distributed systems.)',
          'Strong Consistency: All nodes see the same data at the same time. (CP systems like HBase, MongoDB)',
          'Eventual Consistency: Given enough time, all replicas converge. (AP systems like Cassandra, DynamoDB)',
        ],
        quiz: [
          {
            question: 'In the CAP theorem, why is Partition Tolerance always required?',
            options: [
              'It makes the system faster',
              'Network partitions are impossible to prevent in distributed systems',
              'It reduces storage costs',
              'It is only needed for cloud systems',
            ],
            correctIndex: 1,
            explanation: 'In any distributed system, network failures (partitions) are inevitable. Since you can\'t prevent them, every distributed database must tolerate partitions — the real choice is between Consistency and Availability during a partition.',
          },
        ],
        resources: [
          { title: 'CAP Theorem Visual Guide', url: 'https://bytebytego.com', author: 'Alex Xu', type: 'video' },
          { title: 'You Can\'t Sacrifice Partition Tolerance', url: 'https://codahale.com/you-cant-sacrifice-partition-tolerance/', author: 'Coda Hale', type: 'article' },
        ],
      },
    ],
  },
  {
    id: 'performance',
    phaseNumber: 3,
    title: 'Caching & Performance',
    subtitle: 'Make systems blazing fast under heavy load',
    accentColor: 'var(--color-warning)',
    nodes: [
      {
        id: 'caching-strategies',
        title: 'Caching Strategies',
        description: 'Cache-aside, write-through, write-back — when and how to cache.',
        icon: 'zap',
        xp: 100,
        estimatedMinutes: 25,
        concepts: [
          'Cache-Aside (Lazy Loading): App checks cache first → miss → reads from DB → populates cache.',
          'Write-Through: Every write goes to cache AND DB simultaneously. Strong consistency but slower writes.',
          'Write-Behind (Write-Back): Write to cache first, asynchronously flush to DB. Fast writes, risk of data loss.',
          'Read-Through: Cache sits in front of DB; cache itself fetches on miss.',
          'Eviction policies: LRU (Least Recently Used), LFU (Least Frequently Used), TTL (Time-to-Live).',
          'Cache invalidation is one of the two hardest problems in CS (along with naming things and off-by-one errors).',
        ],
        quiz: [
          {
            question: 'Your e-commerce site has a product catalog that changes rarely but is read millions of times per day. Which caching strategy is best?',
            options: [
              'Write-Behind with short TTL',
              'Cache-Aside with long TTL',
              'No caching — always read from DB',
              'Write-Through with no eviction',
            ],
            correctIndex: 1,
            explanation: 'Cache-Aside with a long TTL is ideal for read-heavy, rarely-changing data. The cache is populated on first read and serves subsequent reads instantly. The long TTL minimizes unnecessary cache misses.',
          },
          {
            question: 'What is the main risk of Write-Behind (Write-Back) caching?',
            options: [
              'It is slower than Write-Through',
              'If the cache node crashes before flushing, recent writes are lost',
              'It only works with SQL databases',
              'It requires more network bandwidth',
            ],
            correctIndex: 1,
            explanation: 'Write-Behind writes to cache first and asynchronously persists to the database. If the cache crashes before the async write completes, that data is lost. It trades durability for write speed.',
          },
        ],
        resources: [
          { title: 'Caching (System Design Primer)', url: 'https://github.com/donnemartin/system-design-primer#cache', author: 'Donne Martin', type: 'github' },
          { title: 'Redis Documentation', url: 'https://redis.io/documentation', author: 'Redis', type: 'documentation' },
        ],
      },
      {
        id: 'cdn',
        title: 'CDNs & Edge Computing',
        description: 'Serve content from locations closest to users worldwide.',
        icon: 'cloud',
        xp: 75,
        estimatedMinutes: 20,
        concepts: [
          'A CDN (Content Delivery Network) caches static assets (images, JS, CSS) at edge servers worldwide.',
          'Pull CDN: Content is fetched from origin on first request, then cached. Simpler setup.',
          'Push CDN: Content is uploaded to CDN proactively. Better for content that rarely changes.',
          'Edge Computing extends this — running logic (not just caching) at edge locations.',
          'Benefits: Lower latency, reduced origin server load, DDoS protection, global performance.',
        ],
        quiz: [
          {
            question: 'When would a Push CDN be preferred over a Pull CDN?',
            options: [
              'For highly dynamic content that changes every second',
              'For static content that changes infrequently (e.g., company logos, fonts)',
              'For real-time streaming video',
              'For database query results',
            ],
            correctIndex: 1,
            explanation: 'Push CDNs are ideal when content changes infrequently because you proactively upload it once and it\'s served globally. Pull CDNs are better for dynamic sites where content is fetched on demand.',
          },
        ],
        resources: [
          { title: 'CDN Explained (Cloudflare)', url: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/', author: 'Cloudflare', type: 'documentation' },
        ],
      },
      {
        id: 'rate-limiting',
        title: 'Rate Limiting & Throttling',
        description: 'Protect your system from abuse and ensure fair usage.',
        icon: 'shield',
        xp: 75,
        estimatedMinutes: 20,
        concepts: [
          'Rate limiting controls how many requests a client can make in a given time window.',
          'Token Bucket: Tokens are added at a fixed rate; each request consumes one. Allows bursts up to bucket size.',
          'Leaky Bucket: Requests enter a queue processed at a constant rate. Smooths out bursts.',
          'Fixed Window: Count requests in fixed time windows (e.g., 100 req/minute). Simple but edge-case-prone.',
          'Sliding Window Log: Track timestamps of all requests. Precise but memory-intensive.',
          'Implement at API Gateway level or as middleware for centralized control.',
        ],
        quiz: [
          {
            question: 'Why might Fixed Window rate limiting allow twice the expected requests at window boundaries?',
            options: [
              'Because it uses too much memory',
              'A user can send max requests at the end of one window and start of the next — doubling the rate briefly',
              'Because it cannot count requests accurately',
              'Because it only works with GET requests',
            ],
            correctIndex: 1,
            explanation: 'In Fixed Window, a user could send 100 requests at 11:59:59 and another 100 at 12:00:01 — that\'s 200 requests in 2 seconds despite a 100/min limit. Sliding Window solves this.',
          },
        ],
        resources: [
          { title: 'Rate Limiting Algorithms', url: 'https://bytebytego.com', author: 'Alex Xu', type: 'video' },
        ],
      },
    ],
  },
  {
    id: 'distributed',
    phaseNumber: 4,
    title: 'Distributed Systems Patterns',
    subtitle: 'Build reliable systems across multiple machines',
    accentColor: '#a855f7',
    nodes: [
      {
        id: 'message-queues',
        title: 'Message Queues & Event-Driven Architecture',
        description: 'Decouple services with async communication — Kafka, RabbitMQ, SQS.',
        icon: 'message-square',
        xp: 125,
        estimatedMinutes: 35,
        concepts: [
          'Message queues decouple producers (senders) from consumers (receivers) — they don\'t need to be available simultaneously.',
          'Point-to-Point: Each message is consumed by exactly one consumer. (SQS, RabbitMQ direct)',
          'Pub/Sub: Messages are broadcast to all subscribers of a topic. (Kafka, SNS, Redis Pub/Sub)',
          'Event Sourcing: Store all state changes as immutable events. Rebuild state by replaying events.',
          'CQRS (Command Query Responsibility Segregation): Separate read and write models for optimization.',
          'Idempotency: Design consumers so processing the same message twice produces the same result.',
        ],
        quiz: [
          {
            question: 'Your microservice processes payments. Due to a network retry, it receives the same payment request twice. How should you handle this?',
            options: [
              'Process both payments — the client can request a refund later',
              'Design the payment handler to be idempotent — use a unique payment ID to detect duplicates',
              'Disable retries entirely',
              'Add a 5-second delay between processing',
            ],
            correctIndex: 1,
            explanation: 'Idempotent design uses a unique identifier (payment ID) to detect duplicate requests. If the system has already processed that payment ID, it returns the existing result instead of charging again.',
          },
        ],
        resources: [
          { title: 'Kafka: The Definitive Guide (Preview)', url: 'https://kafka.apache.org/documentation/', author: 'Apache', type: 'documentation' },
          { title: 'Message Queues Explained', url: 'https://bytebytego.com', author: 'Alex Xu', type: 'video' },
        ],
      },
      {
        id: 'microservices',
        title: 'Microservices Architecture',
        description: 'Breaking monoliths into independently deployable services.',
        icon: 'layers',
        xp: 125,
        estimatedMinutes: 30,
        concepts: [
          'Microservices = independently deployable services, each owning its own data and business logic.',
          'Benefits: Independent scaling, technology diversity, team autonomy, fault isolation.',
          'Drawbacks: Distributed complexity, network latency, data consistency challenges, operational overhead.',
          'Service Discovery: Services need to find each other. Use a registry (Consul, Eureka) or DNS-based discovery.',
          'API Gateway: Single entry point that routes requests, handles auth, rate limiting, and response aggregation.',
          'The "Distributed Monolith" anti-pattern: Microservices that are tightly coupled defeat the purpose.',
        ],
        quiz: [
          {
            question: 'What is a "distributed monolith"?',
            options: [
              'A monolith that runs on multiple servers',
              'Microservices that are so tightly coupled they must be deployed together — the worst of both worlds',
              'A distributed database with a single schema',
              'A microservice with a large codebase',
            ],
            correctIndex: 1,
            explanation: 'A distributed monolith happens when microservices share databases, have synchronous dependencies, or require coordinated deployments. You get the complexity of distributed systems without the benefits of independence.',
          },
        ],
        resources: [
          { title: 'Microservices (Martin Fowler)', url: 'https://martinfowler.com/articles/microservices.html', author: 'Martin Fowler', type: 'article' },
          { title: 'Building Microservices (O\'Reilly)', url: 'https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/', author: 'Sam Newman', type: 'documentation' },
        ],
      },
      {
        id: 'resilience-patterns',
        title: 'Resilience & Fault Tolerance',
        description: 'Circuit breakers, retries, bulkheads — surviving failures gracefully.',
        icon: 'shield',
        xp: 100,
        estimatedMinutes: 25,
        concepts: [
          'Circuit Breaker: Stops calling a failing service after a threshold, giving it time to recover.',
          'Three states: Closed (normal) → Open (failing, fast-fail) → Half-Open (testing recovery).',
          'Retry with Exponential Backoff: Wait longer between each retry (1s → 2s → 4s → 8s) to avoid overwhelming the service.',
          'Bulkhead Pattern: Isolate components so failure in one doesn\'t cascade. Like watertight compartments on a ship.',
          'Timeouts: Always set timeouts on external calls. A missing timeout is a guaranteed cascading failure.',
          'Graceful Degradation: When a component fails, serve partial results rather than nothing.',
        ],
        quiz: [
          {
            question: 'In the Circuit Breaker pattern, what happens in the "Half-Open" state?',
            options: [
              'The circuit blocks all requests permanently',
              'The circuit allows a limited number of test requests to check if the service has recovered',
              'The circuit processes requests at half speed',
              'The circuit retries all failed requests from the queue',
            ],
            correctIndex: 1,
            explanation: 'Half-Open allows a few test requests through. If they succeed, the circuit closes (normal operation). If they fail, the circuit opens again (fast-fail). This prevents overwhelming a recovering service.',
          },
        ],
        resources: [
          { title: 'Release It! (2nd Edition)', url: 'https://pragprog.com/titles/mnee2/release-it-second-edition/', author: 'Michael Nygard', type: 'documentation' },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    phaseNumber: 5,
    title: 'Advanced Architecture',
    subtitle: 'Consensus, search, and real-world infrastructure',
    accentColor: 'var(--color-danger)',
    nodes: [
      {
        id: 'consensus',
        title: 'Consensus Algorithms',
        description: 'Paxos, Raft — how distributed systems agree on a single value.',
        icon: 'brain',
        xp: 150,
        estimatedMinutes: 40,
        concepts: [
          'Consensus = getting multiple nodes to agree on a single value, even if some nodes fail.',
          'Raft: Leader-based. A leader is elected; all changes go through the leader. Designed for understandability.',
          'Raft phases: Leader Election → Log Replication → Safety.',
          'Paxos: The original consensus algorithm. Provably correct but notoriously hard to implement.',
          'Used in: etcd (Raft), ZooKeeper (ZAB — Paxos variant), Google Spanner (Paxos).',
          'Byzantine Fault Tolerance: Handles nodes that lie (malicious). Used in blockchain but overkill for most systems.',
        ],
        quiz: [
          {
            question: 'Why was Raft created when Paxos already existed?',
            options: [
              'Paxos is slower than Raft',
              'Raft was designed to be understandable — Paxos is correct but extremely hard to implement correctly',
              'Paxos cannot handle node failures',
              'Raft uses less network bandwidth',
            ],
            correctIndex: 1,
            explanation: 'Paxos is provably correct but its paper is famously difficult to understand and implement. Raft was explicitly designed for understandability while maintaining the same safety guarantees. It separates concerns into leader election and log replication.',
          },
        ],
        resources: [
          { title: 'Raft Visualization', url: 'https://raft.github.io/', author: 'Diego Ongaro', type: 'documentation' },
          { title: 'DDIA Chapter 9 — Consistency & Consensus', url: 'https://dataintensive.net', author: 'Martin Kleppmann', type: 'documentation' },
        ],
      },
      {
        id: 'search-systems',
        title: 'Search & Indexing at Scale',
        description: 'Full-text search, Elasticsearch, inverted indexes, and ranking.',
        icon: 'search',
        xp: 100,
        estimatedMinutes: 25,
        concepts: [
          'Inverted Index: Maps every word to the documents containing it. The core data structure of search engines.',
          'Tokenization: Breaking text into tokens (words). Stemming: "running" → "run". Stop words: removing "the", "a".',
          'TF-IDF: Term Frequency × Inverse Document Frequency. Ranks documents by how relevant a term is.',
          'Elasticsearch: Distributed search engine built on Apache Lucene. Handles full-text search, analytics, and logging.',
          'Sharding search indexes across nodes for horizontal scaling.',
        ],
        quiz: [
          {
            question: 'What does an inverted index map?',
            options: [
              'Document IDs to their content',
              'Words/terms to the list of documents containing them',
              'Server IPs to database schemas',
              'User queries to cached results',
            ],
            correctIndex: 1,
            explanation: 'An inverted index maps each unique word to a list of documents (and positions) where that word appears. This makes full-text search fast — look up the word, get all matching documents instantly.',
          },
        ],
        resources: [
          { title: 'Elasticsearch: The Definitive Guide', url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html', author: 'Elastic', type: 'documentation' },
        ],
      },
    ],
  },
  {
    id: 'case-studies',
    phaseNumber: 6,
    title: 'Real-World Case Studies',
    subtitle: 'Apply everything — design systems used by billions',
    accentColor: 'var(--color-accent)',
    nodes: [
      {
        id: 'design-url-shortener',
        title: 'Design: URL Shortener',
        description: 'Your first complete system design — bit.ly at scale.',
        icon: 'target',
        xp: 150,
        estimatedMinutes: 35,
        concepts: [
          'Functional: Create short URLs, redirect to originals, optional custom aliases, expiration.',
          'Non-Functional: 500M new URLs/month, 100:1 read/write, <100ms redirect latency, 99.9% availability.',
          'Key decisions: Base62 encoding vs. MD5 hashing for short key generation.',
          'Architecture: API servers → Load Balancer → Database (key-value optimized) + Cache (Redis).',
          'Cache hit rate is critical — most redirects should be served from cache.',
        ],
        quiz: [
          {
            question: 'For a URL shortener with 100:1 read/write ratio, where should you focus optimization?',
            options: [
              'Write path — making URL creation faster',
              'Read path — caching popular URLs for fast redirects',
              'Database schema normalization',
              'Image compression',
            ],
            correctIndex: 1,
            explanation: 'With a 100:1 read/write ratio, the vast majority of traffic is redirects (reads). Caching the most popular URLs in Redis ensures sub-millisecond redirects and dramatically reduces database load.',
          },
        ],
        resources: [
          { title: 'System Design: URL Shortener', url: 'https://github.com/donnemartin/system-design-primer#design-a-url-shortener', author: 'Donne Martin', type: 'github' },
          { title: 'URL Shortener Design (ByteByteGo)', url: 'https://bytebytego.com', author: 'Alex Xu', type: 'video' },
        ],
      },
      {
        id: 'design-chat-system',
        title: 'Design: Chat System',
        description: 'WhatsApp / Slack — real-time messaging at massive scale.',
        icon: 'message-square',
        xp: 200,
        estimatedMinutes: 45,
        concepts: [
          'Real-time communication: WebSockets for persistent connections vs. Long Polling.',
          'Message delivery guarantees: At-most-once, At-least-once, Exactly-once.',
          'Online presence: Use a heartbeat system — client pings server every N seconds.',
          'Message storage: Append-only log per chat. Use a time-series optimized store.',
          'Group chat fan-out: On send, message is written once and read by N members. Write-heavy for large groups.',
          'End-to-end encryption: Only sender and receiver can decrypt. Server cannot read messages.',
        ],
        quiz: [
          {
            question: 'Why do chat apps like WhatsApp use WebSockets instead of HTTP polling?',
            options: [
              'WebSockets are more secure',
              'WebSockets maintain a persistent, bidirectional connection — enabling instant message delivery without constant polling overhead',
              'HTTP polling uses less bandwidth',
              'WebSockets are easier to implement',
            ],
            correctIndex: 1,
            explanation: 'WebSockets keep a persistent TCP connection open between client and server. The server can push messages instantly without the client having to ask "any new messages?" every second — saving bandwidth and reducing latency.',
          },
        ],
        resources: [
          { title: 'Design a Chat System (Grokking SDI)', url: 'https://www.designgurus.io/course/grokking-the-system-design-interview', author: 'Design Gurus', type: 'course' },
          { title: 'WhatsApp Architecture', url: 'http://highscalability.com', author: 'High Scalability', type: 'article' },
        ],
      },
      {
        id: 'design-newsfeed',
        title: 'Design: News Feed (Twitter / Instagram)',
        description: 'Fan-out, ranking algorithms, and serving personalized content.',
        icon: 'activity',
        xp: 200,
        estimatedMinutes: 45,
        concepts: [
          'Fan-out on Write: Pre-compute feeds for all followers when a user posts. Fast reads, expensive writes.',
          'Fan-out on Read: Assemble the feed at read time by pulling from followed users. Slower reads, cheaper writes.',
          'Hybrid: Use fan-out-on-write for normal users, fan-out-on-read for celebrities (millions of followers).',
          'Ranking: Chronological is simple but not engaging. ML-based ranking uses signals: recency, engagement, relevance.',
          'Infinite scroll pagination: Cursor-based (last item ID) is better than offset-based for real-time feeds.',
          'Media handling: Separate media storage (S3/CDN) from metadata. Generate thumbnails asynchronously.',
        ],
        quiz: [
          {
            question: 'Why do systems like Twitter use a hybrid fan-out approach?',
            options: [
              'To reduce database storage costs',
              'Fan-out-on-write is impractical for celebrities with millions of followers (too expensive), but fan-out-on-read is too slow for regular users',
              'Because hybrid systems use less code',
              'To avoid using caching',
            ],
            correctIndex: 1,
            explanation: 'A celebrity posting to 50M followers would require 50M write operations with fan-out-on-write — impossibly slow. But for a user with 200 followers, pre-computing is fast and makes reads instant. The hybrid approach uses the best strategy for each case.',
          },
        ],
        resources: [
          { title: 'Designing Instagram (System Design Primer)', url: 'https://github.com/donnemartin/system-design-primer', author: 'Donne Martin', type: 'github' },
          { title: 'News Feed System Design', url: 'https://bytebytego.com', author: 'Alex Xu', type: 'video' },
        ],
      },
    ],
  },
];

// Map icon strings to Hugeicons components
const ICON_MAP: Record<string, IconSvgElement> = {
  globe: GlobalIcon,
  code: SourceCodeIcon,
  activity: Activity01Icon,
  network: NetworkIcon,
  database: Database01Icon,
  search: Search01Icon,
  layers: Layers01Icon,
  'git-branch': GitForkIcon,
  zap: FlashIcon,
  cloud: CloudIcon,
  shield: Shield01Icon,
  'message-square': Comment01Icon,
  brain: Brain01Icon,
  target: Target01Icon,
  server: ServerIcon,
};

const SOURCE_ICONS: Record<string, IconSvgElement> = {
  github: LinkSquare01Icon,
  article: File01Icon,
  video: Video01Icon,
  documentation: BookOpen01Icon,
  course: GraduationCapIcon,
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'var(--color-success)' },
  intermediate: { label: 'Intermediate', color: 'var(--color-info)' },
  advanced: { label: 'Advanced', color: 'var(--color-warning)' },
  expert: { label: 'Expert', color: '#a855f7' },
};

// Mock resources for the resources view
const MOCK_RESOURCES: LearningResource[] = [
  {
    id: '1', title: 'System Design Primer', slug: 'system-design-primer',
    url: 'https://github.com/donnemartin/system-design-primer',
    description: 'Learn how to design large-scale systems. Prep for the system design interview.',
    source_type: 'github', difficulty: 'beginner',
    topics: ['fundamentals', 'scalability', 'databases'], author_name: 'Donne Martin',
    github_stars: 270000, estimated_time_minutes: 480, icon: 'book-open', is_featured: true,
  },
  {
    id: '2', title: 'Designing Data-Intensive Applications', slug: 'ddia',
    url: 'https://dataintensive.net',
    description: 'The big ideas behind reliable, scalable, and maintainable systems.',
    source_type: 'documentation', difficulty: 'intermediate',
    topics: ['databases', 'distributed-systems', 'consistency'], author_name: 'Martin Kleppmann',
    github_stars: null, estimated_time_minutes: 1200, icon: 'database', is_featured: true,
  },
  {
    id: '3', title: 'ByteByteGo — System Design 101', slug: 'bytebytego',
    url: 'https://bytebytego.com',
    description: 'Visual explanations of system design concepts by Alex Xu.',
    source_type: 'video', difficulty: 'beginner',
    topics: ['fundamentals', 'interviews', 'architecture'], author_name: 'Alex Xu',
    github_stars: null, estimated_time_minutes: 300, icon: 'video', is_featured: true,
  },
  {
    id: '4', title: 'Grokking System Design Interview', slug: 'grokking-sdi',
    url: 'https://www.designgurus.io/course/grokking-the-system-design-interview',
    description: 'Step-by-step guide for system design interviews at top tech companies.',
    source_type: 'course', difficulty: 'intermediate',
    topics: ['interviews', 'url-shortener', 'twitter', 'instagram'], author_name: 'Design Gurus',
    github_stars: null, estimated_time_minutes: 600, icon: 'graduation-cap', is_featured: false,
  },
  {
    id: '5', title: 'High Scalability Blog', slug: 'high-scalability',
    url: 'http://highscalability.com',
    description: 'Real-world architecture case studies from companies like Netflix, Uber, and Twitter.',
    source_type: 'article', difficulty: 'advanced',
    topics: ['case-studies', 'scalability', 'real-world'], author_name: 'Todd Hoff',
    github_stars: null, estimated_time_minutes: null, icon: 'trending-up', is_featured: false,
  },
  {
    id: '6', title: 'AWS Well-Architected Framework', slug: 'aws-well-architected',
    url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/',
    description: 'Best practices for designing cloud architectures on AWS.',
    source_type: 'documentation', difficulty: 'advanced',
    topics: ['cloud', 'aws', 'best-practices', 'reliability'], author_name: 'AWS',
    github_stars: null, estimated_time_minutes: 360, icon: 'cloud', is_featured: false,
  },
];

// ===== Confetti Component =====
function Confetti() {
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: `${2 + Math.random() * 1.5}s`,
    rotation: `${Math.random() * 360}deg`,
  }));

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  );
}

// ===== Main Component =====
export default function LearningHub() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Data
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [view, setView] = useState<'roadmap' | 'resources'>('roadmap');

  // Roadmap state
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('archlab-completed-nodes');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch { return new Set<string>(); }
  });
  const [activeNode, setActiveNode] = useState<TopicNode | null>(null);
  const [activePhase, setActivePhase] = useState<LearningPhase | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizRevealed, setQuizRevealed] = useState<Record<string, boolean>>({});

  // Gamification state
  const [xp, setXp] = useState(() => {
    try { return parseInt(localStorage.getItem('archlab-xp') || '0'); } catch { return 0; }
  });
  const [streak, setStreak] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('archlab-streak') || '{}');
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (data.lastDate === today) return data.count || 1;
      if (data.lastDate === yesterday) return data.count || 1;
      return 0;
    } catch { return 0; }
  });

  // Celebration
  const [celebration, setCelebration] = useState<{ node: TopicNode; earnedXp: number } | null>(null);

  // Filters for resources view
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist progress
  useEffect(() => {
    localStorage.setItem('archlab-completed-nodes', JSON.stringify([...completedNodes]));
  }, [completedNodes]);

  useEffect(() => {
    localStorage.setItem('archlab-xp', String(xp));
  }, [xp]);

  // Load resources from API
  useEffect(() => {
    async function load() {
      try {
        const r = await getResources();
        setResources(r.length > 0 ? r : MOCK_RESOURCES);
      } catch {
        setResources(MOCK_RESOURCES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Update streak on activity
  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    try {
      const data = JSON.parse(localStorage.getItem('archlab-streak') || '{}');
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let newCount = 1;
      if (data.lastDate === today) {
        newCount = data.count || 1; // Already active today
      } else if (data.lastDate === yesterday) {
        newCount = (data.count || 0) + 1;
      }
      localStorage.setItem('archlab-streak', JSON.stringify({ lastDate: today, count: newCount }));
      setStreak(newCount);
    } catch { /* ignore */ }
  }, []);

  // Computed
  const totalNodes = LEARNING_PHASES.reduce((sum, p) => sum + p.nodes.length, 0);
  const completedCount = completedNodes.size;
  const progressPercent = Math.round((completedCount / totalNodes) * 100);
  const level = Math.floor(xp / 500) + 1;

  // Handle completing a node
  const handleCompleteNode = useCallback((node: TopicNode) => {
    if (completedNodes.has(node.id)) return;

    const earnedXp = node.xp;
    setCompletedNodes((prev) => new Set([...prev, node.id]));
    setXp((prev) => prev + earnedXp);
    updateStreak();

    // Show celebration
    setCelebration({ node, earnedXp });
    setTimeout(() => setCelebration(null), 3000);
  }, [completedNodes, updateStreak]);

  // Handle quiz answer
  const handleQuizAnswer = useCallback((nodeId: string, questionIdx: number, answerIdx: number) => {
    const key = `${nodeId}-${questionIdx}`;
    if (quizRevealed[key]) return; // Already answered
    setQuizAnswers((prev) => ({ ...prev, [key]: answerIdx }));
    setQuizRevealed((prev) => ({ ...prev, [key]: true }));
  }, [quizRevealed]);

  // Get node status
  const getNodeStatus = useCallback((nodeId: string, phaseIndex: number, nodeIndex: number) => {
    if (completedNodes.has(nodeId)) return 'completed';

    // Find the first incomplete node globally — that's the "current" one
    for (let pi = 0; pi < LEARNING_PHASES.length; pi++) {
      for (let ni = 0; ni < LEARNING_PHASES[pi].nodes.length; ni++) {
        if (!completedNodes.has(LEARNING_PHASES[pi].nodes[ni].id)) {
          if (pi === phaseIndex && ni === nodeIndex) return 'current';
          if (pi < phaseIndex || (pi === phaseIndex && ni < nodeIndex)) return 'current'; // All unlocked up to current
          return 'locked';
        }
      }
    }
    return 'current';
  }, [completedNodes]);

  // Filter resources
  const filteredResources = resources.filter((r) => {
    const matchesDifficulty = filterDifficulty === 'all' || r.difficulty === filterDifficulty;
    const matchesType = filterType === 'all' || r.source_type === filterType;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesType && matchesSearch;
  });

  const handleMarkComplete = async (resourceId: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await markResourceComplete(resourceId);
      setResources((prev) => prev.map((r) =>
        r.id === resourceId ? { ...r, user_status: 'completed' as const } : r
      ));
    } catch { /* ignore */ }
  };

  const formatTime = (mins: number | null) => {
    if (!mins) return null;
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`;
  };

  return (
    <div className="learn-page">
      {/* Header */}
      <header className="learn-header">
        <div className="learn-header-left">
          <BrandLogo size="md" onClick={() => navigate('/')} />
          <span className="learn-badge">Learn</span>
        </div>
        <div className="learn-header-right">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/challenges')}>
            <HugeiconsIcon icon={TrophyIcon} size={14} /> Challenges
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
            Back to Studio
          </button>
        </div>
      </header>

      <main className="learn-content">
        {loading ? (
          <div className="learn-loading">
            <HugeiconsIcon icon={SparklesIcon} size={24} className="animate-pulse" />
            <p>Loading your learning path...</p>
          </div>
        ) : (
          <>
            {/* Hero */}
            <section className="learn-hero">
              <h1 className="learn-hero-title">
                <HugeiconsIcon icon={GraduationCapIcon} size={28} />
                System Design Mastery
              </h1>
              <p className="learn-hero-subtitle">
                A structured, interactive learning path from networking basics to designing
                systems used by billions. Learn concepts, test yourself with quizzes, and earn XP.
              </p>

              {/* Gamification Stats */}
              <div className="learn-gamification">
                <div className="learn-gam-stat">
                  <HugeiconsIcon icon={FlashIcon} size={16} className="gam-xp" />
                  <span>{xp} XP</span>
                </div>
                <div className="learn-gam-stat">
                  <HugeiconsIcon icon={FireIcon} size={16} className="gam-streak" />
                  <span>{streak} day streak</span>
                </div>
                <div className="learn-gam-stat">
                  <HugeiconsIcon icon={Award01Icon} size={16} className="gam-level" />
                  <span>Level {level}</span>
                </div>
                <div className="learn-gam-stat">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="gam-completed" />
                  <span>{completedCount}/{totalNodes} topics</span>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="learn-progress-bar-wrap">
                <div className="learn-progress-label">
                  <span>Overall Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="learn-progress-track">
                  <div className="learn-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </section>

            {/* View Toggle */}
            <div className="learn-view-toggle">
              <button
                className={`learn-view-btn ${view === 'roadmap' ? 'active' : ''}`}
                onClick={() => setView('roadmap')}
              >
                <HugeiconsIcon icon={Compass01Icon} size={14} /> Learning Path
              </button>
              <button
                className={`learn-view-btn ${view === 'resources' ? 'active' : ''}`}
                onClick={() => setView('resources')}
              >
                <HugeiconsIcon icon={LayoutGridIcon} size={14} /> All Resources
              </button>
            </div>

            {/* ===== ROADMAP VIEW ===== */}
            {view === 'roadmap' && (
              <>
                <h2 className="learn-section-title">
                  <HugeiconsIcon icon={Compass01Icon} size={18} />
                  Your Learning Roadmap
                </h2>

                <div className="learn-roadmap">
                  {LEARNING_PHASES.map((phase, phaseIndex) => {
                    const phaseCompleted = phase.nodes.filter((n) => completedNodes.has(n.id)).length;
                    return (
                      <div key={phase.id} className="roadmap-phase">
                        <div className="roadmap-phase-header">
                          <div className="roadmap-phase-number" style={{
                            background: `linear-gradient(135deg, ${phase.accentColor}, var(--color-secondary))`
                          }}>
                            {phase.phaseNumber}
                          </div>
                          <div className="roadmap-phase-info">
                            <div className="roadmap-phase-title">{phase.title}</div>
                            <div className="roadmap-phase-subtitle">{phase.subtitle}</div>
                          </div>
                          <div className="roadmap-phase-progress">
                            {phaseCompleted}/{phase.nodes.length}
                          </div>
                        </div>

                        <div className="roadmap-nodes">
                          {phase.nodes.map((node, nodeIndex) => {
                            const status = getNodeStatus(node.id, phaseIndex, nodeIndex);
                            const isLocked = status === 'locked';
                            const isCompleted = status === 'completed';
                            const isCurrent = status === 'current';
                            const nodeIcon = ICON_MAP[node.icon] || BookOpen01Icon;

                            return (
                              <div
                                key={node.id}
                                className={`roadmap-node ${isCompleted ? 'node-completed' : ''} ${isCurrent ? 'node-active' : ''} ${isLocked ? 'node-locked' : ''}`}
                                style={{ '--node-accent': phase.accentColor } as React.CSSProperties}
                                onClick={() => {
                                  if (!isLocked) {
                                    setActiveNode(node);
                                    setActivePhase(phase);
                                  }
                                }}
                              >
                                <div className="roadmap-node-header">
                                  <div className="roadmap-node-icon">
                                    <HugeiconsIcon icon={nodeIcon} size={16} />
                                  </div>
                                  <span className={`roadmap-node-status ${isCompleted ? 'status-completed' : isCurrent ? 'status-current' : 'status-locked'}`}>
                                    {isCompleted ? (
                                      <><HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} /> Done</>
                                    ) : isCurrent ? (
                                      <><HugeiconsIcon icon={SparklesIcon} size={10} /> Start</>
                                    ) : (
                                      <><HugeiconsIcon icon={SecurityLockIcon} size={10} /> Locked</>
                                    )}
                                  </span>
                                </div>

                                <h4 className="roadmap-node-title">{node.title}</h4>
                                <p className="roadmap-node-desc">{node.description}</p>

                                <div className="roadmap-node-meta">
                                  <span><HugeiconsIcon icon={Clock01Icon} size={10} /> {node.estimatedMinutes}m</span>
                                  <span>{node.quiz.length} quiz Q</span>
                                  <span className="roadmap-node-xp"><HugeiconsIcon icon={FlashIcon} size={10} /> {node.xp} XP</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ===== RESOURCES VIEW ===== */}
            {view === 'resources' && (
              <div className="learn-resources-section">
                <h2 className="learn-section-title" style={{ padding: 0, marginBottom: 'var(--space-4)' }}>
                  <HugeiconsIcon icon={BookOpen01Icon} size={18} />
                  Curated Resources
                </h2>

                {/* Filters */}
                <section className="learn-filters">
                  <div className="learn-filter-group">
                    <HugeiconsIcon icon={FilterIcon} size={14} />
                    {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map((d) => (
                      <button
                        key={d}
                        className={`filter-btn ${filterDifficulty === d ? 'active' : ''}`}
                        onClick={() => setFilterDifficulty(d)}
                      >
                        {d === 'all' ? 'All Levels' : DIFFICULTY_CONFIG[d]?.label || d}
                      </button>
                    ))}
                  </div>
                  <div className="learn-filter-group">
                    {['all', 'github', 'article', 'video', 'documentation', 'course'].map((t) => (
                      <button
                        key={t}
                        className={`filter-btn ${filterType === t ? 'active' : ''}`}
                        onClick={() => setFilterType(t)}
                      >
                        {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="learn-search">
                    <HugeiconsIcon icon={Search01Icon} size={14} />
                    <input
                      type="text"
                      className="input"
                      placeholder="Search resources or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </section>

                {/* Resources Grid */}
                <section className="learn-resources-grid">
                  {filteredResources.length === 0 ? (
                    <div className="learn-empty">
                      <HugeiconsIcon icon={Search01Icon} size={24} />
                      <p>No resources match your filters.</p>
                    </div>
                  ) : (
                    filteredResources.map((resource) => {
                      const diffConfig = DIFFICULTY_CONFIG[resource.difficulty] || DIFFICULTY_CONFIG.beginner;
                      const sourceIcon = SOURCE_ICONS[resource.source_type] || BookOpen01Icon;
                      return (
                        <article key={resource.id} className="learn-resource-card" style={{
                          '--card-accent': diffConfig.color,
                        } as React.CSSProperties}>
                          <div className="learn-resource-header">
                            <span className="learn-resource-type">
                              <HugeiconsIcon icon={sourceIcon} size={14} />
                              {resource.source_type}
                            </span>
                            <span className="learn-resource-difficulty" style={{ color: diffConfig.color }}>
                              {diffConfig.label}
                            </span>
                          </div>

                          <h3 className="learn-resource-title">{resource.title}</h3>
                          <p className="learn-resource-desc">{resource.description}</p>

                          {resource.author_name && (
                            <p className="learn-resource-author">by {resource.author_name}</p>
                          )}

                          <div className="learn-resource-meta">
                            {resource.github_stars && (
                              <span><HugeiconsIcon icon={StarIcon} size={11} /> {(resource.github_stars / 1000).toFixed(0)}k</span>
                            )}
                            {resource.estimated_time_minutes && (
                              <span><HugeiconsIcon icon={Clock01Icon} size={11} /> {formatTime(resource.estimated_time_minutes)}</span>
                            )}
                          </div>

                          {resource.topics.length > 0 && (
                            <div className="learn-resource-topics">
                              {resource.topics.slice(0, 3).map((t) => (
                                <span key={t} className="learn-topic-tag">{t}</span>
                              ))}
                            </div>
                          )}

                          <div className="learn-resource-actions">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open <HugeiconsIcon icon={LinkSquare01Icon} size={12} />
                            </a>
                            {resource.user_status === 'completed' ? (
                              <span className="learn-resource-completed">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} /> Done
                              </span>
                            ) : (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleMarkComplete(resource.id)}
                              >
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} /> Mark Done
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </main>

      {/* ===== TOPIC PANEL (Slide-in) ===== */}
      {activeNode && activePhase && (
        <>
          <div className="learn-topic-overlay" onClick={() => { setActiveNode(null); setActivePhase(null); }} />
          <div className="learn-topic-panel">
            <div className="topic-panel-header">
              <div className="topic-panel-title-wrap">
                <div className="topic-panel-icon" style={{
                  background: `color-mix(in srgb, ${activePhase.accentColor} 15%, transparent)`,
                  color: activePhase.accentColor,
                }}>
                  <HugeiconsIcon icon={ICON_MAP[activeNode.icon] || BookOpen01Icon} size={20} />
                </div>
                <div>
                  <div className="topic-panel-title">{activeNode.title}</div>
                  <div className="topic-panel-phase">Phase {activePhase.phaseNumber}: {activePhase.title}</div>
                </div>
              </div>
              <button className="topic-panel-close" onClick={() => { setActiveNode(null); setActivePhase(null); }}>
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            <div className="topic-panel-body">
              {/* XP Badge */}
              <div className="topic-xp-badge">
                <HugeiconsIcon icon={FlashIcon} size={12} /> {activeNode.xp} XP · {activeNode.estimatedMinutes} min read
              </div>

              {/* Key Concepts */}
              <div className="topic-section">
                <h3 className="topic-section-title">
                  <HugeiconsIcon icon={BulbIcon} size={14} /> Key Concepts
                </h3>
                <div className="topic-concepts">
                  {activeNode.concepts.map((concept, i) => (
                    <div key={i} className="topic-concept">
                      <HugeiconsIcon icon={Target01Icon} size={14} />
                      <span>{concept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz */}
              {activeNode.quiz.length > 0 && (
                <div className="topic-section">
                  <h3 className="topic-section-title">
                    <HugeiconsIcon icon={Brain01Icon} size={14} /> Quick Quiz
                  </h3>
                  <div className="topic-quiz">
                    {activeNode.quiz.map((q, qIdx) => {
                      const key = `${activeNode.id}-${qIdx}`;
                      const selectedAnswer = quizAnswers[key];
                      const isRevealed = quizRevealed[key];
                      const isCorrect = selectedAnswer === q.correctIndex;

                      return (
                        <div key={qIdx} className="quiz-question">
                          <div className="quiz-question-number">Question {qIdx + 1} of {activeNode.quiz.length}</div>
                          <div className="quiz-question-text">{q.question}</div>
                          <div className="quiz-options">
                            {q.options.map((opt, oIdx) => {
                              let optClass = 'quiz-option';
                              if (isRevealed) {
                                if (oIdx === q.correctIndex) optClass += ' quiz-correct';
                                else if (oIdx === selectedAnswer && !isCorrect) optClass += ' quiz-wrong';
                              } else if (selectedAnswer === oIdx) {
                                optClass += ' quiz-selected';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  className={optClass}
                                  onClick={() => handleQuizAnswer(activeNode.id, qIdx, oIdx)}
                                  disabled={isRevealed}
                                >
                                  <span className="quiz-option-letter">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {isRevealed && (
                            <div className="quiz-explanation">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, marginRight: 6 }}>
                                {isCorrect ? (
                                  <>
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} primaryColor="var(--color-success)" />
                                    Correct!
                                  </>
                                ) : (
                                  <>
                                    <HugeiconsIcon icon={Cancel01Icon} size={14} primaryColor="var(--color-danger)" />
                                    Not quite.
                                  </>
                                )}
                              </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Quiz Score */}
                    {activeNode.quiz.every((_, i) => quizRevealed[`${activeNode.id}-${i}`]) && (
                      <div className="quiz-score">
                        <HugeiconsIcon icon={TrophyIcon} size={16} />
                        Quiz Complete! {activeNode.quiz.filter((q, i) => quizAnswers[`${activeNode.id}-${i}`] === q.correctIndex).length}/{activeNode.quiz.length} correct
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resources */}
              {activeNode.resources.length > 0 && (
                <div className="topic-section">
                  <h3 className="topic-section-title">
                    <HugeiconsIcon icon={BookOpen01Icon} size={14} /> Resources
                  </h3>
                  <div className="topic-resources">
                    {activeNode.resources.map((res, i) => {
                      const srcIcon = SOURCE_ICONS[res.type] || LinkSquare01Icon;
                      return (
                        <a
                          key={i}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="topic-resource-link"
                        >
                          <div className="topic-resource-icon">
                            <HugeiconsIcon icon={srcIcon} size={14} />
                          </div>
                          <div className="topic-resource-info">
                            <div className="topic-resource-name">{res.title}</div>
                            <div className="topic-resource-author">by {res.author}</div>
                          </div>
                          <HugeiconsIcon icon={ChevronRightIcon} size={14} className="topic-resource-arrow" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Complete Button */}
            <div className="topic-panel-footer">
              {completedNodes.has(activeNode.id) ? (
                <button className="topic-complete-btn completed">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} /> Completed
                </button>
              ) : (
                <button
                  className="topic-complete-btn"
                  onClick={() => {
                    handleCompleteNode(activeNode);
                    // Close panel after a brief delay
                    setTimeout(() => { setActiveNode(null); setActivePhase(null); }, 500);
                  }}
                >
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} /> Mark as Complete & Earn {activeNode.xp} XP
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== CELEBRATION OVERLAY ===== */}
      {celebration && (
        <>
          <Confetti />
          <div className="celebration-overlay">
            <div className="celebration-content">
              <div className="celebration-badge" style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(234,179,8,0.25), rgba(249,115,22,0.35))',
                border: '1px solid rgba(234,179,8,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#eab308',
                boxShadow: '0 0 24px rgba(234,179,8,0.4)',
              }}>
                <HugeiconsIcon icon={TrophyIcon} size={36} />
              </div>
              <div className="celebration-title">Topic Mastered!</div>
              <div className="celebration-xp">+{celebration.earnedXp} XP earned</div>
              <div className="celebration-sub">{celebration.node.title}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
