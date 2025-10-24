# apps/core/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.users.models import User
from apps.transportation.models import Driver  # Import the Driver model


class IsAdminUser(BasePermission):
    """
    Allows access only to users with the ADMIN role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.ADMIN
        )


class IsManagerUser(BasePermission):
    """
    Allows access only to users with the MANAGER role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.MANAGER
        )


class IsAdminOrManagerUser(BasePermission):
    """
    Allows access only to users with ADMIN or MANAGER roles.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return bool(request.user.role in [User.Role.ADMIN, User.Role.MANAGER])


class IsDriverUser(BasePermission):
    """
    Allows access only to authenticated users who have an associated Driver profile.
    FIXED: Now uses the correct related_name from Driver model.
    """
    def has_permission(self, request, view):
        # First, ensure the user is logged in at all.
        if not (request.user and request.user.is_authenticated):
            return False
        
        # FIXED: Use the correct related_name 'driver_profile' to check if Driver exists
        return hasattr(request.user, 'driver_profile')


class IsAdminOrReadOnly(BasePermission):
    """
    Allows read-only access for any user, but write access is restricted to ADMIN users.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.ADMIN
        )
    
class IsOwnerOrAssignedDriverOrAdmin(BasePermission):
    """
    Object-level permission to only allow owners of an object, an assigned driver,
    or an admin/manager to view it.
    """
    def has_object_permission(self, request, view, obj):
        # 'obj' is the Job instance.

        # Admin and Manager can see everything.
        if request.user.role in [User.Role.ADMIN, User.Role.MANAGER]:
            return True

        # The customer who created the job can see it.
        if obj.customer == request.user:
            return True

        # The driver assigned to the job's shipment can see it.
        # We safely check if the shipment and driver exist.
        if hasattr(obj, 'shipment') and obj.shipment.driver and obj.shipment.driver.user == request.user:
            return True

        return False