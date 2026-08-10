from rest_framework import serializers
from .models import Challenge, ChallengeAttempt


class ChallengeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for challenge list view."""
    attempt_count = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            'id', 'title', 'slug', 'difficulty', 'companies',
            'time_limit_minutes', 'is_free', 'attempt_count',
        ]

    def get_attempt_count(self, obj):
        return obj.attempts.count()


class ChallengeDetailSerializer(serializers.ModelSerializer):
    """Full serializer with requirements and hints."""

    class Meta:
        model = Challenge
        fields = [
            'id', 'title', 'slug', 'description', 'difficulty',
            'functional_requirements', 'non_functional_requirements',
            'hints', 'companies', 'time_limit_minutes', 'is_free',
        ]
        # Note: reference_architecture is NOT included — it's revealed after submission


class ChallengeAttemptSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)

    class Meta:
        model = ChallengeAttempt
        fields = [
            'id', 'challenge', 'challenge_title', 'design',
            'score', 'feedback', 'time_taken_seconds',
            'status', 'started_at', 'submitted_at',
        ]
        read_only_fields = ['id', 'score', 'feedback', 'started_at']
