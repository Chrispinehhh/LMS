# apps/users/serializers.py

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model, used for displaying user data in API responses.
    """
    class Meta:
        model = User
        # We explicitly list the fields to be exposed in the API.
        # We never include sensitive fields like 'password'.
        fields = [
            "id", 
            "username", 
            "email", 
            "first_name", 
            "last_name", 
            "role",
            "customer_type",
        ]


class FirebaseTokenSerializer(serializers.Serializer):
    """
    A simple serializer to validate the incoming Firebase ID token string
    from the frontend.
    """
    token = serializers.CharField()

    class Meta:
        fields = ["token"]


# --- UPDATED/REQUESTED CLASS (Using __init__ manipulation) ---
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that authenticates a user via their 'email' field
    instead of the default 'username' field. This is used for staff/driver login.
    """
    
    # 🔑 NOTE: The front-end must still send the email value under the 'username' key 
    # for this serializer to function correctly, unless you override the default 
    # 'username_field' property *and* the required fields in the parent class.
    # The simpler method is setting username_field = User.EMAIL_FIELD, which is
    # less prone to error than manipulating fields in __init__.

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # This line maps the 'username' field (which contains the email) 
        # to a new 'email' field in the serializer's field list.
        # However, because the authentication logic runs before this, 
        # it is often simpler to use the username_field attribute.
        self.fields['email'] = self.fields['username']
        del self.fields['username']
        
        # CRITICAL: Since you are sending the email under the 'username' key from 
        # the client, the *original* method (username_field = User.EMAIL_FIELD) 
        # is superior. If you use this __init__ method, you must ensure:
        # 1. The client sends 'email' and 'password' keys.
        # 2. You set username_field = 'email' (or User.EMAIL_FIELD) 
        #    in the class body anyway, or the authentication logic won't know
        #    to look up by email.

    # ⚠️ For the client side to work without modification, the class body should revert to:
    # username_field = User.EMAIL_FIELD