# apps/orders/serializers.py

from rest_framework import serializers
from .models import Job, JobTimeline
from apps.users.models import User
from apps.users.serializers import UserSerializer


class JobTimelineSerializer(serializers.ModelSerializer):
    """
    Serializer for job status timeline
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = JobTimeline
        fields = [
            'id',
            'status',
            'status_display',
            'timestamp',
            'location',
            'description',
            'completed',
            'is_current',
        ]
        read_only_fields = ['id', 'timestamp']


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
    
    # Include timeline in read operations
    timeline = JobTimelineSerializer(many=True, read_only=True)

    # --- IMPROVED VERSION WITH ERROR HANDLING ---
    status = serializers.SerializerMethodField(read_only=True)
    estimated_delivery = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'customer',
            'customer_id',
            'status', # The status now comes from the current timeline entry
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
            'estimated_delivery',
            'timeline',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['status', 'estimated_delivery', 'timeline', 'created_at', 'updated_at']

    def get_status(self, obj):
        """
        Get status from current timeline entry or shipment
        """
        try:
            # First check if there's a current timeline entry
            current_timeline = obj.timeline.filter(is_current=True).first()
            if current_timeline:
                return current_timeline.status
            
            # Fall back to shipment status if available
            if hasattr(obj, 'shipment') and obj.shipment:
                return obj.shipment.status
            return 'PENDING'
        except Exception:
            return 'PENDING'
    
    def get_estimated_delivery(self, obj):
        """
        Calculate estimated delivery based on pickup date
        """
        from datetime import timedelta
        if obj.requested_pickup_date:
            # Add 2-3 days for standard delivery
            return obj.requested_pickup_date + timedelta(days=3)
        return None


class DriverJobSerializer(serializers.ModelSerializer):
    """
    Simplified job serializer for driver list view.
    """
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    status = serializers.SerializerMethodField()
    proof_of_delivery_image = serializers.ImageField(read_only=True)  # Add this field
    
    class Meta:
        model = Job
        fields = [
            'id',
            'status',
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
            'customer_name',
            'customer_phone',
            'proof_of_delivery_image', # Add this field
        ]

    def get_status(self, obj):
        # Helper to get status from current timeline
        timeline = obj.timeline.filter(is_current=True).first()
        return timeline.status if timeline else 'PENDING'


class DriverJobUpdateSerializer(serializers.Serializer):
    """
    Serializer to handle driver status updates (Pickup -> In Transit -> Delivered)
    """
    status = serializers.ChoiceField(choices=JobTimeline.Status.choices)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)

class DriverPODUploadSerializer(serializers.Serializer):
    proof_of_delivery_image = serializers.ImageField()