from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Challenge, ChallengeAttempt
from .serializers import (
    ChallengeListSerializer,
    ChallengeDetailSerializer,
    ChallengeAttemptSerializer,
)
from apps.ai_advisor.analyzer import analyze_design


class ChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ReadOnlyModelViewSet — only GET endpoints (list + retrieve).
    Challenges are created via admin or data fixtures, not the API.
    """
    queryset = Challenge.objects.all()
    lookup_field = 'slug'  # Use slug instead of id in URLs: /api/challenges/url-shortener/

    def get_serializer_class(self):
        if self.action == 'list':
            return ChallengeListSerializer
        return ChallengeDetailSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def start(self, request, slug=None):
        """
        POST /api/challenges/{slug}/start/
        Start a challenge attempt.
        """
        challenge = self.get_object()

        attempt = ChallengeAttempt.objects.create(
            user=request.user,
            challenge=challenge,
        )

        serializer = ChallengeAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, slug=None):
        """
        POST /api/challenges/{slug}/submit/
        Submit a challenge attempt for AI scoring.

        Request body:
        {
            "attempt_id": "uuid",
            "design": { "nodes": [...], "edges": [...] }
        }
        """
        challenge = self.get_object()
        attempt_id = request.data.get('attempt_id')
        design_data = request.data.get('design', {})

        try:
            attempt = ChallengeAttempt.objects.get(
                id=attempt_id,
                user=request.user,
                challenge=challenge,
            )
        except ChallengeAttempt.DoesNotExist:
            return Response(
                {'error': 'Attempt not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Run the AI Analyzer on the submitted design
        nodes = design_data.get('nodes', [])
        edges = design_data.get('edges', [])
        feedback = analyze_design(nodes, edges)

        # Update the attempt with results
        attempt.status = 'scored'
        attempt.submitted_at = timezone.now()
        attempt.time_taken_seconds = (
            attempt.submitted_at - attempt.started_at
        ).total_seconds()
        attempt.score = feedback.get('score', 0)
        attempt.feedback = feedback
        attempt.save(update_fields=[
            'status', 'submitted_at', 'time_taken_seconds', 'score', 'feedback'
        ])

        serializer = ChallengeAttemptSerializer(attempt)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def solution(self, request, slug=None):
        """
        GET /api/challenges/{slug}/solution/
        Reveal the reference architecture (only after submission).
        """
        challenge = self.get_object()

        # Check if user has submitted at least one attempt
        has_submitted = ChallengeAttempt.objects.filter(
            user=request.user,
            challenge=challenge,
            status__in=['submitted', 'scored'],
        ).exists()

        if not has_submitted:
            return Response(
                {'error': 'You must submit an attempt before viewing the solution'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({
            'reference_architecture': challenge.reference_architecture,
            'reference_explanation': challenge.reference_explanation,
        })
