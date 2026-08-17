"""
AI Architecture Analyzer — Enhanced Edition
=============================================
Analyzes system designs and provides structured feedback.

ENHANCEMENTS over MVP:
- 25+ design rules covering scalability, reliability, performance, security,
  cost, and maintainability
- Design pattern recognition (CQRS, Event-Driven, Saga, etc.)
- Complexity scoring based on component count, connection density, depth
- Contextual suggestions inspired by system design best practices
"""

import os
import json
import urllib.request


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

# Known system design patterns — we detect these automatically
KNOWN_PATTERNS = {
    'cqrs': {
        'name': 'CQRS (Command Query Responsibility Segregation)',
        'description': 'Separate read and write models for better scalability.',
        'required_components': {'database_sql', 'database_nosql'},  # Two different DB types
        'min_db_count': 2,
    },
    'event_driven': {
        'name': 'Event-Driven Architecture',
        'description': 'Components communicate asynchronously via events/messages.',
        'required_components': {'message_queue', 'worker'},
    },
    'api_gateway_pattern': {
        'name': 'API Gateway Pattern',
        'description': 'Single entry point for all client requests with routing, auth, and rate limiting.',
        'required_components': {'api_gateway'},
    },
    'cache_aside': {
        'name': 'Cache-Aside Pattern',
        'description': 'Application checks cache first, falls back to database on cache miss.',
        'required_components': {'cache'},
        'needs_db': True,
    },
    'cdn_static': {
        'name': 'Static Content Delivery',
        'description': 'Static content cached at edge locations for low-latency global delivery.',
        'required_components': {'cdn'},
    },
    'microservices': {
        'name': 'Microservices Architecture',
        'description': 'Application split into small, independently deployable services.',
        'min_microservices': 3,
    },
}


def _build_adjacency(nodes, edges):
    """Build adjacency lists and node lookup maps."""
    node_map = {}
    for node in nodes:
        node_id = node.get('id', '')
        node_data = node.get('data', {})
        comp_type = node_data.get('componentType', node.get('type', 'unknown'))
        node_map[node_id] = {
            'type': comp_type,
            'label': node_data.get('label', ''),
            'data': node_data,
        }

    # Forward and reverse adjacency
    forward = {}  # who does this node connect TO
    reverse = {}  # who connects TO this node
    for edge in edges:
        src = edge.get('source', '')
        tgt = edge.get('target', '')
        forward.setdefault(src, []).append(tgt)
        reverse.setdefault(tgt, []).append(src)

    return node_map, forward, reverse


def _count_types(node_map):
    """Count components by type."""
    type_counts = {}
    for node_id, info in node_map.items():
        ct = info['type']
        type_counts[ct] = type_counts.get(ct, 0) + 1
    return type_counts


def _detect_patterns(type_counts, node_map):
    """Detect known system design patterns in the architecture."""
    detected = []

    # CQRS: Multiple different database types
    has_sql = 'database_sql' in type_counts
    has_nosql = 'database_nosql' in type_counts
    total_dbs = type_counts.get('database_sql', 0) + type_counts.get('database_nosql', 0)
    if has_sql and has_nosql and total_dbs >= 2:
        detected.append(KNOWN_PATTERNS['cqrs'])

    # Event-Driven: Message queue + workers
    if 'message_queue' in type_counts and 'worker' in type_counts:
        detected.append(KNOWN_PATTERNS['event_driven'])

    # API Gateway Pattern
    if 'api_gateway' in type_counts:
        detected.append(KNOWN_PATTERNS['api_gateway_pattern'])

    # Cache-Aside: Cache + any database
    if 'cache' in type_counts and (has_sql or has_nosql):
        detected.append(KNOWN_PATTERNS['cache_aside'])

    # CDN for static content
    if 'cdn' in type_counts:
        detected.append(KNOWN_PATTERNS['cdn_static'])

    # Microservices: 3+ microservice components
    if type_counts.get('microservice', 0) >= 3:
        detected.append(KNOWN_PATTERNS['microservices'])

    return detected


def _check_connectivity(node_map, forward, reverse):
    """Check for disconnected components (islands in the graph)."""
    if not node_map:
        return []

    all_ids = set(node_map.keys())
    visited = set()

    # BFS from first node
    start = next(iter(all_ids))
    queue = [start]
    while queue:
        current = queue.pop(0)
        if current in visited:
            continue
        visited.add(current)
        for neighbor in forward.get(current, []):
            if neighbor not in visited:
                queue.append(neighbor)
        for neighbor in reverse.get(current, []):
            if neighbor not in visited:
                queue.append(neighbor)

    disconnected = all_ids - visited
    return list(disconnected)


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
            categories: {scalability, reliability, performance, cost, security, maintainability},
            patterns_detected: [{name, description}],
            component_count: int,
            connection_count: int,
        }
    """
    if not nodes:
        return {
            'score': 0,
            'issues': [{'severity': 'critical', 'title': 'Empty Design', 'description': 'No components found.', 'suggestion': 'Start by adding a client and a server.'}],
            'positives': [],
            'categories': {cat: 0 for cat in ['scalability', 'reliability', 'performance', 'cost', 'security', 'maintainability']},
            'patterns_detected': [],
            'component_count': 0,
            'connection_count': 0,
        }

    # Build analysis structures
    node_map, forward, reverse = _build_adjacency(nodes, edges)
    type_counts = _count_types(node_map)

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

    # =========================================================================
    # RULE 1: Has a database?
    # =========================================================================
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

    # =========================================================================
    # RULE 2: Load Balancer
    # =========================================================================
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

    # =========================================================================
    # RULE 3: Cache
    # =========================================================================
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

    # =========================================================================
    # RULE 4: Single Point of Failure — Database
    # =========================================================================
    total_db_count = type_counts.get('database_sql', 0) + type_counts.get('database_nosql', 0)
    if total_db_count == 1:
        issues.append({
            'severity': 'warning',
            'title': 'Single Point of Failure — Database',
            'description': 'You have only one database instance. If it goes down, the entire system fails.',
            'suggestion': 'Add a read replica with async replication for high availability. Consider primary-replica setup.',
        })
        categories['reliability'] -= 2

    # =========================================================================
    # RULE 5: Message Queue for async
    # =========================================================================
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

    # =========================================================================
    # RULE 6: CDN
    # =========================================================================
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

    # =========================================================================
    # RULE 7: Security components
    # =========================================================================
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

    # =========================================================================
    # RULE 8: Monitoring
    # =========================================================================
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

    # =========================================================================
    # RULE 9: Client/Entry Point check
    # =========================================================================
    has_client = 'client' in type_counts
    if not has_client:
        issues.append({
            'severity': 'info',
            'title': 'No Client/Entry Point',
            'description': 'Your design doesn\'t show where user requests originate from.',
            'suggestion': 'Add a Client component (web browser, mobile app) to show the full request flow.',
        })

    # =========================================================================
    # RULE 10: DNS check
    # =========================================================================
    has_dns = 'dns' in type_counts
    if has_client and not has_dns and has_lb:
        issues.append({
            'severity': 'info',
            'title': 'Missing DNS Layer',
            'description': 'Clients need DNS to resolve your service\'s domain name.',
            'suggestion': 'Add a DNS component (Route53, Cloudflare DNS) for domain resolution and geo-routing.',
        })

    # =========================================================================
    # RULE 11: Worker without Message Queue
    # =========================================================================
    has_worker = 'worker' in type_counts
    if has_worker and not has_queue:
        issues.append({
            'severity': 'warning',
            'title': 'Worker Without Message Queue',
            'description': 'Workers need a message queue to receive tasks. Without one, how do they know what to process?',
            'suggestion': 'Add a Message Queue (SQS, RabbitMQ, Kafka) between your servers and workers.',
        })
        categories['reliability'] -= 1

    # =========================================================================
    # RULE 12: Object Storage
    # =========================================================================
    has_object_storage = 'object_storage' in type_counts
    if has_cdn and not has_object_storage:
        issues.append({
            'severity': 'info',
            'title': 'CDN Without Object Storage',
            'description': 'Your CDN needs an origin store for static assets (images, videos, files).',
            'suggestion': 'Add Object Storage (S3, GCS) as the origin for your CDN.',
        })

    # =========================================================================
    # RULE 13: Notification service without Message Queue
    # =========================================================================
    has_notification = 'notification' in type_counts
    if has_notification and not has_queue:
        issues.append({
            'severity': 'info',
            'title': 'Notification Service Without Queue',
            'description': 'Notifications should be sent asynchronously to avoid blocking user requests.',
            'suggestion': 'Add a Message Queue to decouple notification sending from the main request path.',
        })

    # =========================================================================
    # RULE 14: Search engine connection check
    # =========================================================================
    has_search = 'search' in type_counts
    if has_search and not has_any_db:
        issues.append({
            'severity': 'warning',
            'title': 'Search Engine Without Data Source',
            'description': 'Your search engine needs a database to index data from.',
            'suggestion': 'Add a database and set up a data pipeline to keep the search index in sync.',
        })

    # =========================================================================
    # RULE 15: Over-provisioning warning (cost)
    # =========================================================================
    if server_count > 5:
        issues.append({
            'severity': 'info',
            'title': 'Consider Auto-Scaling',
            'description': f'You have {server_count} server instances. Static provisioning can be expensive.',
            'suggestion': 'Instead of fixed server counts, consider auto-scaling groups that scale based on demand.',
        })
        categories['cost'] -= 1

    # =========================================================================
    # RULE 16: Multiple databases of same type
    # =========================================================================
    if type_counts.get('database_sql', 0) >= 2:
        positives.append({
            'title': 'Database Replication',
            'description': 'Multiple SQL databases suggest read replicas — great for read-heavy workloads.',
        })
        categories['reliability'] += 1
        categories['scalability'] += 1

    if type_counts.get('database_nosql', 0) >= 2:
        positives.append({
            'title': 'NoSQL Clustering',
            'description': 'Multiple NoSQL instances suggest distributed data storage.',
        })
        categories['reliability'] += 1

    # =========================================================================
    # RULE 17: Disconnected components
    # =========================================================================
    disconnected = _check_connectivity(node_map, forward, reverse)
    if disconnected and len(edges) > 0:
        disconnected_names = []
        for nid in disconnected[:3]:  # Show max 3
            info = node_map.get(nid, {})
            disconnected_names.append(info.get('label', nid))

        issues.append({
            'severity': 'warning',
            'title': 'Disconnected Components',
            'description': f'Some components are not connected to the rest of the system: {", ".join(disconnected_names)}.',
            'suggestion': 'Connect all components with edges to show the data/request flow.',
        })
        categories['maintainability'] -= 1

    # =========================================================================
    # RULE 18: No edges at all
    # =========================================================================
    if len(edges) == 0 and len(nodes) > 1:
        issues.append({
            'severity': 'critical',
            'title': 'No Connections Between Components',
            'description': 'Your components exist but aren\'t connected. The system design must show how data flows.',
            'suggestion': 'Draw edges between components to show request/data flow (e.g., Client → API Gateway → Service → Database).',
        })
        categories['maintainability'] -= 3

    # =========================================================================
    # RULE 19: API Gateway without backend services
    # =========================================================================
    if has_api_gateway:
        gw_nodes = [nid for nid, info in node_map.items() if info['type'] == 'api_gateway']
        gw_has_downstream = any(forward.get(nid, []) for nid in gw_nodes)
        if not gw_has_downstream:
            issues.append({
                'severity': 'warning',
                'title': 'API Gateway Without Downstream Services',
                'description': 'Your API Gateway doesn\'t route to any backend services.',
                'suggestion': 'Connect the API Gateway to your microservices or web servers.',
            })

    # =========================================================================
    # RULE 20: Load Balancer without downstream servers
    # =========================================================================
    if has_lb:
        lb_nodes = [nid for nid, info in node_map.items() if info['type'] == 'load_balancer']
        lb_has_downstream = any(forward.get(nid, []) for nid in lb_nodes)
        if not lb_has_downstream:
            issues.append({
                'severity': 'warning',
                'title': 'Load Balancer Without Downstream Servers',
                'description': 'Your Load Balancer isn\'t connected to any servers to distribute traffic to.',
                'suggestion': 'Connect the Load Balancer to your web servers or microservices.',
            })

    # =========================================================================
    # RULE 21: Database directly connected to client
    # =========================================================================
    if has_client and has_any_db:
        client_nodes = [nid for nid, info in node_map.items() if info['type'] == 'client']
        db_types = {'database_sql', 'database_nosql'}
        for client_id in client_nodes:
            for target_id in forward.get(client_id, []):
                target_info = node_map.get(target_id, {})
                if target_info.get('type') in db_types:
                    issues.append({
                        'severity': 'critical',
                        'title': 'Client Directly Connected to Database',
                        'description': 'Clients should never connect directly to databases — this is a massive security risk.',
                        'suggestion': 'Add an API server or API Gateway between the client and database. Never expose your database to the internet.',
                    })
                    categories['security'] -= 3
                    break

    # =========================================================================
    # RULE 22: Single compute instance (no horizontal scaling)
    # =========================================================================
    if server_count == 1 and not has_lb:
        issues.append({
            'severity': 'info',
            'title': 'Single Server Instance',
            'description': 'A single server is a bottleneck and single point of failure.',
            'suggestion': 'Add a second server instance behind a load balancer for horizontal scaling and high availability.',
        })

    # =========================================================================
    # RULE 23: Cache without expiry strategy note
    # =========================================================================
    if has_cache and total_db_count > 1:
        positives.append({
            'title': 'Distributed Data Layer',
            'description': 'Good combination of caching + multiple databases for high-throughput data access.',
        })
        categories['performance'] += 1

    # =========================================================================
    # RULE 24: Both SQL and NoSQL (polyglot persistence)
    # =========================================================================
    if has_sql_db and has_nosql_db:
        positives.append({
            'title': 'Polyglot Persistence',
            'description': 'Using both SQL and NoSQL databases — picking the right tool for each data model. Advanced!',
        })
        categories['maintainability'] += 1

    # =========================================================================
    # RULE 25: Full security stack
    # =========================================================================
    if has_auth and has_rate_limiter and has_api_gateway:
        positives.append({
            'title': 'Complete Security Stack',
            'description': 'Auth + Rate Limiter + API Gateway — your system has defense in depth. Excellent security posture!',
        })
        categories['security'] += 2

    # =========================================================================
    # Detect patterns
    # =========================================================================
    patterns_detected = _detect_patterns(type_counts, node_map)
    if patterns_detected:
        for pattern in patterns_detected:
            positives.append({
                'title': f'Pattern: {pattern["name"]}',
                'description': pattern['description'],
            })
        categories['maintainability'] += min(len(patterns_detected), 3)

    # =========================================================================
    # Calculate overall score
    # =========================================================================
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

    # Bonus points for complexity (more thoughtful design)
    if len(nodes) >= 8:
        total_score = min(100, total_score + 5)
    if len(edges) >= 10:
        total_score = min(100, total_score + 5)
    if len(patterns_detected) >= 2:
        total_score = min(100, total_score + 3)

    # =========================================================================
    # Enhance with Nematron/Nvidia API LLM Insights
    # =========================================================================
    nemotron_insights = _get_nemotron_insights(nodes, edges)
    if nemotron_insights:
        if 'issues' in nemotron_insights:
            issues.extend(nemotron_insights['issues'])
        if 'positives' in nemotron_insights:
            positives.extend(nemotron_insights['positives'])

    return {
        'score': total_score,
        'issues': sorted(issues, key=lambda x: {'critical': 0, 'warning': 1, 'info': 2}.get(x.get('severity', 'info'), 3)),
        'positives': positives,
        'categories': categories,
        'patterns_detected': [{'name': p['name'], 'description': p['description']} for p in patterns_detected],
        'component_count': len(nodes),
        'connection_count': len(edges),
    }


def _get_nemotron_insights(nodes, edges):
    """
    Call the Nvidia Nemotron API to get advanced insights on the architecture.
    """
    api_key = os.getenv('NVIDIA_API_KEY')
    if not api_key:
        return None

    if len(nodes) < 2:
        return None  # Too simple for LLM to provide meaningful advice

    # Create a concise summary of the architecture for the LLM
    comp_details = []
    node_lookup = {}
    for n in nodes:
        node_id = n.get('id', '')
        data = n.get('data', {})
        label = data.get('label', 'Unnamed')
        ctype = data.get('componentType', n.get('type', 'unknown'))
        comp_details.append(f"- {label} ({ctype})")
        node_lookup[node_id] = label

    conn_details = []
    for e in edges:
        src = node_lookup.get(e.get('source'), 'Unknown')
        tgt = node_lookup.get(e.get('target'), 'Unknown')
        conn_details.append(f"{src} -> {tgt}")

    system_prompt = (
        "You are an expert Cloud Architect and System Design Interviewer. "
        "Review the provided architecture topology. "
        "Provide exactly ONE deep architectural positive insight, and ONE advanced issue/warning. "
        "Focus on things beyond basic rules (e.g. edge-case scaling, security, data consistency, or advanced patterns). "
        "Return the response ONLY as valid JSON matching this schema:\n"
        "{\n"
        '  "positives": [{"title": "...", "description": "..."}],\n'
        '  "issues": [{"severity": "info", "title": "...", "description": "...", "suggestion": "..."}]\n'
        "}\n"
        "Do not include any other text or markdown formatting outside the JSON."
    )

    user_prompt = (
        f"Components:\n" + "\n".join(comp_details) +
        f"\n\nConnections:\n" + "\n".join(conn_details)
    )

    try:
        data = json.dumps({
            "model": "meta/llama-3.1-70b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 512,
        }).encode()

        req = urllib.request.Request(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
        )

        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            content = result['choices'][0]['message']['content']
            
            # Clean up markdown code blocks if the LLM adds them despite instructions
            if content.startswith('```json'):
                content = content[7:]
            if content.startswith('```'):
                content = content[3:]
            if content.endswith('```'):
                content = content[:-3]
                
            parsed = json.loads(content.strip())
            return parsed
            
    except Exception as e:
        print(f"Nemotron API Error: {e}")
        return None
