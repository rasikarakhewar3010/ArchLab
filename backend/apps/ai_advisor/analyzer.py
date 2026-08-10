"""
AI Architecture Analyzer
=========================
This module analyzes system designs and provides structured feedback.

HOW IT WORKS:
1. The frontend sends the design (nodes + edges) as JSON
2. We convert it into a human-readable description
3. We send that description to an AI (OpenAI/Claude) with a carefully crafted prompt
4. The AI returns structured feedback (score, issues, suggestions)
5. We parse and return it to the frontend

FOR NOW (MVP):
We use a RULE-BASED analyzer (no AI API needed yet).
This checks for common design patterns and anti-patterns:
- Single points of failure (no replicas)
- Missing caching layer
- No load balancer for multiple servers
- Missing message queue for async processing
- etc.

This lets you build and test the full flow WITHOUT needing an API key.
When you're ready, you just swap in the AI-powered analyzer.
"""

import json


# Component type definitions — these map to what's on the canvas
COMPONENT_TYPES = {
    'load_balancer': {'name': 'Load Balancer', 'category': 'networking'},
    'api_gateway': {'name': 'API Gateway', 'category': 'networking'},
    'web_server': {'name': 'Web Server', 'category': 'compute'},
    'microservice': {'name': 'Microservice', 'category': 'compute'},
    'database_sql': {'name': 'SQL Database', 'category': 'storage'},
    'database_nosql': {'name': 'NoSQL Database', 'category': 'storage'},
    'cache': {'name': 'Cache', 'category': 'storage'},
    'message_queue': {'name': 'Message Queue', 'category': 'async'},
    'cdn': {'name': 'CDN', 'category': 'networking'},
    'client': {'name': 'Client', 'category': 'frontend'},
    'auth_service': {'name': 'Auth Service', 'category': 'security'},
    'object_storage': {'name': 'Object Storage', 'category': 'storage'},
    'monitoring': {'name': 'Monitoring', 'category': 'operations'},
    'rate_limiter': {'name': 'Rate Limiter', 'category': 'security'},
    'worker': {'name': 'Worker Service', 'category': 'compute'},
    'notification': {'name': 'Notification Service', 'category': 'async'},
    'search': {'name': 'Search Engine', 'category': 'storage'},
    'dns': {'name': 'DNS', 'category': 'networking'},
}


def analyze_design(nodes, edges):
    """
    Analyze a system design and return structured feedback.
    
    Args:
        nodes: List of React Flow nodes (components)
        edges: List of React Flow edges (connections)
    
    Returns:
        dict: {
            score: int (0-100),
            issues: [{severity, title, description, suggestion}],
            positives: [{title, description}],
            categories: {scalability, reliability, performance, cost, security, maintainability}
        }
    """
    if not nodes:
        return {
            'score': 0,
            'issues': [{'severity': 'critical', 'title': 'Empty Design', 'description': 'No components found.', 'suggestion': 'Start by adding a client and a server.'}],
            'positives': [],
            'categories': {cat: 0 for cat in ['scalability', 'reliability', 'performance', 'cost', 'security', 'maintainability']},
        }

    # Extract component types from nodes
    component_types = []
    for node in nodes:
        node_data = node.get('data', {})
        comp_type = node_data.get('componentType', node.get('type', 'unknown'))
        component_types.append(comp_type)

    # Count components by type
    type_counts = {}
    for ct in component_types:
        type_counts[ct] = type_counts.get(ct, 0) + 1

    # Build adjacency from edges
    connections = {}
    for edge in edges:
        src = edge.get('source', '')
        tgt = edge.get('target', '')
        if src not in connections:
            connections[src] = []
        connections[src].append(tgt)

    issues = []
    positives = []
    categories = {
        'scalability': 5,
        'reliability': 5,
        'performance': 5,
        'cost': 7,
        'security': 5,
        'maintainability': 5,
    }

    # --- CHECKS ---

    # Check: Has a database?
    has_sql_db = 'database_sql' in type_counts
    has_nosql_db = 'database_nosql' in type_counts
    has_any_db = has_sql_db or has_nosql_db

    if not has_any_db:
        issues.append({
            'severity': 'critical',
            'title': 'No Database',
            'description': 'Your design has no data storage. Where will you persist data?',
            'suggestion': 'Add a SQL database (PostgreSQL) or NoSQL database (MongoDB) based on your data model.',
        })
        categories['reliability'] -= 3

    # Check: Load Balancer
    has_lb = 'load_balancer' in type_counts
    server_count = type_counts.get('web_server', 0) + type_counts.get('microservice', 0)

    if server_count > 1 and not has_lb:
        issues.append({
            'severity': 'warning',
            'title': 'Multiple Servers Without Load Balancer',
            'description': f'You have {server_count} server(s) but no load balancer to distribute traffic.',
            'suggestion': 'Add a Load Balancer (e.g., Nginx, AWS ALB) in front of your servers.',
        })
        categories['scalability'] -= 2
    elif has_lb:
        positives.append({
            'title': 'Load Balancer Present',
            'description': 'Good — traffic is distributed across servers for horizontal scaling.',
        })
        categories['scalability'] += 2

    # Check: Cache
    has_cache = 'cache' in type_counts
    if has_any_db and not has_cache:
        issues.append({
            'severity': 'warning',
            'title': 'Missing Caching Layer',
            'description': 'Your servers hit the database on every read. At high traffic, the DB will be the bottleneck.',
            'suggestion': 'Add a Redis or Memcached cache between your servers and database. Use cache-aside pattern.',
        })
        categories['performance'] -= 2
    elif has_cache:
        positives.append({
            'title': 'Caching Layer Present',
            'description': 'Great — caching reduces database load and improves response times.',
        })
        categories['performance'] += 2

    # Check: Single Point of Failure (only one DB instance)
    total_db_count = type_counts.get('database_sql', 0) + type_counts.get('database_nosql', 0)
    if total_db_count == 1:
        issues.append({
            'severity': 'warning',
            'title': 'Single Point of Failure — Database',
            'description': 'You have only one database instance. If it goes down, the entire system fails.',
            'suggestion': 'Add a read replica with async replication for high availability. Consider primary-replica setup.',
        })
        categories['reliability'] -= 2

    # Check: Message Queue for async
    has_queue = 'message_queue' in type_counts
    if server_count >= 2 and not has_queue:
        issues.append({
            'severity': 'info',
            'title': 'Consider Async Processing',
            'description': 'For long-running tasks (email, notifications, image processing), synchronous processing will block your servers.',
            'suggestion': 'Add a Message Queue (Kafka, RabbitMQ, SQS) with Worker services for async processing.',
        })
    elif has_queue:
        positives.append({
            'title': 'Async Processing with Message Queue',
            'description': 'Excellent — async processing prevents blocking and improves system resilience.',
        })
        categories['scalability'] += 1
        categories['reliability'] += 1

    # Check: CDN
    has_cdn = 'cdn' in type_counts
    if not has_cdn:
        issues.append({
            'severity': 'info',
            'title': 'No CDN for Static Content',
            'description': 'Static assets (images, CSS, JS) are served directly from your servers.',
            'suggestion': 'Add a CDN (CloudFront, Cloudflare) to cache static content at edge locations globally.',
        })
    else:
        positives.append({
            'title': 'CDN for Content Delivery',
            'description': 'Static content is cached at edge locations for faster global delivery.',
        })
        categories['performance'] += 1

    # Check: Security components
    has_auth = 'auth_service' in type_counts
    has_rate_limiter = 'rate_limiter' in type_counts
    has_api_gateway = 'api_gateway' in type_counts

    if not has_auth and not has_api_gateway:
        issues.append({
            'severity': 'warning',
            'title': 'No Authentication/Authorization',
            'description': 'No auth service or API gateway found. Your endpoints may be unprotected.',
            'suggestion': 'Add an Auth Service (JWT/OAuth) or API Gateway that handles authentication.',
        })
        categories['security'] -= 2
    else:
        if has_auth:
            positives.append({'title': 'Auth Service', 'description': 'Authentication is properly separated as its own service.'})
            categories['security'] += 2
        if has_api_gateway:
            positives.append({'title': 'API Gateway', 'description': 'Centralized entry point for auth, rate limiting, and routing.'})
            categories['security'] += 1

    if has_rate_limiter:
        positives.append({'title': 'Rate Limiter', 'description': 'Protection against DDoS and API abuse.'})
        categories['security'] += 1

    # Check: Monitoring
    has_monitoring = 'monitoring' in type_counts
    if not has_monitoring:
        issues.append({
            'severity': 'info',
            'title': 'No Monitoring/Logging',
            'description': 'Without monitoring, you won\'t know when things break.',
            'suggestion': 'Add monitoring (Prometheus, Grafana, DataDog) and centralized logging (ELK stack).',
        })
        categories['maintainability'] -= 1
    else:
        positives.append({'title': 'Monitoring & Logging', 'description': 'Observability is in place for debugging and alerting.'})
        categories['maintainability'] += 2

    # Calculate overall score
    # Clamp category scores to 0-10
    for key in categories:
        categories[key] = max(0, min(10, categories[key]))

    # Overall score is weighted average of categories
    weights = {
        'scalability': 0.20,
        'reliability': 0.25,
        'performance': 0.20,
        'cost': 0.10,
        'security': 0.15,
        'maintainability': 0.10,
    }

    total_score = sum(categories[k] * weights[k] * 10 for k in categories)
    total_score = round(min(100, max(0, total_score)))

    # Bonus points for component count (more complex = more thought)
    if len(nodes) >= 8:
        total_score = min(100, total_score + 5)
    if len(edges) >= 10:
        total_score = min(100, total_score + 5)

    return {
        'score': total_score,
        'issues': sorted(issues, key=lambda x: {'critical': 0, 'warning': 1, 'info': 2}.get(x['severity'], 3)),
        'positives': positives,
        'categories': categories,
        'component_count': len(nodes),
        'connection_count': len(edges),
    }
