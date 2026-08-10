"""
User URL Routes
================
WHAT IS THIS FILE?
This connects URL patterns to views (handlers).

HOW DOES DRF ROUTING WORK?
- DefaultRouter automatically creates URL patterns from ViewSets.
- It generates RESTful URLs like:
    GET    /api/users/         → list all users
    POST   /api/users/         → create user
    GET    /api/users/1/       → get user with id=1
    GET    /api/users/me/      → get current user (custom action)
    POST   /api/users/register/ → register new user (custom action)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

# The router auto-generates URL patterns from the ViewSet
router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
