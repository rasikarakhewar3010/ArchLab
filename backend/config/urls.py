"""
ArchLab URL Configuration
==========================
This is the MAIN router for the entire Django backend.

WHAT IS THIS FILE?
- It maps URLs (like /api/designs/) to the code that handles them.
- Think of it like React Router, but for the backend.

HOW IT WORKS:
- When a request comes in (e.g., GET /api/designs/), Django checks
  each pattern in `urlpatterns` from top to bottom.
- The first match wins and calls the associated view/handler.
- `include()` delegates to another app's urls.py (keeps things organized).

EXAMPLE:
  /api/designs/      → goes to apps.designs.urls
  /api/users/        → goes to apps.users.urls
  /api/challenges/   → goes to apps.challenges.urls
  /admin/            → Django's built-in admin panel
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django Admin Panel — auto-generated CRUD UI for all your models
    # Visit http://localhost:8000/admin/ to see it
    path('admin/', admin.site.urls),

    # API endpoints — each app defines its own URLs
    path('api/users/', include('apps.users.urls')),
    path('api/designs/', include('apps.designs.urls')),
    path('api/challenges/', include('apps.challenges.urls')),
    path('api/ai/', include('apps.ai_advisor.urls')),
    path('api/learning/', include('apps.learning.urls')),

    # django-allauth handles OAuth (GitHub login, etc.)
    path('accounts/', include('allauth.urls')),

    # DRF browsable API login (useful during development)
    path('api-auth/', include('rest_framework.urls')),
]
