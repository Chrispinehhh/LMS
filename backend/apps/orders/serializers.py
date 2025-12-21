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
            'job_number',
            'customer',
            'customer_id',
            'status', # The status now comes from the current timeline entry
            'job_type',
            'service_type', # Legacy support
            'room_count',
            'volume_cf',
            'pallet_count',
            'weight_lbs',
            'pricing_model',
            'hourly_rate',
            'travel_fee',
            'cwt_rate',
            'flat_rate',
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
        read_only_fields = ['status', 'estimated_delivery', 'timeline', 'created_at', 'updated_at', 'job_number']

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
    proof_of_delivery_image = serializers.SerializerMethodField()
    assigned_driver = serializers.SerializerMethodField()
    # Alias job_number to job_id to match frontend JobDetail interface
    job_id = serializers.IntegerField(source='job_number', read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id',
            'job_id',
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
            'proof_of_delivery_image',
            'assigned_driver',
        ]

    def get_status(self, obj):
        # Helper to get status from current timeline
        timeline = obj.timeline.filter(is_current=True).first()
        return timeline.status if timeline else 'PENDING'

    def get_proof_of_delivery_image(self, obj):
        # Safely access the shipment's POD image
        if hasattr(obj, 'shipment') and obj.shipment.proof_of_delivery_image:
            return obj.shipment.proof_of_delivery_image.url
        return None

    def get_assigned_driver(self, obj):
        # Safely access the shipment's driver name
        if hasattr(obj, 'shipment') and obj.shipment.driver:
            return obj.shipment.driver.user.get_full_name()
        return None


class DriverJobUpdateSerializer(serializers.Serializer):
    """
    Serializer to handle driver status updates (Pickup -> In Transit -> Delivered)
    """
    status = serializers.ChoiceField(choices=JobTimeline.Status.choices)
    location = serializers.CharField(max_length=255, required=False, allow_blank=True)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)

class DriverPODUploadSerializer(serializers.Serializer):
    proof_of_delivery_image = serializers.ImageField()