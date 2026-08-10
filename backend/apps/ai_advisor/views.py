from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .analyzer import analyze_design


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
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
        "categories": {...}
    }
    """
    nodes = request.data.get('nodes', [])
    edges = request.data.get('edges', [])
    design_id = request.data.get('design_id')

    # Run the analyzer
    result = analyze_design(nodes, edges)

    # If a design_id was provided, save the feedback to the design
    if design_id:
        from apps.designs.models import Design
        try:
            design = Design.objects.get(id=design_id, author=request.user)
            design.ai_score = result['score']
            design.ai_feedback = result
            design.save(update_fields=['ai_score', 'ai_feedback'])
        except Design.DoesNotExist:
            pass  # Silently skip if design not found

    return Response(result, status=status.HTTP_200_OK)
