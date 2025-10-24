# apps/core/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS
from users.models import User # It's best practice to import User to access the Role enum

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
    Allows access only to users with the DRIVER role.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.DRIVER
        )

class IsAdminOrReadOnly(BasePermission):
    """
    Allows read-only access (GET, HEAD, OPTIONS) for any user,
    but write access (POST, PUT, PATCH, DELETE) is restricted to ADMIN users.
    """
    def has_permission(self, request, view):
        # Allow all read-only methods
        if request.method in SAFE_METHODS:
            return True

        # For write methods, require the user to be an admin
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == User.Role.ADMIN
        )