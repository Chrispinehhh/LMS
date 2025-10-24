# apps/users/views.py

import logging
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

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

        try:
            decoded_token = auth.verify_id_token(id_token)
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
            return Response({"error": "An internal error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Step 1: Create user in Firebase
            firebase_user = auth.create_user(
                email=email,
                password=password,
                display_name=f"{request.data.get('first_name', '')} {request.data.get('last_name', '')}".strip()
            )
            
            # Step 2: Create local user, using Firebase UID as username for consistency
            local_user = User.objects.create_user(
                username=firebase_user.uid, 
                email=email,
                # CRITICAL: Django's create_user automatically hashes the password.
                password=password, 
                first_name=request.data.get('first_name', ''),
                last_name=request.data.get('last_name', ''),
                role=request.data.get('role', User.Role.DRIVER)
            )
            
            serializer = self.get_serializer(local_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except auth.EmailAlreadyExistsError:
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            logger.error(f"Error in CreateUserView: {e}", exc_info=True)
            return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CurrentUserView(generics.RetrieveAPIView):
    """
    API view to retrieve the currently authenticated user's data.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user