# apps/users/customer_urls.py
"""
URL patterns for customer-facing APIs
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .customer_views import CustomerProfileViewSet, CustomerAddressViewSet

router = DefaultRouter()
router.register(r'addresses', CustomerAddressViewSet, basename='customer-address')

urlpatterns = [
    # Customer profile endpoint
    path('me/', CustomerProfileViewSet.as_view({'get': 'me', 'put': 'update', 'patch': 'partial_update'}), name='customer-profile'),
    
    # Address book endpoints
    path('', include(router.urls)),
]
