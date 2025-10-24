# apps/transportation/views.py

from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

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

    # --- THIS IS THE NEW, CORRECT METHOD ---
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
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAdminOrManagerUser]
        return super().get_permissions()
    
    filter_backends = [DjangoFilterBackend]
    filterset_class = ShipmentFilter


# --- THIS VIEW IS NO LONGER NEEDED AND HAS BEEN DELETED ---
# class MyAssignedJobsView(generics.ListAPIView):
#    ...