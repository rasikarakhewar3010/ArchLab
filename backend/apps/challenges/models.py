"""
Challenge Models
=================
Structured system design challenges — the "LeetCode of System Design".

Each challenge has:
- Requirements (functional + non-functional)
- Difficulty level
- Reference architecture (the "correct" answer)
- Companies that ask this question
"""

from django.db import models
from django.conf import settings
import uuid


class Badge(models.Model):
    """Gamification badge that users can earn."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Lucide icon name")
    category = models.CharField(max_length=50, choices=[
        ('challenge', 'Challenge Completion'),
        ('streak', 'Daily Streak'),
        ('social', 'Community Interaction'),
    ])
    points = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Challenge(models.Model):
    """A system design challenge/problem."""

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('expert', 'Expert'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, help_text="URL-friendly name, e.g., 'url-shortener'")
    description = models.TextField(help_text="Problem statement and context")

    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)

    # Requirements stored as JSON arrays
    functional_requirements = models.JSONField(
        default=list,
        help_text="e.g., ['Users can create short URLs', 'URLs expire after X days']"
    )

    non_functional_requirements = models.JSONField(
        default=list,
        help_text="e.g., ['Handle 10K reads/sec', '99.9% availability', 'Low latency (<100ms)']"
    )

    # Hints to guide the user
    hints = models.JSONField(
        default=list,
        help_text="Progressive hints revealed one at a time"
    )

    # Reference solution (the "editorial")
    reference_architecture = models.JSONField(
        null=True, blank=True,
        help_text="The reference design: {nodes: [...], edges: [...]}"
    )

    reference_explanation = models.TextField(
        blank=True,
        help_text="Markdown explanation of the reference architecture"
    )

    # Companies that ask this in interviews
    companies = models.JSONField(
        default=list,
        help_text="e.g., ['Google', 'Amazon', 'Meta']"
    )

    # Solution patterns that work for this challenge
    solution_patterns = models.JSONField(
        default=list,
        help_text="e.g., ['CQRS', 'Cache-Aside', 'Event-Driven']"
    )

    # Challenge metadata
    estimated_difficulty_rating = models.FloatField(
        null=True, blank=True,
        help_text="Community rating out of 5.0"
    )
    time_limit_minutes = models.IntegerField(
        default=45,
        help_text="Suggested time limit (like a real interview)"
    )

    is_free = models.BooleanField(
        default=True,
        help_text="Whether this challenge is available on the free tier"
    )

    order = models.IntegerField(
        default=0,
        help_text="Display order within difficulty level"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['difficulty', 'order']

    def __str__(self):
        return f"[{self.difficulty.upper()}] {self.title}"


class ChallengeAttempt(models.Model):
    """
    A user's attempt at solving a challenge.
    Links a user + challenge + their design submission.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='challenge_attempts',
    )

    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='attempts',
    )

    # The user's submitted design
    design = models.ForeignKey(
        'designs.Design',
        on_delete=models.SET_NULL,
        null=True,
        related_name='challenge_attempt',
    )

    # Scoring
    score = models.IntegerField(
        null=True, blank=True,
        help_text="AI-generated score (0-100)"
    )

    feedback = models.JSONField(
        null=True, blank=True,
        help_text="Detailed AI feedback on the attempt"
    )

    # Timing
    time_taken_seconds = models.IntegerField(
        null=True, blank=True,
        help_text="How long the user took"
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ('in_progress', 'In Progress'),
            ('submitted', 'Submitted'),
            ('scored', 'Scored'),
        ],
        default='in_progress',
    )

    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} → {self.challenge.title} ({self.status})"
