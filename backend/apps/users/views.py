"""
User Views (API Endpoints)
===========================
WHAT ARE VIEWS?
Views handle HTTP requests and return HTTP responses.
In DRF, we use "ViewSets" which group related actions together.

COMPARISON TO EXPRESS.JS:
  Express:  router.get('/users/:id', (req, res) => { ... })
  Django:   class UserViewSet(viewsets.ModelViewSet): ...

ViewSet automatically creates these endpoints:
  GET    /api/users/          → list()    → Get all users
  POST   /api/users/          → create()  → Create a user
  GET    /api/users/{id}/     → retrieve() → Get one user
  PUT    /api/users/{id}/     → update()  → Update a user
  DELETE /api/users/{id}/     → destroy() → Delete a user

We also add custom actions like /api/users/me/ for the current user.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import login

from .models import User
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserProfileUpdateSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for user operations.
    
    PERMISSIONS:
    - Anyone can register (create)
    - Only authenticated users can see user lists
    - Only the user themselves can update/delete their profile
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Different permissions for different actions.
        This is like middleware in Express that checks auth per route.
        """
        if self.action in ['create', 'register']:
            # Anyone can register
            return [permissions.AllowAny()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only the user themselves
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_serializer_class(self):
        """
        Use different serializers for different actions.
        Registration needs password fields; reading doesn't.
        """
        if self.action == 'register':
            return UserRegistrationSerializer
        if self.action in ['update_profile']:
            return UserProfileUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """
        POST /api/users/register/
        Create a new user account.
        
        @action decorator creates a custom endpoint beyond the standard CRUD.
        detail=False means it's a list-level action (/users/register/)
        not an instance-level action (/users/123/something/).
        """
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Returns 400 if invalid
        user = serializer.save()

        # Auto-login after registration
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """
        GET  /api/users/me/  → Get current user's profile
        PATCH /api/users/me/ → Update current user's profile
        
        This is a very common pattern — let users access their own data
        without knowing their ID.
        """
        user = request.user

        if request.method == 'PATCH':
            serializer = UserProfileUpdateSerializer(
                user,
                data=request.data,
                partial=True  # partial=True allows updating just some fields
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UserSerializer(user).data)

        return Response(UserSerializer(user).data)
