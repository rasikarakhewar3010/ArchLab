"""
ArchLab Django Settings
========================
This is the MAIN configuration file for the Django backend.

WHAT IS THIS FILE?
- Django uses this file to know HOW to run your application.
- It configures: which database to use, which apps are installed,
  security settings, API settings, etc.

KEY CONCEPTS:
- INSTALLED_APPS: A list of all "modules" your Django project uses.
  Think of each app like a plugin — it adds functionality.
- MIDDLEWARE: Functions that run on EVERY request/response.
  Like Express.js middleware if you've used Node.
- DATABASES: Where your data lives (PostgreSQL in our case).
- REST_FRAMEWORK: Settings for Django REST Framework (our API layer).
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
# This keeps secrets OUT of your code (never commit .env!)
load_dotenv()

# BASE_DIR = the root of the backend folder
# Path(__file__) = this settings.py file
# .resolve() = get absolute path
# .parent.parent = go up 2 levels (config/ → backend/)
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
# This key is used for: password hashing, session signing, CSRF tokens
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key')

# SECURITY WARNING: don't run with debug=True in production!
# Debug=True shows detailed error pages (useful for dev, dangerous for prod)
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Production Security Settings ("100% Security")
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False').lower() == 'true'
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False').lower() == 'true'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Additional Security Headers
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'


# =============================================================================
# INSTALLED APPS
# =============================================================================
# These are all the "modules" that make up your Django project.
# Django comes with some built-in apps, and we add our own + third-party ones.

INSTALLED_APPS = [
    'daphne',                        # ASGI server (must be before staticfiles)
    # --- Django built-in apps ---
    'django.contrib.admin',          # Admin panel (auto-generated CRUD UI)
    'django.contrib.auth',           # Authentication system (users, passwords)
    'django.contrib.contenttypes',   # Framework for content types
    'django.contrib.sessions',       # Session management
    'django.contrib.messages',       # Flash messages framework
    'django.contrib.staticfiles',    # Serving static files (CSS, JS, images)
    'django.contrib.sites',          # Required by django-allauth

    # --- Third-party apps ---
    'rest_framework',                # Django REST Framework — builds our API
    'rest_framework.authtoken',      # Token-based authentication for SPA
    'corsheaders',                   # Handles CORS (so React can talk to Django)
    'channels',                      # WebSocket support
    'allauth',                       # Authentication (social login, email)
    'allauth.account',               # Account management
    'allauth.socialaccount',         # Social auth (GitHub, Google)
    'allauth.socialaccount.providers.github',  # GitHub OAuth
    'cloudinary_storage',            # Cloudinary file storage
    'cloudinary',                    # Cloudinary SDK

    # --- Our custom apps ---
    'apps.users',                    # User profiles, auth
    'apps.designs',                  # Architecture designs (the core feature!)
    'apps.challenges',               # System design challenges
    'apps.ai_advisor',               # AI feedback service
    'apps.learning',                 # Learning Hub — curated system design resources
]


# =============================================================================
# MIDDLEWARE
# =============================================================================
# Middleware = functions that process EVERY request/response.
# Order matters! They run top-to-bottom on requests, bottom-to-top on responses.

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # CORS (must be first!)
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',   # WhiteNoise (serve static files efficiently)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',  # django-allauth
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# =============================================================================
# URL CONFIGURATION
# =============================================================================
# This tells Django where to find the URL patterns (routes).
# Think of it like a router in Express.js or React Router.

ROOT_URLCONF = 'config.urls'


# =============================================================================
# TEMPLATES
# =============================================================================
# Templates are HTML files that Django can render server-side.
# We mostly use Django as an API, but the admin panel needs templates.

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# =============================================================================
# REDIS / CHANNEL LAYERS
# =============================================================================
if os.getenv('DB_ENGINE', 'sqlite3') == 'postgresql':
    # Use Redis when in production/Docker mode
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [(os.getenv('REDIS_HOST', 'localhost'), 6379)],
            },
        },
    }
else:
    # Use InMemory for local development without Docker
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }


# =============================================================================
# DATABASE
# =============================================================================
# Supports both PostgreSQL (production) and SQLite (development).
# Set DB_ENGINE=postgresql in .env to use PostgreSQL.
# Default: SQLite for easy local development.

DB_ENGINE = os.getenv('DB_ENGINE', 'sqlite3')

if DB_ENGINE == 'postgresql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'archlab'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# =============================================================================
# AUTHENTICATION
# =============================================================================
# Password validation — Django enforces strong passwords by default

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# We use a custom User model (always do this in Django — it's a pain to change later)
AUTH_USER_MODEL = 'users.User'

# django-allauth settings (v65+ new format)
SITE_ID = 1  # Required by allauth
ACCOUNT_LOGIN_METHODS = {'email': 'required'}  # Login via email (replaces deprecated ACCOUNT_AUTHENTICATION_METHOD)
ACCOUNT_SIGNUP_FIELDS = ['email*', 'username*', 'password1*', 'password2*']  # Replaces deprecated EMAIL_REQUIRED + USERNAME_REQUIRED
ACCOUNT_EMAIL_VERIFICATION = 'none'  # Skip email verification for now

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Where to redirect after login/logout
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'


# =============================================================================
# INTERNATIONALIZATION
# =============================================================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# =============================================================================
# STATIC FILES & MEDIA
# =============================================================================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise configuration for efficient static file serving
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Cloudinary for media storage (design exports, thumbnails, avatars)
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME', 'demo'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY', 'demo'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET', 'demo'),
}

# DEFAULT_FILE_STORAGE is deprecated in Django 4.2+, handled by STORAGES above
# DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'


# =============================================================================
# DJANGO REST FRAMEWORK
# =============================================================================
# DRF is what turns Django into an API server.
# These settings control how the API behaves globally.

REST_FRAMEWORK = {
    # How users prove who they are (authentication)
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # Token auth for SPA (no CSRF needed)
        'rest_framework.authentication.SessionAuthentication',  # Session auth for DRF browsable API
    ],
    # Who can access what (permissions)
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    # Pagination — don't return 10,000 results at once!
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}


# =============================================================================
# CORS (Cross-Origin Resource Sharing)
# =============================================================================
# CORS controls which domains can make API requests to your backend.
# Without this, your React app (localhost:5173) can't talk to Django (localhost:8000).

CORS_ALLOWED_ORIGINS = [
    os.getenv('FRONTEND_URL', 'http://localhost:5173'),
]

CORS_ALLOW_CREDENTIALS = True  # Allow cookies (needed for session auth)

# CSRF trusted origins — needed for SPA frontends making POST requests
CSRF_TRUSTED_ORIGINS = [
    os.getenv('FRONTEND_URL', 'http://localhost:5173'),
]


# =============================================================================
# DEFAULT PRIMARY KEY TYPE
# =============================================================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
