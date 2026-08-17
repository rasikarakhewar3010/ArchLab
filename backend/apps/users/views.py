from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, authenticate

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
        if self.action in ['create', 'register', 'login']:
            # Anyone can register or login
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
        Create a new user account and return an auth token.
        """
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Returns 400 if invalid
        user = serializer.save()

        # Create auth token for the new user
        token, _ = Token.objects.get_or_create(user=user)

        # Auto-login after registration
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
        POST /api/users/login/
        Authenticate a user and return an auth token.

        Request body:
        {
            "username": "john",
            "password": "mypassword123"
        }

        Response:
        {
            "token": "abc123...",
            "user": { ... }
        }
        """
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'error': 'Both username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Create or retrieve auth token
        token, _ = Token.objects.get_or_create(user=user)

        # Set session (for browsable API)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })

    @action(detail=False, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """
        GET  /api/users/me/  → Get current user's profile
        PATCH /api/users/me/ → Update current user's profile
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
