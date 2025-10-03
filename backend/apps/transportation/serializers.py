# apps/transportation/serializers.py

from rest_framework import serializers
from .models import Vehicle, Driver, Shipment
from users.models import User
from users.serializers import UserSerializer
from orders.serializers import JobSerializer

# This serializer should be defined first
class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

# This serializer should be defined second
class DriverSerializer(serializers.ModelSerializer):
    # For READ operations, show the nested user object
    user = UserSerializer(read_only=True)
    
    # --- THIS IS THE KEY CHANGE ---
    # For WRITE operations, accept the user's UUID
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )

    class Meta:
        model = Driver
        fields = ['id', 'user', 'user_id', 'license_number', 'phone_number']

# This serializer is defined last so it can use the ones above
class ShipmentSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    driver = DriverSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)

    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source='driver',
        write_only=True,
        required=False,
        allow_null=True
    )
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source='vehicle',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Shipment
        fields = [
            'id', 
            'job', 
            'vehicle', 
            'vehicle_id', 
            'driver', 
            'driver_id',
            'status', 
            'estimated_departure', 
            'actual_departure',
            'estimated_arrival', 
            'actual_arrival'
        ]