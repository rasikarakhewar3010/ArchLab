from django.contrib import admin
from .models import Challenge, ChallengeAttempt


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'is_free', 'time_limit_minutes', 'order']
    list_filter = ['difficulty', 'is_free']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ChallengeAttempt)
class ChallengeAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'challenge', 'score', 'status', 'time_taken_seconds', 'started_at']
    list_filter = ['status', 'challenge__difficulty']
