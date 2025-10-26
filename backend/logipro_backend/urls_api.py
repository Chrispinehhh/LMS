# logipro_backend/urls_api.py

from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

# Import all views from their respective apps
from apps.core.views import health_check
from apps.users.views import (
    UserListView, 
    FirebaseLoginView, 
    CurrentUserView, 
    CreateUserView,
    EmailTokenObtainPairView
)

app_name = "api"

# We define URL patterns in logical groups
auth_patterns = [
    path("token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("firebase/", FirebaseLoginView.as_view(), name="firebase_login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

user_patterns = [
    path("", UserListView.as_view(), name="user-list"),
    path("create/", CreateUserView.as_view(), name="user-create"),
    path("me/", CurrentUserView.as_view(), name="user-me"),
]

transportation_patterns = [
    path("", include("apps.transportation.urls")),
]

urlpatterns = [
    # Core URL
    path("health-check/", health_check, name="health-check"),
    
    # Include URL groups with a clear prefix
    path("auth/", include(auth_patterns)),
    path("users/", include(user_patterns)),
    
    # Group transportation under its own prefix
    path("transportation/", include(transportation_patterns)),
    
    # Include URLs from our other apps
    path("", include("apps.orders.urls")), # Provides /api/v1/jobs/
    path("billing/", include("apps.billing.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("reports/", include("apps.reports.urls")),
]