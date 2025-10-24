# logipro_backend/settings.py

import os
from pathlib import Path
from datetime import timedelta
import environ

# --- 1. ENVIRONMENT VARIABLE SETUP ---
env = environ.Env(
    DEBUG=(bool, False) # Define DEBUG casting and default
)
BASE_DIR = Path(__file__).resolve().parent.parent
# Read the .env file from the backend root
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))


# --- 2. CORE DJANGO SETTINGS ---
# All secrets and environment-specific settings are read from the .env file.
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
    
    # --- THIS IS THE KEY FIX ---
    # Local (Our) Apps - Using the full dotted path to the AppConfig class
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


# --- 4. CUSTOM APP & THIRD-PARTY CONFIGURATIONS ---

# Custom User Model (must use 'app_label.ModelName' format)
AUTH_USER_MODEL = "users.User"

# Custom Authentication Backend (must use full Python dotted path)
AUTHENTICATION_BACKENDS = [
    'apps.users.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [ "rest_framework.permissions.IsAuthenticated" ],
    "DEFAULT_AUTHENTICATION_CLASSES": [ "rest_framework_simplejwt.authentication.JWTAuthentication" ],
    "DEFAULT_FILTER_BACKENDS": [ 'django_filters.rest_framework.DjangoFilterBackend' ],
}

# Simple JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# CORS - Cross-Origin Resource Sharing
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])

# Firebase, Stripe, Twilio (read from environment)
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