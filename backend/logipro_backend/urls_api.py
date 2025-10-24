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
    EmailTokenObtainPairView # <-- Our custom view for email login
)

app_name = "api"

# We define URL patterns in logical groups
auth_patterns = [
    # For staff (drivers/managers) to log in with email and password
    path("token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    
    # For customers to log in via Google/Firebase
    path("firebase/", FirebaseLoginView.as_view(), name="firebase_login"),
    
    # For refreshing an expired access token
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

user_patterns = [
    # For managers to get a list of all users
    path("", UserListView.as_view(), name="user-list"),
    
    # For managers to create new staff users
    path("create/", CreateUserView.as_view(), name="user-create"),
    
    # For any authenticated user to get their own profile details
    path("me/", CurrentUserView.as_view(), name="user-me"),
]


urlpatterns = [
    # Core URL
    path("health-check/", health_check, name="health-check"),
    
    # Include URL groups with a clear prefix
    path("auth/", include(auth_patterns)),
    path("users/", include(user_patterns)),
    
    # Include URLs from our other apps
    path("", include("apps.orders.urls")), # Provides /api/v1/jobs/
    path("", include("apps.transportation.urls")), # Provides /api/v1/vehicles/, /drivers/, /shipments/
    path("billing/", include("apps.billing.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("reports/", include("apps.reports.urls")),
]