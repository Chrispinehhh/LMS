from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, BookingView

router = DefaultRouter()

# Register the JobViewSet for admin/manager access
# This creates URLs like /jobs/ and /jobs/{id}/
router.register(r'jobs', JobViewSet, basename='job')

# Start with the router's automatically generated URLs
urlpatterns = router.urls

# Append the new, specific path for customer bookings
urlpatterns += [
    path('book/', BookingView.as_view(), name='customer-booking'),
]