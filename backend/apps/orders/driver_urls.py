from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .driver_views import DriverJobViewSet

router = DefaultRouter()
router.register(r'jobs', DriverJobViewSet, basename='driver-job')

urlpatterns = [
    path('', include(router.urls)),
]
