# apps/users/views.py

import logging
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

# Firebase Admin SDK
from firebase_admin import auth

# Simple JWT
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer, FirebaseTokenSerializer

# Get an instance of a logger
logger = logging.getLogger(__name__)


class UserListView(generics.ListAPIView):
    """
    API view to retrieve a list of users.
    NOTE: In a real app, you'd likely want this to be protected
    by a stricter permission like IsAdminOrManagerUser.
    """
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class FirebaseLoginView(generics.GenericAPIView):
    """
    Handles user login/registration via a Firebase ID token.
    Receives a Firebase token, verifies it, gets or creates a local user,
    and returns a local JWT (access and refresh tokens).
    """
    permission_classes = [AllowAny]
    serializer_class = FirebaseTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data["token"]

        try:
            logger.info("Attempting to verify Firebase ID token.")
            decoded_token = auth.verify_id_token(id_token)
            firebase_uid = decoded_token["uid"]
            email = decoded_token.get("email")
            
            # --- NEW: Get the name from the token ---
            name = decoded_token.get("name", "")
            # Safely split the name into first and last parts. Handles cases with no last name.
            first_name, last_name = (name.split(" ", 1) + [""])[:2]
            
            logger.info(f"Token verified successfully for UID: {firebase_uid}, Email: {email}, Name: {name}")

            logger.info(f"Attempting to get or create user with username={firebase_uid}.")
            # First, get or create the user based only on the unique username (Firebase UID)
            user, created = User.objects.get_or_create(username=firebase_uid)
            
            if created:
                # --- NEW: If created, populate their profile details ---
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
                # Set an unusable password since they authenticate via Firebase
                user.set_unusable_password()
                user.save()
                logger.info(f"New user CREATED with username: {firebase_uid}, Name: {name}")
            else:
                logger.info(f"Existing user FOUND with username: {firebase_uid}")

            logger.info(f"Generating local JWT for user {user.id}.")
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        except auth.InvalidIdTokenError as e:
            logger.warning(f"Invalid Firebase token received during login attempt: {e}")
            return Response(
                {"error": "Invalid Firebase token"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            logger.error(f"An unexpected error occurred in FirebaseLoginView: {e}", exc_info=True)
            return Response(
                {"error": "An internal server error occurred. Please check server logs."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CurrentUserView(generics.RetrieveAPIView):
    """
    API view to retrieve the currently authenticated user's data
    using our local JWT.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        # The JWTAuthentication class automatically attaches the user to the request
        return self.request.user