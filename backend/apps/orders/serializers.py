# apps/orders/serializers.py

from rest_framework import serializers
from .models import Job
from apps.users.models import User
from apps.users.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    """
    Serializer for the Job model.
    """
    # On read requests, display the full nested customer object.
    customer = UserSerializer(read_only=True)
    
    # On write requests (POST/PUT), we expect a UUID for the customer.
    # This field will be used to look up the User instance.
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='customer', 
        write_only=True
    )

    class Meta:
        model = Job
        fields = [
            'id',
            'customer',
            'customer_id',
            'status',
            'service_type', # Make sure this is in the list
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