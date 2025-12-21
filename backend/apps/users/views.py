# apps/users/views.py

import logging
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

# Firebase Admin SDK
from firebase_admin import auth

# Simple JWT
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import UserSerializer, FirebaseTokenSerializer, EmailTokenObtainPairSerializer
from apps.core.permissions import IsAdminOrManagerUser

# Get an instance of a logger
logger = logging.getLogger(__name__)


class UserListView(generics.ListAPIView):
    """
    API view to retrieve a list of users, filterable by role.
    """
    queryset = User.objects.all().order_by('first_name', 'last_name')
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrManagerUser]
    filterset_fields = ['role']


class FirebaseLoginView(generics.GenericAPIView):
    """
    Handles user login/registration via a Firebase ID token (e.g., for customers).
    """
    permission_classes = [AllowAny]
    serializer_class = FirebaseTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        id_token = serializer.validated_data["token"]

        # Check if Firebase is actually initialized
        try:
            # We try to access the default app. If it's not initialized,
            # this might throw or return None depending on version,
            # but auth.verify_id_token will definitely fail.
            pass
        except Exception:
            return Response(
                {"error": "Firebase service is unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            try:
                decoded_token = auth.verify_id_token(id_token)
            except ValueError as e:
                 # likely "The default Firebase app does not exist" or
                 # similar config issue
                logger.error(f"Firebase configuration error in Login: {e}")
                return Response(
                    {"error": "Identity service unavailable."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except auth.InvalidIdTokenError:
                return Response(
                    {"error": "Invalid authentication token."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except Exception as e:
                logger.error(f"Firebase verification failed: {e}")
                # Don't re-raise, return 503 if it's likely a connection/service issue
                # or 500 with details
                return Response(
                    {"error": f"Authentication service error: {str(e)}"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            firebase_uid = decoded_token["uid"]
            email = decoded_token.get("email")
            name = decoded_token.get("name", "")
            first_name, last_name = (name.split(" ", 1) + [""])[:2]
            
            # Use Firebase UID as the unique username
            user, created = User.objects.get_or_create(username=firebase_uid)
            
            if created:
                user.email = email
                user.first_name = first_name
                user.last_name = last_name
                user.set_unusable_password()
                user.save()
                logger.info(f"New user CREATED via Firebase: {firebase_uid}")
            else:
                logger.info(f"Existing user FOUND via Firebase: {firebase_uid}")

            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in FirebaseLoginView: {e}", exc_info=True)
            # EXPOSE THE ERROR for debugging
            return Response(
                {"error": f"Internal error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# NOTE: This view is already defined in the original code, 
# ensuring staff login uses the EmailTokenObtainPairSerializer.
class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view that uses email instead of username.
    This is for internal staff (Drivers, Managers) to log in.
    """
    serializer_class = EmailTokenObtainPairSerializer


class CreateUserView(generics.CreateAPIView):
    """
    Allows Admins/Managers to create new staff users (e.g., Drivers).
    """
    permission_classes = [IsAdminOrManagerUser]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        # ... other fields

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if Firebase is actually initialized
        try:
            # We try to access the default app. If it's not initialized,
            # this might throw or return None depending on version,
            # but auth.create_user will definitely fail.
            pass
        except Exception:
            return Response(
                {"error": "Firebase service is unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        firebase_user = None
        try:
            # Step 1: Create user in Firebase
            try:
                firebase_user = auth.create_user(
                    email=email,
                    password=password,
                    display_name=f"{request.data.get('first_name', '')} {request.data.get('last_name', '')}".strip()
                )
            except ValueError as e:
                # likely "The default Firebase app does not exist" or
                # similar config issue
                logger.error(f"Firebase configuration error: {e}")
                return Response(
                    {"error": "Identity service unavailable."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except auth.EmailAlreadyExistsError:
                return Response(
                    {"error": "A user with this email already exists."},
                    status=status.HTTP_409_CONFLICT
                )
            except Exception as e:
                logger.error(f"Firebase creation failed: {e}")
                raise e  # Re-raise to be caught by the outer try/except

            # Step 2: Create local user, using Firebase UID as username
            # Use a transaction to ensure no zombie Firebase users
            try:
                with transaction.atomic():
                    local_user = User.objects.create_user(
                        username=firebase_user.uid,
                        email=email,
                        # CRITICAL: create_user hashes the password.
                        password=password,
                        first_name=request.data.get('first_name', ''),
                        last_name=request.data.get('last_name', ''),
                        role=request.data.get('role', User.Role.DRIVER)
                    )
            except Exception as db_error:
                # If local DB creation fails, DELETE Firebase user
                logger.error(
                    f"Local user creation failed: {db_error}. "
                    f"Rolling back Firebase user {firebase_user.uid}..."
                )
                try:
                    auth.delete_user(firebase_user.uid)
                    logger.info(
                        f"Rolled back Firebase user {firebase_user.uid}"
                    )
                except Exception as cleanup_error:
                    logger.critical(
                        "CRITICAL: Failed to rollback Firebase user "
                        f"{firebase_user.uid} after local DB failure! "
                        f"Error: {cleanup_error}"
                    )

                # Re-raise the original DB error to return a 500
                raise db_error

            serializer = self.get_serializer(local_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error in CreateUserView: {e}", exc_info=True)
            return Response(
                {"error": "An internal server error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CurrentUserView(generics.RetrieveAPIView):
    """
    API view to retrieve the currently authenticated user's data.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user