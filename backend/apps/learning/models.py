"""
Learning Hub Models
====================
Curated system design learning resources, study paths, and progress tracking.

This integrates the top GitHub repositories and resources into a structured
learning experience directly inside ArchLab.
"""

from django.db import models
from django.conf import settings
import uuid


class Resource(models.Model):
    """
    A curated system design learning resource.
    Can be a GitHub repo, article, video, or documentation.
    """

    SOURCE_TYPE_CHOICES = [
        ('github', 'GitHub Repository'),
        ('article', 'Article'),
        ('video', 'Video'),
        ('documentation', 'Documentation'),
        ('course', 'Online Course'),
    ]

    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True, help_text="URL-friendly identifier")
    url = models.URLField(help_text="Link to the resource")
    description = models.TextField(help_text="What this resource covers")

    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)

    # Topics covered (for filtering and recommendations)
    topics = models.JSONField(
        default=list,
        help_text="e.g., ['load-balancing', 'caching', 'databases', 'microservices']"
    )

    # Metadata
    author_name = models.CharField(max_length=200, blank=True)
    github_stars = models.IntegerField(null=True, blank=True, help_text="GitHub stars count (for repos)")
    estimated_time_minutes = models.IntegerField(
        null=True, blank=True,
        help_text="Estimated reading/watching time in minutes"
    )

    # Display
    icon = models.CharField(max_length=50, blank=True, help_text="Lucide icon name")
    is_featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'order', '-github_stars']

    def __str__(self):
        return f"[{self.source_type.upper()}] {self.title}"


class StudyPath(models.Model):
    """
    An ordered learning path that guides users through system design topics.
    Example: "System Design Fundamentals" → resources in a specific order.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    difficulty = models.CharField(
        max_length=20,
        choices=Resource.DIFFICULTY_CHOICES,
    )

    # Ordered list of resources in this path
    resources = models.ManyToManyField(
        Resource,
        through='StudyPathResource',
        related_name='study_paths',
    )

    # Link to related challenges
    related_challenges = models.ManyToManyField(
        'challenges.Challenge',
        blank=True,
        related_name='study_paths',
        help_text="Challenges to practice after completing this path"
    )

    icon = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['difficulty', 'title']

    def __str__(self):
        return f"{self.title} ({self.difficulty})"

    @property
    def resource_count(self):
        return self.resources.count()


class StudyPathResource(models.Model):
    """
    Through model for ordering resources within a study path.
    """
    study_path = models.ForeignKey(StudyPath, on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    order = models.IntegerField(default=0, help_text="Order within the study path")

    class Meta:
        ordering = ['order']
        unique_together = ['study_path', 'resource']


class UserProgress(models.Model):
    """
    Tracks a user's progress through resources and study paths.
    """

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_progress',
    )

    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='user_progress',
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="User's personal notes about this resource")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'resource']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.resource.title} ({self.status})"
