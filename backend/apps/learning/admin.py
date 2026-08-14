from django.contrib import admin
from .models import Resource, StudyPath, StudyPathResource, UserProgress


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'source_type', 'difficulty', 'github_stars', 'is_featured', 'order']
    list_filter = ['source_type', 'difficulty', 'is_featured']
    search_fields = ['title', 'description', 'author_name']
    prepopulated_fields = {'slug': ('title',)}


class StudyPathResourceInline(admin.TabularInline):
    model = StudyPathResource
    extra = 1
    ordering = ['order']


@admin.register(StudyPath)
class StudyPathAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'resource_count', 'is_published']
    list_filter = ['difficulty', 'is_published']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [StudyPathResourceInline]


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'resource', 'status', 'completed_at']
    list_filter = ['status']
