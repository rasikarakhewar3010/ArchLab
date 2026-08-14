from rest_framework import serializers
from .models import Resource, StudyPath, StudyPathResource, UserProgress


class ResourceSerializer(serializers.ModelSerializer):
    """Serializer for learning resources."""

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'url', 'description',
            'source_type', 'difficulty', 'topics',
            'author_name', 'github_stars', 'estimated_time_minutes',
            'icon', 'is_featured', 'created_at',
        ]


class ResourceWithProgressSerializer(serializers.ModelSerializer):
    """Resource with user's progress status."""
    user_status = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'slug', 'url', 'description',
            'source_type', 'difficulty', 'topics',
            'author_name', 'github_stars', 'estimated_time_minutes',
            'icon', 'is_featured', 'user_status',
        ]

    def get_user_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserProgress.objects.filter(
                user=request.user,
                resource=obj,
            ).first()
            return progress.status if progress else 'not_started'
        return 'not_started'


class StudyPathListSerializer(serializers.ModelSerializer):
    """Lightweight study path for list view."""
    resource_count = serializers.IntegerField(read_only=True)
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = StudyPath
        fields = [
            'id', 'title', 'slug', 'description', 'difficulty',
            'icon', 'resource_count', 'progress_percent',
        ]

    def get_progress_percent(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total = obj.resources.count()
            if total == 0:
                return 0
            completed = UserProgress.objects.filter(
                user=request.user,
                resource__in=obj.resources.all(),
                status='completed',
            ).count()
            return round((completed / total) * 100)
        return 0


class StudyPathDetailSerializer(serializers.ModelSerializer):
    """Full study path with ordered resources."""
    resources = serializers.SerializerMethodField()

    class Meta:
        model = StudyPath
        fields = [
            'id', 'title', 'slug', 'description', 'difficulty',
            'icon', 'resources',
        ]

    def get_resources(self, obj):
        ordered_resources = Resource.objects.filter(
            studypathresource__study_path=obj,
        ).order_by('studypathresource__order')
        return ResourceWithProgressSerializer(
            ordered_resources, many=True, context=self.context
        ).data


class UserProgressSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)

    class Meta:
        model = UserProgress
        fields = [
            'id', 'resource', 'resource_title',
            'status', 'completed_at', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
