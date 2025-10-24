# apps/transportation/views.py

from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
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
    Accessible by Managers and Admins.
    """
    queryset = Driver.objects.all().select_related('user').order_by('user__first_name')
    serializer_class = DriverSerializer
    permission_classes = [IsAdminOrManagerUser]


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


# --- THIS IS THE FINAL, CORRECTED VIEW ---
class MyAssignedJobsView(generics.ListAPIView):
    """
    Returns a list of shipments (jobs) assigned to the currently
    authenticated DRIVER user.
    """
    serializer_class = MyJobsShipmentSerializer
    permission_classes = [IsDriverUser] # It now uses our definitive permission class

    def get_queryset(self):
        """
        This view returns a list of all shipments for the
        currently authenticated user's driver profile.
        The IsDriverUser permission guarantees a Driver profile exists.
        """
        # This is the most robust and direct way to get the data.
        # It finds shipments where the driver's related user is the current user.
        return Shipment.objects.filter(
            driver__user=self.request.user
        ).select_related('job__customer').order_by('job__requested_pickup_date')