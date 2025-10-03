from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend # <-- ADDED IMPORT
from .models import Vehicle, Driver, Shipment
from .serializers import VehicleSerializer, DriverSerializer, ShipmentSerializer
from core.permissions import IsAdminOrManagerUser


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAdminOrManagerUser]


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().select_related("user")
    serializer_class = DriverSerializer
    permission_classes = [IsAdminOrManagerUser]


class ShipmentViewSet(viewsets.ModelViewSet):
    # UPDATED: Renamed 'order' to 'job', and added 'driver__user' for related data
    queryset = Shipment.objects.all().select_related('job', 'vehicle', 'driver__user')
    serializer_class = ShipmentSerializer
    
    # UPDATED: Relaxed permission to IsAuthenticated (to allow drivers/customers to view their shipments)
    permission_classes = [IsAuthenticated] 
    
    # ADDED: Filtering capabilities
    filter_backends = [DjangoFilterBackend] 
    filterset_fields = ['job'] # <-- ADDED: Allows filtering shipments by job ID