from django.contrib import admin
from .models import Design, DesignVersion, DesignStar


@admin.register(Design)
class DesignAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'component_count', 'ai_score', 'is_public', 'stars_count', 'updated_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['title', 'description', 'author__username']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(DesignVersion)
class DesignVersionAdmin(admin.ModelAdmin):
    list_display = ['design', 'version_number', 'change_description', 'created_at']
    list_filter = ['created_at']


@admin.register(DesignStar)
class DesignStarAdmin(admin.ModelAdmin):
    list_display = ['user', 'design', 'created_at']
