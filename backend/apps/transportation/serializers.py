# apps/transportation/serializers.py

from rest_framework import serializers
from .models import Vehicle, Driver, Shipment
from apps.users.models import User
from apps.users.serializers import UserSerializer
from apps.orders.serializers import JobSerializer

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )

    class Meta:
        model = Driver
        fields = ['id', 'user', 'user_id', 'license_number', 'phone_number']

class ShipmentSerializer(serializers.ModelSerializer):
    """
    A detailed serializer for viewing a single shipment, used for the manager's
    Job Detail page.
    """
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
            'id', 'job', 'vehicle', 'vehicle_id', 'driver', 'driver_id',
            'status', 'estimated_departure', 'actual_departure',
            'estimated_arrival', 'actual_arrival'
        ]


# --- THIS IS THE NEW, LIGHTWEIGHT SERIALIZER ---
class MyJobsShipmentSerializer(serializers.ModelSerializer):
    """
    A lightweight, "flat" serializer for the 'My Assigned Jobs' list.
    It provides just enough information for the driver's mobile app list view.
    """
    # We use source='job.*' to pull fields from the related Job model
    # directly into the top level of this serializer's output.
    job_id = serializers.UUIDField(source='job.id', read_only=True)
    pickup_address = serializers.CharField(source='job.pickup_address', read_only=True)
    delivery_address = serializers.CharField(source='job.delivery_address', read_only=True)
    requested_pickup_date = serializers.DateTimeField(source='job.requested_pickup_date', read_only=True)
    customer_name = serializers.CharField(source='job.customer.get_full_name', read_only=True)


    class Meta:
        model = Shipment
        # The fields are now a flat structure, which is simple and efficient.
        fields = [
            'id', 
            'status',
            'job_id',
            'customer_name',
            'pickup_address',
            'delivery_address',
            'requested_pickup_date',
        ]