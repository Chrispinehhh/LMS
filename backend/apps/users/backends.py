# apps/users/backends.py

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

# Get the currently active User model (our custom one in this case)
UserModel = get_user_model()

class EmailBackend(ModelBackend):
    """
    This is a custom authentication backend.
    It allows users to log in using their email address instead of their username.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Overrides the default authenticate method.
        'username' will be treated as an email address.
        """
        try:
            # We try to find a user whose email matches the 'username' parameter,
            # ignoring case (e.g., 'user@example.com' matches 'User@example.com').
            user = UserModel.objects.get(email__iexact=username)
        except UserModel.DoesNotExist:
            # If no user with that email is found, authentication fails.
            # We run this dummy password check to prevent "timing attacks",
            # where an attacker could guess if a user exists based on server response time.
            UserModel().set_password(password)
            return None
        except UserModel.MultipleObjectsReturned:
            # This is an edge case: if multiple users have the same email (if unique=False).
            # We get the first one, but you should enforce unique emails in your model.
            user = UserModel.objects.filter(email__iexact=username).order_by('id').first()

        # If a user was found, we now check their password.
        # We also use the user_can_authenticate helper to check if their account
        # is active and permitted to log in.
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        # If the password check fails, authentication fails.
        return None

    def get_user(self, user_id):
        """
        Standard method required by Django's auth system to retrieve a user by their ID.
        """
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None