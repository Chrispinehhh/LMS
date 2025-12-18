# apps/users/customer_views.py
"""
Customer-facing API views for the customer portal
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User, CustomerAddress
from .serializers import UserSerializer, CustomerAddressSerializer


class CustomerProfileViewSet(viewsets.ModelViewSet):
    """
    Customer profile management
    GET /api/v1/customers/me/ - Get current user profile
    PUT /api/v1/customers/me/ - Update current user profile
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'put', 'patch']

    def get_queryset(self):
        # Only return the current user
        return User.objects.filter(id=self.request.user.id, role=User.Role.CUSTOMER)

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class CustomerAddressViewSet(viewsets.ModelViewSet):
    """
    Customer address book management
    GET /api/v1/customers/me/addresses/ - List all addresses
    POST /api/v1/customers/me/addresses/ - Create new address
    GET /api/v1/customers/me/addresses/{id}/ - Get address detail
    PUT /api/v1/customers/me/addresses/{id}/ - Update address
    DELETE /api/v1/customers/me/addresses/{id}/ - Delete address
    """
    serializer_class = CustomerAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return addresses for the current user
        return CustomerAddress.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the customer to the current user
        serializer.save(customer=self.request.user)

    def perform_update(self, serializer):
        # Ensure the customer field cannot be changed
        serializer.save(customer=self.request.user)
