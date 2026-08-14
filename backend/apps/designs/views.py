"""
Design Views
=============
API endpoints for managing architecture designs.
"""

from django.db.models import Q, F
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Design, DesignVersion, DesignStar
from .serializers import (
    DesignListSerializer,
    DesignDetailSerializer,
    DesignCreateSerializer,
    DesignVersionSerializer,
)


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission: only the design's author can edit/delete it.
    Anyone can read public designs.
    
    HOW CUSTOM PERMISSIONS WORK:
    - has_permission() → checked BEFORE the view runs (list-level)
    - has_object_permission() → checked for specific objects (detail-level)
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions for any request (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return obj.is_public or obj.author == request.user
        # Write permissions only for the author
        return obj.author == request.user


class DesignViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for architecture designs.
    
    Endpoints:
        GET    /api/designs/                → List designs (gallery)
        POST   /api/designs/                → Create new design
        GET    /api/designs/{id}/            → Get design details
        PUT    /api/designs/{id}/            → Full update
        PATCH  /api/designs/{id}/            → Partial update (auto-save)
        DELETE /api/designs/{id}/            → Delete design
        POST   /api/designs/{id}/star/       → Star/unstar a design
        POST   /api/designs/{id}/fork/       → Fork a design
        GET    /api/designs/{id}/versions/   → Get version history
        GET    /api/designs/my_designs/      → Get current user's designs
    """

    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'stars_count', 'ai_score']

    def get_queryset(self):
        """
        Filter designs based on the request.
        - Authenticated users see their own designs + public designs
        - Anonymous users see only public designs
        """
        user = self.request.user

        if user.is_authenticated:
            # Show user's own designs + all public designs
            return Design.objects.filter(
                Q(author=user) | Q(is_public=True)
            ).select_related('author')  # select_related = SQL JOIN (prevents N+1 queries)
        else:
            return Design.objects.filter(is_public=True).select_related('author')

    def get_serializer_class(self):
        """
        Use lightweight serializer for lists, full serializer for details.
        This is a performance optimization — list views don't need all the data.
        """
        if self.action == 'list':
            return DesignListSerializer
        if self.action == 'create':
            return DesignCreateSerializer
        return DesignDetailSerializer

    def perform_create(self, serializer):
        """
        Called by create() — sets the author automatically.
        The user doesn't need to send their own ID.
        """
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        """
        Called on every save — creates a new version snapshot.
        This gives us automatic version history!
        """
        design = serializer.save()

        # Create a new version
        latest_version = design.versions.first()  # ordered by -version_number
        new_version_number = (latest_version.version_number + 1) if latest_version else 1

        DesignVersion.objects.create(
            design=design,
            version_number=new_version_number,
            nodes=design.nodes,
            edges=design.edges,
            viewport=design.viewport,
            change_description=f'Version {new_version_number}',
        )

    # --- Custom Actions ---

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def star(self, request, pk=None):
        """
        POST /api/designs/{id}/star/
        Toggle star on a design (like/unlike).
        """
        design = self.get_object()

        star, created = DesignStar.objects.get_or_create(
            user=request.user,
            design=design,
        )

        if not created:
            # Already starred — unstar
            star.delete()
            Design.objects.filter(pk=design.pk).update(stars_count=F('stars_count') - 1)
            design.refresh_from_db()
            return Response({'starred': False, 'stars_count': design.stars_count})

        # New star
        Design.objects.filter(pk=design.pk).update(stars_count=F('stars_count') + 1)
        design.refresh_from_db()
        return Response({'starred': True, 'stars_count': design.stars_count})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def fork(self, request, pk=None):
        """
        POST /api/designs/{id}/fork/
        Create a copy of someone else's design.
        
        WHAT IS FORKING?
        Like GitHub forks — you get your own copy to modify,
        while the original stays untouched.
        """
        original = self.get_object()

        forked_design = Design.objects.create(
            author=request.user,
            title=f"{original.title} (fork)",
            description=f"Forked from {original.author.username}'s design",
            nodes=original.nodes,
            edges=original.edges,
            viewport=original.viewport,
            tags=original.tags,
            forked_from=original,
        )

        # Update fork count on the original (atomic to prevent race conditions)
        Design.objects.filter(pk=original.pk).update(forks_count=F('forks_count') + 1)

        # Create v1 for the fork
        DesignVersion.objects.create(
            design=forked_design,
            version_number=1,
            nodes=forked_design.nodes,
            edges=forked_design.edges,
            viewport=forked_design.viewport,
            change_description='Forked from original',
        )

        serializer = DesignDetailSerializer(
            forked_design, context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """
        GET /api/designs/{id}/versions/
        Get version history of a design.
        """
        design = self.get_object()
        versions = design.versions.all()
        serializer = DesignVersionSerializer(versions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_designs(self, request):
        """
        GET /api/designs/my_designs/
        Get all designs by the current user.
        """
        designs = Design.objects.filter(author=request.user)
        serializer = DesignListSerializer(designs, many=True)
        return Response(serializer.data)

