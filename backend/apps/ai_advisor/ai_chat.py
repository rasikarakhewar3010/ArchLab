"""
AI Chat Advisor
================
Provides contextual system design advice through a chat interface.

Supports two modes:
1. Rule-based: Curated responses from a knowledge base (no API key needed)
2. LLM-powered: Sends context to OpenAI/Claude for intelligent responses (requires API key)

The system design knowledge base is built from best practices documented in:
- System Design Primer (donne-martin)
- System Design 101 (ByteByteGoHq)
- Designing Data-Intensive Applications (Kleppmann)
"""

import os
import json


# ===== Knowledge Base =====
# Curated system design Q&A for rule-based responses

KNOWLEDGE_BASE = {
    'load_balancer': {
        'keywords': ['load balancer', 'load balancing', 'distribute traffic', 'nginx', 'alb', 'round robin'],
        'advice': (
            '**Load Balancer Best Practices:**\n\n'
            '• **Algorithm choices**: Round-robin (simple), Least connections (for varying request times), '
            'IP hash (for session affinity), Weighted (for heterogeneous servers)\n'
            '• **Health checks**: Configure active health checks (HTTP pings every 10-30s) so unhealthy servers '
            'are removed from the pool automatically\n'
            '• **Layer 4 vs Layer 7**: L4 (TCP) is faster but can\'t inspect content. L7 (HTTP) can route '
            'based on URL path, headers, or cookies\n'
            '• **Redundancy**: Use at least 2 load balancers with DNS failover to avoid a single point of failure\n'
            '• **Common tools**: AWS ALB/NLB, Nginx, HAProxy, Cloudflare Load Balancing'
        ),
    },
    'database': {
        'keywords': ['database', 'sql', 'nosql', 'postgres', 'mongodb', 'mysql', 'sharding', 'replication'],
        'advice': (
            '**Database Design Principles:**\n\n'
            '• **SQL vs NoSQL**: Use SQL (PostgreSQL, MySQL) for structured data with relationships. '
            'Use NoSQL (MongoDB, DynamoDB) for flexible schemas, high write throughput, or document-oriented data\n'
            '• **Replication**: Set up primary-replica for read-heavy workloads. Async replication is faster but '
            'may serve stale reads. Sync replication ensures consistency but adds latency\n'
            '• **Sharding**: Partition data across multiple databases when a single instance can\'t handle the load. '
            'Choose a shard key carefully — it determines data distribution and query routing\n'
            '• **Connection pooling**: Always use connection pools (PgBouncer for Postgres) to avoid the overhead '
            'of creating new connections per request\n'
            '• **Read-write splitting**: Route reads to replicas, writes to primary to maximize throughput'
        ),
    },
    'caching': {
        'keywords': ['cache', 'redis', 'memcached', 'caching', 'cache invalidation', 'ttl'],
        'advice': (
            '**Caching Strategies:**\n\n'
            '• **Cache-Aside (Lazy Loading)**: App checks cache first → miss → read DB → write to cache. '
            'Most common pattern, good for read-heavy workloads\n'
            '• **Write-Through**: Every write goes to both cache and DB. Ensures cache is always up-to-date '
            'but adds write latency\n'
            '• **Write-Behind (Write-Back)**: Writes go to cache only, then async flush to DB. Lowest latency '
            'but risk of data loss if cache crashes\n'
            '• **Cache Eviction**: Use LRU (Least Recently Used) for most cases. Set TTL (Time To Live) to '
            'prevent stale data — 5 min for hot data, 1 hour for semi-static\n'
            '• **Cache stampede prevention**: Use lock/lease mechanisms or probabilistic early expiration'
        ),
    },
    'message_queue': {
        'keywords': ['message queue', 'kafka', 'rabbitmq', 'sqs', 'pub sub', 'event', 'async'],
        'advice': (
            '**Message Queue Architecture:**\n\n'
            '• **When to use**: Email/SMS sending, image processing, analytics, any operation that can be '
            'deferred and doesn\'t need an immediate response\n'
            '• **Kafka vs RabbitMQ**: Kafka for high-throughput event streaming (10K+ msg/sec), log aggregation, '
            'and event sourcing. RabbitMQ for task queues and complex routing\n'
            '• **Dead letter queues**: Always set up DLQs for messages that fail processing — prevents data loss\n'
            '• **Idempotency**: Consumers must handle duplicate messages (at-least-once delivery). Use message '
            'IDs and idempotency keys\n'
            '• **Backpressure**: Monitor queue depth. If it grows faster than consumers process, add more workers'
        ),
    },
    'microservices': {
        'keywords': ['microservice', 'service', 'api', 'decomposition', 'domain', 'bounded context'],
        'advice': (
            '**Microservices Architecture:**\n\n'
            '• **Service boundaries**: Split by business domain (bounded contexts from DDD). Each service '
            'owns its data and can be deployed independently\n'
            '• **Communication**: Use REST/gRPC for synchronous calls, message queues for async. Avoid '
            'synchronous chains — they create cascading failures\n'
            '• **Data ownership**: Each microservice should own its database. No sharing databases between services. '
            'Use events to sync data across services\n'
            '• **API Gateway**: Always put an API Gateway in front. It handles routing, auth, rate limiting, '
            'and protocol translation\n'
            '• **Circuit Breaker**: Use circuit breakers (like Netflix Hystrix pattern) to prevent cascading failures'
        ),
    },
    'scalability': {
        'keywords': ['scale', 'scalability', 'horizontal', 'vertical', 'auto scaling', 'throughput'],
        'advice': (
            '**Scalability Patterns:**\n\n'
            '• **Horizontal vs Vertical**: Prefer horizontal scaling (add more machines) over vertical (bigger machine). '
            'Horizontal has no upper limit and provides redundancy\n'
            '• **Stateless services**: Make your services stateless — store session data in Redis, not in memory. '
            'Stateless services can scale horizontally without sticky sessions\n'
            '• **Database scaling**: Read replicas for read-heavy, sharding for write-heavy. Consider CQRS '
            'for mixed workloads\n'
            '• **Auto-scaling**: Set up auto-scaling based on CPU (>70%), memory (>80%), or custom metrics '
            '(request queue depth). Scale out fast, scale in slowly\n'
            '• **CDN for static content**: Offload static assets to CDN — reduces server load by 60-80%'
        ),
    },
    'security': {
        'keywords': ['security', 'auth', 'authentication', 'authorization', 'jwt', 'oauth', 'rate limit'],
        'advice': (
            '**Security Best Practices:**\n\n'
            '• **Authentication**: Use JWT for stateless auth, OAuth2 for social login. Store tokens in HttpOnly '
            'cookies (not localStorage) to prevent XSS\n'
            '• **Authorization**: Implement RBAC (Role-Based Access Control) or ABAC (Attribute-Based). '
            'Always validate permissions on the server, never trust the client\n'
            '• **Rate Limiting**: Apply at API Gateway level. Use token bucket or sliding window algorithms. '
            'Common limits: 100 req/min for authenticated, 20 req/min for anonymous\n'
            '• **Encryption**: TLS everywhere (HTTPS), encrypt data at rest (AES-256), hash passwords (bcrypt/argon2)\n'
            '• **Input validation**: Validate and sanitize ALL user input. Use parameterized queries to prevent SQL injection'
        ),
    },
    'reliability': {
        'keywords': ['reliability', 'availability', 'failover', 'redundancy', 'fault tolerance', 'disaster'],
        'advice': (
            '**Reliability & High Availability:**\n\n'
            '• **Redundancy**: No single points of failure. Minimum 2 instances of every critical component\n'
            '• **Health checks**: Implement liveness (is it running?) and readiness (can it serve traffic?) probes\n'
            '• **Circuit breakers**: When a downstream service fails, stop sending requests to it. '
            'Fail fast rather than hanging\n'
            '• **Graceful degradation**: If a non-critical service is down (recommendations, analytics), '
            'the main service should still work\n'
            '• **SLA math**: 99.9% uptime = 8.77 hours downtime/year. 99.99% = 52.6 min/year. '
            'Two services in series: 99.9% × 99.9% = 99.8%'
        ),
    },
    'general': {
        'keywords': [],
        'advice': (
            '**System Design Tips:**\n\n'
            '• Start with requirements — clarify functional and non-functional requirements before designing\n'
            '• Back-of-envelope estimation — calculate QPS, storage, and bandwidth needs\n'
            '• Design for the 99th percentile, not the average\n'
            '• Every design decision is a tradeoff — know what you\'re trading off\n'
            '• CAP theorem: In a distributed system, you can only guarantee 2 of 3: '
            'Consistency, Availability, Partition tolerance'
        ),
    },
}


def get_chat_response(message, design_context=None):
    """
    Generate a contextual response to a system design question.

    Args:
        message: The user's question/message
        design_context: Optional dict with current design state {nodes, edges}

    Returns:
        dict: {response: str, sources: [str], related_topics: [str]}
    """
    message_lower = message.lower()

    # Try LLM-powered response first (if API key is configured)
    llm_response = _try_llm_response(message, design_context)
    if llm_response:
        return llm_response

    # Fall back to rule-based knowledge base
    return _rule_based_response(message_lower, design_context)


def _try_llm_response(message, design_context):
    """
    Try to get a response from an LLM API (OpenAI or Anthropic).
    Returns None if no API key is configured.
    """
    openai_key = os.getenv('OPENAI_API_KEY')
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    nvidia_key = os.getenv('NVIDIA_API_KEY')

    if not openai_key and not anthropic_key and not nvidia_key:
        return None

    # Build context about the current design
    design_description = ""
    if design_context:
        nodes = design_context.get('nodes', [])
        edges = design_context.get('edges', [])
        components = []
        for node in nodes:
            data = node.get('data', {})
            components.append(f"- {data.get('label', 'Unknown')} ({data.get('componentType', 'unknown')})")
        if components:
            design_description = f"\n\nCurrent design has {len(nodes)} components and {len(edges)} connections:\n" + "\n".join(components)

    system_prompt = (
        "You are an expert system design architect and mentor. "
        "You help users design scalable, reliable, and efficient distributed systems. "
        "Provide specific, actionable advice with examples. "
        "Reference real-world systems (Netflix, Twitter, Uber) when relevant. "
        "Keep responses concise but thorough (200-400 words)."
    )

    user_prompt = f"{message}{design_description}"

    try:
        if nvidia_key:
            return _call_nemotron(nvidia_key, system_prompt, user_prompt)
        elif openai_key:
            return _call_openai(openai_key, system_prompt, user_prompt)
        elif anthropic_key:
            return _call_anthropic(anthropic_key, system_prompt, user_prompt)
    except Exception as e:
        print(f"LLM API Error: {e}")
        # If LLM call fails, fall back to rule-based
        return None

def _call_nemotron(api_key, system_prompt, user_prompt):
    """Call Nvidia Nemotron API."""
    import urllib.request
    
    data = json.dumps({
        "model": "meta/llama-3.1-70b-instruct",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": 800,
        "temperature": 0.7,
    }).encode()

    req = urllib.request.Request(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read())
        content = result['choices'][0]['message']['content']
        return {
            'response': content,
            'sources': ['Nvidia Nemotron 70B'],
            'related_topics': [],
            'powered_by': 'ai',
        }


def _call_openai(api_key, system_prompt, user_prompt):
    """Call OpenAI API."""
    import urllib.request

    data = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": 800,
        "temperature": 0.7,
    }).encode()

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read())
        content = result['choices'][0]['message']['content']
        return {
            'response': content,
            'sources': ['OpenAI GPT-4o-mini'],
            'related_topics': [],
            'powered_by': 'ai',
        }


def _call_anthropic(api_key, system_prompt, user_prompt):
    """Call Anthropic Claude API."""
    import urllib.request

    data = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 800,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": user_prompt},
        ],
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=data,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read())
        content = result['content'][0]['text']
        return {
            'response': content,
            'sources': ['Anthropic Claude'],
            'related_topics': [],
            'powered_by': 'ai',
        }


def _rule_based_response(message_lower, design_context):
    """Generate a response from the curated knowledge base."""

    best_match = None
    best_score = 0

    for topic_key, topic_data in KNOWLEDGE_BASE.items():
        if topic_key == 'general':
            continue
        score = sum(1 for kw in topic_data['keywords'] if kw in message_lower)
        if score > best_score:
            best_score = score
            best_match = topic_data

    # Add design-specific context if available
    design_note = ""
    if design_context:
        nodes = design_context.get('nodes', [])
        component_types = [n.get('data', {}).get('componentType', '') for n in nodes]
        if component_types:
            design_note = f"\n\n📋 *Based on your current design with {len(nodes)} components.*"

    if best_match and best_score > 0:
        related = _get_related_topics(message_lower)
        return {
            'response': best_match['advice'] + design_note,
            'sources': ['System Design Primer', 'ByteByteGoHq System Design 101'],
            'related_topics': related,
            'powered_by': 'knowledge_base',
        }

    # Default general advice
    return {
        'response': KNOWLEDGE_BASE['general']['advice'] + design_note,
        'sources': ['System Design Primer'],
        'related_topics': ['scalability', 'reliability', 'caching', 'databases'],
        'powered_by': 'knowledge_base',
    }


def _get_related_topics(message_lower):
    """Suggest related topics based on the current question."""
    related = []
    topic_map = {
        'load_balancer': 'Load Balancing',
        'database': 'Database Design',
        'caching': 'Caching Strategies',
        'message_queue': 'Message Queues',
        'microservices': 'Microservices',
        'scalability': 'Scalability',
        'security': 'Security',
        'reliability': 'Reliability',
    }

    for topic_key, topic_name in topic_map.items():
        topic_data = KNOWLEDGE_BASE.get(topic_key, {})
        if any(kw in message_lower for kw in topic_data.get('keywords', [])):
            continue  # Skip the current topic
        related.append(topic_name)

    return related[:4]  # Return top 4


def suggest_next_components(nodes, edges):
    """
    Given a partial design, suggest what components to add next.

    Returns:
        list: [{component_type, name, reason}]
    """
    component_types = set()
    for node in nodes:
        data = node.get('data', {})
        ct = data.get('componentType', node.get('type', ''))
        if ct:
            component_types.add(ct)

    suggestions = []

    # No client → suggest client
    if 'client' not in component_types:
        suggestions.append({
            'component_type': 'client',
            'name': 'Client',
            'reason': 'Every system needs an entry point. Add a client to show where requests originate.',
        })

    # Has client but no gateway/LB → suggest API gateway
    if 'client' in component_types and 'api_gateway' not in component_types and 'load_balancer' not in component_types:
        suggestions.append({
            'component_type': 'api_gateway',
            'name': 'API Gateway',
            'reason': 'Route client requests through a gateway for auth, rate limiting, and routing.',
        })

    # Has server but no database → suggest database
    server_types = {'web_server', 'microservice'}
    has_server = bool(component_types & server_types)
    has_db = 'database_sql' in component_types or 'database_nosql' in component_types
    if has_server and not has_db:
        suggestions.append({
            'component_type': 'database_sql',
            'name': 'SQL Database',
            'reason': 'Your servers need persistent storage. Add a database to store application data.',
        })

    # Has database but no cache → suggest cache
    if has_db and 'cache' not in component_types:
        suggestions.append({
            'component_type': 'cache',
            'name': 'Cache (Redis)',
            'reason': 'Add caching to reduce database load and improve response times.',
        })

    # Multiple services but no queue → suggest queue
    service_count = sum(1 for ct in component_types if ct in server_types)
    if service_count >= 2 and 'message_queue' not in component_types:
        suggestions.append({
            'component_type': 'message_queue',
            'name': 'Message Queue',
            'reason': 'Decouple services with async messaging for better reliability.',
        })

    # No monitoring → suggest monitoring
    if len(nodes) >= 4 and 'monitoring' not in component_types:
        suggestions.append({
            'component_type': 'monitoring',
            'name': 'Monitoring',
            'reason': 'Add observability to detect and debug issues in production.',
        })

    return suggestions[:4]  # Return top 4 suggestions
