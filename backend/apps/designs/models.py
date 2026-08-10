"""
Design Models — The Core of ArchLab
=====================================
This is where architecture designs are stored.

KEY CONCEPT — JSONField:
PostgreSQL has a powerful `jsonb` data type that lets you store
JSON documents inside a relational database. This means we can store
the entire React Flow canvas state (nodes, edges, positions) as JSON
WITHOUT needing MongoDB!

WHY THIS IS CLEVER:
- React Flow gives us JSON like: {nodes: [...], edges: [...]}
- We store that JSON directly in PostgreSQL's `jsonb` column
- We get the best of both worlds:
  - Relational queries for users, timestamps, metadata
  - Flexible JSON storage for the canvas data
  - No need for a separate MongoDB instance!

MODEL RELATIONSHIPS:
  User ──(has many)──> Design
  Design ──(has many)──> DesignVersion (for version history)
"""

from django.db import models
from django.conf import settings
import uuid


class Design(models.Model):
    """
    An architecture design created on the canvas.
    
    This stores the complete state of a user's system design,
    including all components (nodes), connections (edges),
    and canvas viewport position.
    """

    # Use UUID for public-facing IDs (more secure than sequential integers)
    # Sequential IDs let attackers enumerate: /designs/1, /designs/2, /designs/3...
    # UUIDs are random: /designs/a1b2c3d4-e5f6-... (can't guess)
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    # ForeignKey = relationship to another model
    # on_delete=CASCADE means: if the user is deleted, delete their designs too
    # related_name='designs' lets you do: user.designs.all()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='designs',
        help_text="The user who created this design"
    )

    title = models.CharField(
        max_length=200,
        help_text="Design title, e.g., 'URL Shortener Architecture'"
    )

    description = models.TextField(
        blank=True,
        help_text="Optional description of the design"
    )

    # --- Canvas Data (stored as JSON in PostgreSQL) ---

    # The nodes array from React Flow
    # Example: [{"id": "1", "type": "database", "position": {"x": 100, "y": 200}, "data": {"label": "PostgreSQL", "config": {...}}}]
    nodes = models.JSONField(
        default=list,
        help_text="React Flow nodes array — all components on the canvas"
    )

    # The edges array from React Flow
    # Example: [{"id": "e1-2", "source": "1", "target": "2", "animated": true}]
    edges = models.JSONField(
        default=list,
        help_text="React Flow edges array — connections between components"
    )

    # Viewport state (so we can restore the exact camera position)
    viewport = models.JSONField(
        default=dict,
        help_text="Canvas viewport: {x, y, zoom}"
    )

    # --- Metadata ---

    # Thumbnail URL (stored on Cloudinary)
    thumbnail = models.URLField(
        blank=True,
        help_text="Auto-generated thumbnail of the design (Cloudinary URL)"
    )

    # Visibility
    is_public = models.BooleanField(
        default=False,
        help_text="Whether this design is visible in the public gallery"
    )

    # Tags for categorization
    tags = models.JSONField(
        default=list,
        help_text="Tags like ['microservices', 'high-availability', 'caching']"
    )

    # --- AI Feedback ---
    ai_score = models.IntegerField(
        null=True,  # null=True means this column can be NULL in the database
        blank=True,
        help_text="AI-generated score (0-100)"
    )

    ai_feedback = models.JSONField(
        null=True,
        blank=True,
        help_text="Structured AI feedback: {score, issues: [], suggestions: [], categories: {}}"
    )

    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)  # Set once on creation
    updated_at = models.DateTimeField(auto_now=True)       # Updated on every save

    # --- Gamification ---
    stars_count = models.IntegerField(default=0)
    forks_count = models.IntegerField(default=0)

    # If this design was forked from another
    forked_from = models.ForeignKey(
        'self',  # Self-referential relationship
        null=True,
        blank=True,
        on_delete=models.SET_NULL,  # If original is deleted, keep the fork
        related_name='forks',
    )

    class Meta:
        ordering = ['-updated_at']  # Most recently updated first
        verbose_name = 'Design'
        verbose_name_plural = 'Designs'

    def __str__(self):
        return f"{self.title} by {self.author.username}"

    @property
    def component_count(self):
        """How many components are in this design."""
        return len(self.nodes) if self.nodes else 0

    @property
    def connection_count(self):
        """How many connections are in this design."""
        return len(self.edges) if self.edges else 0


class DesignVersion(models.Model):
    """
    Version history for a design.
    
    Every time a user saves, we create a version snapshot.
    This lets users undo/redo and see their design evolution.
    
    WHY VERSION HISTORY?
    - Users can accidentally delete components
    - Interviewers might ask "show me how you evolved the design"
    - It's a great feature for the portfolio (shows real engineering)
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name='versions',
    )

    version_number = models.IntegerField(
        help_text="Auto-incrementing version number"
    )

    # Snapshot of the design state at this version
    nodes = models.JSONField(default=list)
    edges = models.JSONField(default=list)
    viewport = models.JSONField(default=dict)

    # What changed
    change_description = models.CharField(
        max_length=500,
        blank=True,
        help_text="Auto-generated or user-provided description of changes"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ['design', 'version_number']  # No duplicate version numbers per design

    def __str__(self):
        return f"{self.design.title} v{self.version_number}"


class DesignStar(models.Model):
    """
    Stars (likes) on designs — for the community feature.
    
    WHY A SEPARATE MODEL?
    Instead of just a count, we track WHO starred WHAT.
    This prevents: double-starring, and lets us show "You starred this".
    
    This is called a "junction table" or "through model" in database design.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='starred_designs',
    )

    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name='stars',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together ensures a user can only star a design once
        unique_together = ['user', 'design']

    def __str__(self):
        return f"{self.user.username} starred {self.design.title}"
