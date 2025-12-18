# apps/orders/customer_urls.py
"""
URL patterns for customer-facing job/order APIs
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .customer_views import CustomerJobViewSet

router = DefaultRouter()
router.register(r'', CustomerJobViewSet, basename='customer-job')

urlpatterns = router.urls
