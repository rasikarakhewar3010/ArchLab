"""
Learning Hub Views
===================
API endpoints for browsing resources, study paths, and tracking progress.
"""

from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Resource, StudyPath, UserProgress
from .serializers import (
    ResourceSerializer,
    ResourceWithProgressSerializer,
    StudyPathListSerializer,
    StudyPathDetailSerializer,
    UserProgressSerializer,
)


class ResourceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/learning/resources/       → List all resources
    GET /api/learning/resources/{slug}/ → Resource detail
    """
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'topics']
    ordering_fields = ['github_stars', 'difficulty', 'created_at']

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return ResourceWithProgressSerializer
        return ResourceSerializer

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """GET /api/learning/resources/featured/ — Get featured resources."""
        featured = self.queryset.filter(is_featured=True)
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_topic(self, request):
        """
        GET /api/learning/resources/by_topic/?topic=caching
        Filter resources by topic.
        """
        topic = request.query_params.get('topic', '')
        if not topic:
            return Response({'error': 'topic parameter is required'}, status=400)

        # Filter resources whose topics JSON array contains the topic
        resources = self.queryset.filter(topics__contains=[topic])
        serializer = self.get_serializer(resources, many=True)
        return Response(serializer.data)


class StudyPathViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/learning/paths/       → List study paths
    GET /api/learning/paths/{slug}/ → Path detail with resources
    """
    queryset = StudyPath.objects.filter(is_published=True)
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return StudyPathListSerializer
        return StudyPathDetailSerializer


class UserProgressViewSet(viewsets.ModelViewSet):
    """
    Manage user's learning progress.
    """
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_complete(self, request):
        """
        POST /api/learning/progress/mark_complete/
        {"resource_id": "uuid"}
        """
        resource_id = request.data.get('resource_id')
        if not resource_id:
            return Response({'error': 'resource_id is required'}, status=400)

        progress, created = UserProgress.objects.update_or_create(
            user=request.user,
            resource_id=resource_id,
            defaults={
                'status': 'completed',
                'completed_at': timezone.now(),
            },
        )

        serializer = UserProgressSerializer(progress)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        GET /api/learning/progress/stats/
        Get overall learning statistics for the current user.
        """
        total_resources = Resource.objects.count()
        completed = UserProgress.objects.filter(
            user=request.user,
            status='completed',
        ).count()
        in_progress = UserProgress.objects.filter(
            user=request.user,
            status='in_progress',
        ).count()

        return Response({
            'total_resources': total_resources,
            'completed': completed,
            'in_progress': in_progress,
            'completion_percent': round((completed / total_resources) * 100) if total_resources > 0 else 0,
        })
