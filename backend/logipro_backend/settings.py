# logipro_backend/settings.py

"""
Django settings for logipro_backend project.
"""

import os
import sys
from pathlib import Path
from datetime import timedelta
import environ

# --- 1. SETUP ENVIRONMENT VARIABLES ---
# This section should be at the very top.
env = environ.Env(
    # set casting, default value
    DEBUG=(bool, False)
)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Take environment variables from .env file
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# Add our 'apps' directory to the Python path for cleaner imports
sys.path.insert(0, os.path.join(BASE_DIR, "apps"))


# --- 2. CORE DJANGO SETTINGS ---
# False if not in os.environ because of casting above
DEBUG = env('DEBUG')

# Raises Django's ImproperlyConfigured exception if SECRET_KEY not in os.environ
SECRET_KEY = env('SECRET_KEY')

# Read ALLOWED_HOSTS from .env, parsing a comma-separated string
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])


# Application definition
INSTALLED_APPS = [
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
    "core.apps.CoreConfig",
    "users.apps.UsersConfig",
    "orders.apps.OrdersConfig",
    "transportation.apps.TransportationConfig",
    "billing.apps.BillingConfig",
    "notifications.apps.NotificationsConfig",
    "reports.apps.ReportsConfig",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware", # Must be high up
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


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    { "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator" },
    { "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator" },
    { "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator" },
    { "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator" },
]


# Internationalization & Static Files
# https://docs.djangoproject.com/en/5.2/topics/i18n/
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.models.BigAutoField"


# --- 3. CUSTOM APP & THIRD-PARTY CONFIGURATIONS ---

# Custom User Model
AUTH_USER_MODEL = "users.User"

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        'django_filters.rest_framework.DjangoFilterBackend'
    ],
}

# Simple JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60), # Increased for easier development
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# CORS - Cross-Origin Resource Sharing
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['http://localhost:3000'])

# Firebase
GOOGLE_APPLICATION_CREDENTIALS = env("GOOGLE_APPLICATION_CREDENTIALS")

# Stripe
STRIPE_PUBLISHABLE_KEY = env("STRIPE_PUBLISHABLE_KEY")
STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET")

# Twilio
TWILIO_ACCOUNT_SID = env("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = env("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = env("TWILIO_PHONE_NUMBER")


# --- 4. APPLICATION STARTUP INITIALIZATION ---
# This code runs once when Django starts up.

# We only initialize Firebase if the credentials file is set, to prevent errors.
if GOOGLE_APPLICATION_CREDENTIALS:
    from apps.core.firebase import initialize_firebase_admin
    print("Attempting to initialize Firebase Admin SDK...")
    initialize_firebase_admin()
    print("Firebase Admin SDK initialization check complete.")
else:
    print("WARNING: GOOGLE_APPLICATION_CREDENTIALS not set. Firebase Admin SDK not initialized.")