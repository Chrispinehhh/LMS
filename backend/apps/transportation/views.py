# apps/transportation/views.py

from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

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
        FIXED PERMISSIONS:
        - Safe methods (GET, HEAD, OPTIONS): AllowAny for tracking
        - Unsafe methods (POST, PUT, PATCH, DELETE): Admin/Manager only
        - Custom actions have their own specific permissions
        """
        print(f"🔐 PERMISSIONS: Action: {self.action}, Method: {self.request.method}")
        
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            # Allow anyone to view shipments (for tracking)
            self.permission_classes = [AllowAny]
            print("🔐 PERMISSIONS: Using AllowAny for safe method")
        elif self.action in ['upload_pod', 'mark_delivered', 'start_trip']:
            # Only drivers can upload POD, mark delivered, and start trips
            self.permission_classes = [IsDriverUser]
            print("🔐 PERMISSIONS: Using IsDriverUser for driver actions")
        else:
            # All other actions (create, update, partial_update, delete) require admin/manager
            self.permission_classes = [IsAdminOrManagerUser]
            print("🔐 PERMISSIONS: Using IsAdminOrManagerUser for admin actions")
        return super().get_permissions()
    
    filter_backends = [DjangoFilterBackend]
    filterset_class = ShipmentFilter

    # ADD THIS METHOD - Simple status update for drivers
    def update_status(self, request, pk=None, new_status=None):
        """Helper method to update shipment status"""
        try:
            shipment = self.get_object()
            print(f"🔄 STATUS UPDATE: Shipment {shipment.id}, User: {request.user.id}, New Status: {new_status}")
            
            # Security check - drivers can only update their own shipments
            if shipment.driver is None or shipment.driver.user != request.user:
                return Response(
                    {"error": "You are not authorized to update this shipment."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validate status transition
            valid_transitions = {
                'ASSIGNED': ['IN_TRANSIT'],
                'IN_TRANSIT': ['DELIVERED', 'FAILED'],
            }
            
            current_status = shipment.status
            if current_status in valid_transitions and new_status not in valid_transitions[current_status]:
                return Response(
                    {"error": f"Cannot transition from {current_status} to {new_status}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update status
            shipment.status = new_status
            if new_status == 'IN_TRANSIT':
                shipment.actual_departure = timezone.now()
            elif new_status == 'DELIVERED':
                shipment.actual_arrival = timezone.now()
                
            shipment.save()

            print(f"✅ STATUS UPDATE: Successfully updated shipment {shipment.id} to {new_status}")

            # Re-serialize the object
            serializer = self.get_serializer(shipment)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Shipment.DoesNotExist:
            return Response({"error": "Shipment not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"💥 STATUS UPDATE: Error: {str(e)}")
            return Response(
                {"error": f"Failed to update shipment: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(
        detail=True, 
        methods=['post'], 
        url_path='start-trip',
        permission_classes=[IsDriverUser]
    )
    def start_trip(self, request, pk=None):
        """
        Custom action for a driver to start a trip.
        Accessible at /api/v1/transportation/shipments/{pk}/start-trip/
        """
        print(f"🚛 START TRIP: Request received for shipment {pk}")
        return self.update_status(request, pk, 'IN_TRANSIT')
    
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

        # Security check - drivers can only update their own shipments
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
            shipment.status = 'DELIVERED'
            shipment.actual_arrival = timezone.now()  # Record arrival time
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
        print(f"📦 MARK DELIVERED: Request received for shipment {pk}")
        return self.update_status(request, pk, 'DELIVERED')
    
    def partial_update(self, request, *args, **kwargs):
        """
        Handle PATCH requests with debugging and security checks
        """
        print("🔧 VIEWSET: ===== PATCH REQUEST RECEIVED =====")
        print(f"🔧 VIEWSET: Shipment ID: {kwargs.get('pk')}")
        print(f"🔧 VIEWSET: Request data: {request.data}")
        print(f"🔧 VIEWSET: User: {request.user.id}, Role: {getattr(request.user, 'role', 'Unknown')}")
        
        try:
            # Get the shipment instance
            shipment = self.get_object()
            print(f"🔧 VIEWSET: Found shipment: {shipment.id}")
            print(f"🔧 VIEWSET: Current state - Driver: {shipment.driver}, Vehicle: {shipment.vehicle}, Status: {shipment.status}")
            
            print("🔧 VIEWSET: Permission granted, processing update...")
            
            # Create a clean copy of request data
            request_data = request.data.copy()
            print(f"🔧 VIEWSET: Original request data keys: {list(request_data.keys())}")
            
            # Remove status from request data to prevent conflicts - let serializer handle it
            if 'status' in request_data:
                print("🔧 VIEWSET: Removing 'status' from request data - will be handled automatically")
                del request_data['status']
            
            # Handle None values properly - convert string "None" to actual None
            for field in ['driver_id', 'vehicle_id']:
                if field in request_data:
                    if request_data[field] == 'None' or request_data[field] == '':
                        print(f"🔧 VIEWSET: Converting {field} from '{request_data[field]}' to actual None")
                        request_data[field] = None
                    else:
                        print(f"🔧 VIEWSET: {field} value: {request_data[field]} (type: {type(request_data[field])})")
            
            print(f"🔧 VIEWSET: Processing data after cleanup: {request_data}")
            
            # Initialize serializer with the cleaned data
            serializer = self.get_serializer(
                shipment, 
                data=request_data, 
                partial=True
            )
            
            print("🔧 VIEWSET: About to validate serializer...")
            
            # Manually call is_valid to see what happens
            is_valid = serializer.is_valid()
            print(f"🔧 VIEWSET: Serializer is_valid() returned: {is_valid}")
            
            if not is_valid:
                print("❌ VIEWSET: Serializer validation failed!")
                print(f"❌ VIEWSET: Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            print("🔧 VIEWSET: Serializer is valid, proceeding with update...")
            
            # Perform the update within a transaction
            with transaction.atomic():
                updated_instance = serializer.save()
                print(f"✅ VIEWSET: Update completed successfully for shipment {updated_instance.id}")
                
            # Return the serialized data
            return Response(serializer.data)
                
        except Exception as e:
            print(f"❌ VIEWSET: Unexpected error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"detail": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )