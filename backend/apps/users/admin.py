"""
Register User model with Django Admin.
This lets you manage users via the admin panel at /admin/.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin for our User model.
    We extend the built-in UserAdmin to include our custom fields.
    """
    list_display = ['username', 'email', 'experience_level', 'design_count', 'challenge_score', 'date_joined']
    list_filter = ['experience_level', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'github_username']

    # Add our custom fields to the admin form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('ArchLab Profile', {
            'fields': ('bio', 'avatar', 'github_username', 'experience_level'),
        }),
        ('Gamification', {
            'fields': ('design_count', 'challenge_score', 'streak_days'),
        }),
    )
