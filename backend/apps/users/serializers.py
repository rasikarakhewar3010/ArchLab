"""
User Serializers
=================
WHAT IS A SERIALIZER?
Think of serializers as "translators" between Python objects and JSON.

When data comes IN from the frontend (JSON) → Serializer validates and converts to Python
When data goes OUT to the frontend (Python) → Serializer converts to JSON

It's similar to form validation in frontend, but on the backend side.

EXAMPLE:
  Frontend sends: {"username": "john", "email": "john@email.com"}
  Serializer validates it, creates a User object, and saves to database.
  
  Frontend requests user data:
  Serializer takes User object → converts to JSON → sends back.
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for reading user data (GET requests).
    
    ModelSerializer automatically creates fields from the User model.
    We specify which fields to include (never include password!).
    """

    class Meta:
        model = User  # Which model to serialize
        fields = [
            'id',
            'username',
            'email',
            'bio',
            'avatar',
            'github_username',
            'experience_level',
            'design_count',
            'challenge_score',
            'streak_days',
            'date_joined',
            'last_active',
        ]
        # These fields can be read but not written via the API
        read_only_fields = ['id', 'date_joined', 'last_active', 'design_count', 'challenge_score']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration (POST /api/users/register/).
    
    Notice we explicitly define password as a write_only field —
    we need it to CREATE the user, but we never want to SEND it back.
    """

    password = serializers.CharField(
        write_only=True,  # Never included in responses
        min_length=8,
        help_text="Password must be at least 8 characters"
    )

    password_confirm = serializers.CharField(
        write_only=True,
        help_text="Must match the password field"
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate(self, data):
        """
        Custom validation — runs after individual field validation.
        We check that password and password_confirm match.
        """
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

    def create(self, validated_data):
        """
        Custom create method — we need to hash the password!
        Django's create_user() method handles password hashing.
        
        NEVER store passwords as plain text. Django uses PBKDF2 by default.
        """
        validated_data.pop('password_confirm')  # Remove confirm, not a model field
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile (PATCH /api/users/me/)."""

    class Meta:
        model = User
        fields = ['bio', 'avatar', 'experience_level']
