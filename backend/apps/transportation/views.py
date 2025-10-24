# apps/transportation/views.py

from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import Vehicle, Driver, Shipment
from .serializers import VehicleSerializer, DriverSerializer, ShipmentSerializer
from .filters import ShipmentFilter 
from core.permissions import IsDriverUser, IsAdminOrManagerUser # Import both permissions

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
    
    # Let anyone read (GET), but only managers write (POST, PUT, PATCH, DELETE)
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAdminOrManagerUser]
        return super().get_permissions()
    
    filter_backends = [DjangoFilterBackend]
    filterset_class = ShipmentFilter


class MyAssignedJobsView(generics.ListAPIView):
    """
    Returns a list of shipments (jobs) assigned to the currently
    authenticated DRIVER user.
    """
    serializer_class = ShipmentSerializer
    permission_classes = [IsDriverUser] # This is the only permission needed.

    def get_queryset(self):
        """
        This view returns a list of all shipments for the
        currently authenticated user's driver profile.
        The IsDriverUser permission ensures request.user has a driver_profile.
        """
        # Because of IsDriverUser, we can be confident user.driver_profile exists.
        return Shipment.objects.filter(driver=self.request.user.driver_profile).order_by('job__requested_pickup_date')