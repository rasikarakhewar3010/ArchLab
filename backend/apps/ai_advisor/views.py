from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .analyzer import analyze_design
from .ai_chat import get_chat_response, suggest_next_components


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def analyze_architecture(request):
    """
    POST /api/ai/analyze/
    
    Analyze a system design and return structured feedback.
    
    Request body:
    {
        "nodes": [...],   // React Flow nodes
        "edges": [...],   // React Flow edges
        "design_id": "optional-uuid"  // If analyzing a saved design
    }
    
    Response:
    {
        "score": 72,
        "issues": [...],
        "positives": [...],
        "categories": {...},
        "patterns_detected": [...]
    }
    """
    nodes = request.data.get('nodes', [])
    edges = request.data.get('edges', [])
    design_id = request.data.get('design_id')

    # Run the analyzer
    result = analyze_design(nodes, edges)

    # If a design_id was provided, save the feedback to the design
    if design_id and request.user.is_authenticated:
        from apps.designs.models import Design
        try:
            design = Design.objects.get(id=design_id, author=request.user)
            design.ai_score = result['score']
            design.ai_feedback = result
            design.save(update_fields=['ai_score', 'ai_feedback'])
        except Design.DoesNotExist:
            pass  # Silently skip if design not found

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat_with_advisor(request):
    """
    POST /api/ai/chat/
    
    Ask the AI advisor a system design question.
    Optionally send the current design context for contextual advice.
    
    Request body:
    {
        "message": "How should I handle database scaling?",
        "design_context": {          // Optional
            "nodes": [...],
            "edges": [...]
        }
    }
    
    Response:
    {
        "response": "...",
        "sources": ["System Design Primer"],
        "related_topics": ["Caching", "Replication"],
        "powered_by": "knowledge_base" | "ai"
    }
    """
    message = request.data.get('message', '').strip()
    if not message:
        return Response(
            {'error': 'Message is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    design_context = request.data.get('design_context')
    result = get_chat_response(message, design_context)

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def suggest_improvements(request):
    """
    POST /api/ai/suggest/
    
    Given a partial design, suggest what components to add next.
    
    Request body:
    {
        "nodes": [...],
        "edges": [...]
    }
    
    Response:
    {
        "suggestions": [
            {
                "component_type": "cache",
                "name": "Cache (Redis)",
                "reason": "Add caching to reduce database load."
            }
        ]
    }
    """
    nodes = request.data.get('nodes', [])
    edges = request.data.get('edges', [])

    suggestions = suggest_next_components(nodes, edges)

    return Response({
        'suggestions': suggestions,
    }, status=status.HTTP_200_OK)
