"""
Design Serializers
===================
These translate Design model instances to/from JSON for the API.
"""

from rest_framework import serializers
from .models import Design, DesignVersion, DesignStar


class DesignVersionSerializer(serializers.ModelSerializer):
    """Serializer for design version history."""

    class Meta:
        model = DesignVersion
        fields = [
            'id', 'version_number', 'nodes', 'edges', 'viewport',
            'change_description', 'created_at',
        ]
        read_only_fields = ['id', 'version_number', 'created_at']


class DesignListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing designs.
    
    WHY A SEPARATE LIST SERIALIZER?
    When listing many designs (e.g., gallery page), we don't need
    the full nodes/edges data (that could be huge). We only send
    metadata like title, author, score, thumbnail.
    
    This is a common optimization pattern in APIs:
    - List endpoint → lightweight serializer (fast, small payload)
    - Detail endpoint → full serializer (complete data)
    """

    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.URLField(source='author.avatar', read_only=True)
    component_count = serializers.IntegerField(read_only=True)
    connection_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Design
        fields = [
            'id', 'title', 'description', 'thumbnail',
            'author_username', 'author_avatar',
            'component_count', 'connection_count',
            'ai_score', 'is_public', 'tags',
            'stars_count', 'forks_count',
            'created_at', 'updated_at',
        ]


class DesignDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for a single design (includes nodes, edges, viewport).
    Used when the user opens a design in the canvas editor.
    """

    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.URLField(source='author.avatar', read_only=True)
    versions = DesignVersionSerializer(many=True, read_only=True)
    is_starred = serializers.SerializerMethodField()

    class Meta:
        model = Design
        fields = [
            'id', 'title', 'description',
            'author', 'author_username', 'author_avatar',
            'nodes', 'edges', 'viewport',
            'thumbnail', 'is_public', 'tags',
            'ai_score', 'ai_feedback',
            'stars_count', 'forks_count', 'is_starred',
            'forked_from',
            'versions',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'author', 'ai_score', 'ai_feedback',
            'stars_count', 'forks_count', 'created_at', 'updated_at',
        ]

    def get_is_starred(self, obj):
        """
        SerializerMethodField — a computed field.
        Checks if the current user has starred this design.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return DesignStar.objects.filter(
                user=request.user,
                design=obj
            ).exists()
        return False


class DesignCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new design."""

    class Meta:
        model = Design
        fields = [
            'title', 'description', 'nodes', 'edges',
            'viewport', 'is_public', 'tags',
        ]

    def create(self, validated_data):
        """
        Create a new design with initial version.
        The author is set by the view's perform_create() via serializer.save(author=request.user).
        """
        design = super().create(validated_data)

        # Create initial version (v1)
        DesignVersion.objects.create(
            design=design,
            version_number=1,
            nodes=design.nodes,
            edges=design.edges,
            viewport=design.viewport,
            change_description='Initial version',
        )

        # Update user's design count
        user = design.author
        user.design_count = user.designs.count()
        user.save(update_fields=['design_count'])

        return design
