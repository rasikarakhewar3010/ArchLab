"""
User Model
==========
WHY A CUSTOM USER MODEL?
Django has a built-in User model, but it's a BEST PRACTICE to create your own
from the very start. Why? Because changing the User model AFTER you've created
database tables is extremely painful (you'd have to recreate the entire DB).

WHAT'S DIFFERENT FROM THE DEFAULT?
- We add: bio, avatar, github_username, experience_level
- We use email as the login field (instead of username)
- We track design_count and challenge_score for gamification

DJANGO MODEL CONCEPTS:
- A Model = a Python class that maps to a database table
- Each attribute = a column in the table
- CharField = text with max length (like VARCHAR in SQL)
- IntegerField = integer number
- DateTimeField = timestamp
- ForeignKey = relationship to another table (we'll use this in Designs)
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model for ArchLab.
    Extends Django's built-in AbstractUser (which gives us: username, email,
    password, first_name, last_name, is_staff, is_active, date_joined).
    """

    # --- Profile fields ---
    bio = models.TextField(
        max_length=500,
        blank=True,  # blank=True means this field is optional in forms
        help_text="Short bio displayed on the user's profile"
    )

    avatar = models.URLField(
        blank=True,
        help_text="URL to the user's avatar image (from Cloudinary or GitHub)"
    )

    github_username = models.CharField(
        max_length=100,
        blank=True,
        help_text="GitHub username, auto-filled when using GitHub OAuth"
    )

    experience_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ],
        default='beginner',
        help_text="Self-reported experience level for personalized challenges"
    )

    # --- Gamification fields ---
    design_count = models.IntegerField(
        default=0,
        help_text="Total number of designs created"
    )

    challenge_score = models.IntegerField(
        default=0,
        help_text="Total score from completed challenges"
    )

    streak_days = models.IntegerField(
        default=0,
        help_text="Current daily streak"
    )

    last_active = models.DateTimeField(
        auto_now=True,  # auto_now=True updates this field every time the model is saved
        help_text="Last time the user was active"
    )

    class Meta:
        # Meta class configures model-level settings
        ordering = ['-date_joined']  # Newest users first by default
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        """String representation — shown in admin panel and logs."""
        return f"{self.username} ({self.email})"
