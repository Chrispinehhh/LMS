# apps/transportation/views.py

from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from .models import Vehicle, Driver, Shipment
from .serializers import (
    VehicleSerializer, 
    DriverSerializer, 
    ShipmentSerializer,
    MyJobsShipmentSerializer
)
from .filters import ShipmentFilter 
from apps.core.permissions import IsDriverUser, IsAdminOrManagerUser


class VehicleViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing Vehicle instances.
    Accessible by Managers and Admins.
    """
    queryset = Vehicle.objects.all().order_by('make', 'model')
    serializer_class = VehicleSerializer
    permission_classes = [IsAdminOrManagerUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']


class DriverViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing Driver profiles.
    Also includes a custom action for drivers to get their own jobs.
    """
    queryset = Driver.objects.all().select_related('user').order_by('user__first_name')
    serializer_class = DriverSerializer
    permission_classes = [IsAdminOrManagerUser]

    @action(
        detail=False, 
        methods=['get'], 
        url_path='me/jobs', 
        permission_classes=[IsDriverUser]
    )
    def my_jobs(self, request):
        """
        An endpoint for a driver to retrieve their own assigned jobs.
        Accessible at /api/v1/drivers/me/jobs/
        """
        try:
            # The IsDriverUser permission should ensure this exists, but we check to be safe
            driver_profile = request.user.driver_profile
            
            assigned_shipments = Shipment.objects.filter(
                driver=driver_profile
            ).select_related('job__customer').order_by('job__requested_pickup_date')
            
            # Use the lightweight serializer for the list view
            serializer = MyJobsShipmentSerializer(assigned_shipments, many=True)
            return Response(serializer.data)
        except Driver.DoesNotExist:
            # This will be caught by the IsDriverUser permission, but is a good fallback.
            return Response({"detail": "No driver profile found for this user."}, status=403)


class ShipmentViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing Shipments.
    Publicly readable (for tracking), but only editable by Managers/Admins.
    """
    queryset = Shipment.objects.all().select_related(
        'job__customer', 'vehicle', 'driver__user'
    )
    serializer_class = ShipmentSerializer
    
    def get_permissions(self):
        """
        Custom permissions:
        - Anyone can list/retrieve shipments
        - Drivers can upload POD and update their own shipments
        - Only admins/managers can create/delete shipments
        """
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        elif self.action in ['upload_pod', 'partial_update', 'update', 'mark_delivered']:
            # Allow drivers to upload POD and update their shipments
            self.permission_classes = [IsDriverUser]
        else:
            self.permission_classes = [IsAdminOrManagerUser]
        return super().get_permissions()
    
    filter_backends = [DjangoFilterBackend]
    filterset_class = ShipmentFilter
    
    def partial_update(self, request, *args, **kwargs):
        """
        Handle PATCH requests with debugging and security checks
        """
        print(f"🔧 DEBUG: PATCH request for shipment {kwargs.get('pk')}")
        print(f"🔧 DEBUG: Request data: {request.data}")
        print(f"🔧 DEBUG: User: {request.user.id}, has driver profile: {hasattr(request.user, 'driver_profile')}")
        
        # Get the shipment first to check permissions
        shipment = self.get_object()
        print(f"🔧 DEBUG: Shipment driver: {shipment.driver}, Request user: {request.user}")
        
        # Security check for drivers
        if hasattr(request.user, 'driver_profile'):
            if shipment.driver is None or shipment.driver.user != request.user:
                print("🔧 DEBUG: Permission denied - user not assigned to this shipment")
                return Response(
                    {"error": "You can only update your own shipments."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        print(f"🔧 DEBUG: Permission granted, updating shipment {shipment.id}")
        return super().partial_update(request, *args, **kwargs)
    
    @action(
        detail=True, 
        methods=['post'], 
        url_path='upload-pod',
        parser_classes=[MultiPartParser, FormParser],
        permission_classes=[IsDriverUser]
    )
    def upload_pod(self, request, pk=None):
        """
        Custom action for a driver to upload a Proof of Delivery image.
        Accessible at /api/v1/transportation/shipments/{pk}/upload-pod/
        """
        try:
            shipment = self.get_object()
            print(f"🚚 DEBUG: User {request.user.id} uploading POD for shipment {shipment.id}")
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Security check
        if shipment.driver is None or shipment.driver.user != request.user:
            return Response(
                {"error": "You are not authorized to upload a POD for this shipment."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Enhanced debugging - see exactly what's in the request
        print(f"🔍 DEBUG: Request method: {request.method}")
        print(f"🔍 DEBUG: Request content type: {request.content_type}")
        print(f"🔍 DEBUG: Request data keys: {list(request.data.keys())}")
        print(f"🔍 DEBUG: Request FILES keys: {list(request.FILES.keys())}")
        
        # Log all data keys and their types
        for key in request.data:
            value = request.data[key]
            print(f"🔍 DEBUG: Data['{key}'] = {type(value)}: {str(value)[:100]}...")
            
        for key in request.FILES:
            file_obj = request.FILES[key]
            print(f"🔍 DEBUG: FILES['{key}'] = {file_obj.name} ({file_obj.content_type}, {file_obj.size} bytes)")
    
        # Check both FILES and data for the image
        image_file = request.FILES.get('proof_of_delivery_image')
        
        if not image_file:
            # If not in FILES, check if it's in data (might be base64 or string)
            potential_file = request.data.get('proof_of_delivery_image')
            if potential_file:
                print(f"⚠️ DEBUG: Found 'proof_of_delivery_image' in data (not FILES), type: {type(potential_file)}")
                if hasattr(potential_file, 'read'):  # It might be a file-like object
                    image_file = potential_file
                    print("✅ DEBUG: Using file-like object from data")
                else:
                    print(f"❌ DEBUG: Value in data is not a file: {str(potential_file)[:200]}")
            else:
                print("❌ DEBUG: No 'proof_of_delivery_image' found in FILES or data")
        
        if not image_file:
            return Response({
                "error": "No image file provided.",
                "details": {
                    "files_keys": list(request.FILES.keys()),
                    "data_keys": list(request.data.keys()),
                    "content_type": request.content_type
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        print(f"✅ DEBUG: Image file found: {image_file}")
        print(f"✅ DEBUG: Image file type: {type(image_file)}")
        
        # Only validate if it's a proper file object
        if hasattr(image_file, 'content_type'):
            print(f"✅ DEBUG: File details - name: {image_file.name}, size: {image_file.size}, content_type: {image_file.content_type}")
            
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            max_size = 5 * 1024 * 1024  # 5MB
            
            if image_file.content_type not in allowed_types:
                return Response(
                    {"error": f"Invalid file type: {image_file.content_type}. Only JPEG, PNG, and GIF images are allowed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if image_file.size > max_size:
                return Response(
                    {"error": f"File too large: {image_file.size} bytes. Maximum size is 5MB."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            print(f"⚠️ DEBUG: Image file is not a standard file object, proceeding anyway")

        try:
            # Update the proof of delivery image and status
            shipment.proof_of_delivery_image = image_file
            shipment.status = Shipment.ShipmentStatus.DELIVERED
            shipment.save()

            print(f"🎉 DEBUG: Successfully updated shipment {shipment.id} to DELIVERED")
            print(f"🎉 DEBUG: Proof of delivery image saved: {shipment.proof_of_delivery_image}")

            # Re-serialize the object
            serializer = self.get_serializer(shipment)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"💥 DEBUG: Error saving shipment: {str(e)}")
            import traceback
            print(f"💥 DEBUG: Traceback: {traceback.format_exc()}")
            return Response(
                {"error": f"Failed to save shipment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True, 
        methods=['post'], 
        url_path='mark-delivered',
        permission_classes=[IsDriverUser]
    )
    def mark_delivered(self, request, pk=None):
        """
        Custom action to mark a shipment as delivered without uploading a photo.
        Accessible at /api/v1/transportation/shipments/{pk}/mark-delivered/
        """
        try:
            shipment = self.get_object()
            print(f"📦 DEBUG: Marking shipment {shipment.id} as delivered without photo")
            print(f"📦 DEBUG: User: {request.user.id}, Shipment driver: {shipment.driver}")
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Security check
        if shipment.driver is None or shipment.driver.user != request.user:
            return Response(
                {"error": "You are not authorized to update this shipment."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Update the status to DELIVERED
            shipment.status = Shipment.ShipmentStatus.DELIVERED
            shipment.save()

            print(f"✅ DEBUG: Successfully marked shipment {shipment.id} as DELIVERED")

            # Re-serialize the object
            serializer = self.get_serializer(shipment)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"💥 DEBUG: Error marking shipment as delivered: {str(e)}")
            return Response(
                {"error": f"Failed to update shipment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )