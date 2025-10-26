# logipro_backend/settings.py

import os
from pathlib import Path
from datetime import timedelta
import environ

# --- 1. ENVIRONMENT VARIABLE SETUP ---
env = environ.Env(
    DEBUG=(bool, False),
    # Add file upload size limits as environment variables
    FILE_UPLOAD_MAX_MEMORY_SIZE=(int, 5242880),  # 5MB default
    DATA_UPLOAD_MAX_MEMORY_SIZE=(int, 5242880),  # 5MB default
)
BASE_DIR = Path(__file__).resolve().parent.parent
# Read the .env file from the backend root
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))


# --- 2. CORE DJANGO SETTINGS ---
DEBUG = env('DEBUG')
SECRET_KEY = env('SECRET_KEY')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])


# --- 3. APPLICATION DEFINITION ---
INSTALLED_APPS = [
    # Default Django apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    # Third-Party Apps
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    
    # Local (Our) Apps
    "apps.core.apps.CoreConfig",
    "apps.users.apps.UsersConfig",
    "apps.orders.apps.OrdersConfig",
    "apps.transportation.apps.TransportationConfig",
    "apps.billing.apps.BillingConfig",
    "apps.notifications.apps.NotificationsConfig",
    "apps.reports.apps.ReportsConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "logipro_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "logipro_backend.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    { "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator" },
    { "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator" },
    { "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator" },
    { "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator" },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- MEDIA FILE CONFIGURATION ---
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# --- FILE UPLOAD CONFIGURATION (ENHANCED) ---
FILE_UPLOAD_MAX_MEMORY_SIZE = env('FILE_UPLOAD_MAX_MEMORY_SIZE')  # 5MB default
DATA_UPLOAD_MAX_MEMORY_SIZE = env('DATA_UPLOAD_MAX_MEMORY_SIZE')  # 5MB default
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000  # Increase if needed for complex forms


# --- 4. CUSTOM APP & THIRD-PARTY CONFIGURATIONS ---

# Custom User Model
AUTH_USER_MODEL = "users.User"

# Custom Authentication Backend
AUTHENTICATION_BACKENDS = [
    'apps.users.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [ 
        "rest_framework.permissions.IsAuthenticated" 
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [ 
        "rest_framework_simplejwt.authentication.JWTAuthentication" 
    ],
    "DEFAULT_FILTER_BACKENDS": [ 
        'django_filters.rest_framework.DjangoFilterBackend' 
    ],
    "DEFAULT_PARSER_CLASSES": [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',  # Important for file uploads
        'rest_framework.parsers.FormParser',
    ],
    # Optional: Add pagination
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# Simple JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# CORS - Cross-Origin Resource Sharing
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])
CORS_ALLOW_CREDENTIALS = True

# Add CORS settings for file uploads
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Firebase, Stripe, Twilio
GOOGLE_APPLICATION_CREDENTIALS = env("GOOGLE_APPLICATION_CREDENTIALS")
STRIPE_PUBLISHABLE_KEY = env("STRIPE_PUBLISHABLE_KEY")
STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET")
TWILIO_ACCOUNT_SID = env("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = env("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = env("TWILIO_PHONE_NUMBER")


# --- 5. APPLICATION STARTUP INITIALIZATION ---
if GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(os.path.join(BASE_DIR, GOOGLE_APPLICATION_CREDENTIALS)):
    try:
        from apps.core.firebase import initialize_firebase_admin
        print("Attempting to initialize Firebase Admin SDK...")
        initialize_firebase_admin()
        print("Firebase Admin SDK initialization check complete.")
    except ImportError:
        print("WARNING: Could not import firebase initializer. Check dotted paths.")
else:
    print("WARNING: GOOGLE_APPLICATION_CREDENTIALS not set or file not found. Firebase Admin SDK not initialized.")