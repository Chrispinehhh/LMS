# apps/core/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.users.models import User
from apps.transportation.models import Driver # Import the Driver model

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


# --- THIS IS THE FINAL, CORRECTED CLASS ---
class IsDriverUser(BasePermission):
    """
    Allows access only to authenticated users who have an associated Driver profile.
    This is the definitive check.
    """
    def has_permission(self, request, view):
        # First, ensure the user is logged in at all.
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Now, explicitly check if a Driver profile exists for this user.
        # This is the most reliable check and does not depend on roles or related_names.
        return Driver.objects.filter(user=request.user).exists()


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