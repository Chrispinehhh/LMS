# apps/orders/serializers.py

from rest_framework import serializers
from .models import Job
from apps.users.models import User
from apps.users.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    """
    Serializer for the Job model.
    """
    customer = UserSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='customer',
        write_only=True
    )

    # --- THIS IS THE KEY CHANGE ---
    # This field is read-only and gets its value from the 'status'
    # attribute of the related 'shipment' object.
    status = serializers.CharField(source='shipment.status', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'customer',
            'customer_id',
            'status', # The status now comes from the shipment
            'service_type',
            'cargo_description',
            'pickup_address',
            'pickup_city',
            'pickup_contact_person',
            'pickup_contact_phone',
            'delivery_address',
            'delivery_city',
            'delivery_contact_person',
            'delivery_contact_phone',
            'requested_pickup_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']