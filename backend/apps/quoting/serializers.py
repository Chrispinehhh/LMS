# apps/quoting/serializers.py

from rest_framework import serializers
from .models import QuoteRequest


class QuoteRequestSerializer(serializers.Serializer):
    """
    Serializer for instant quote estimation request
    """
    origin = serializers.CharField(max_length=255, required=True)
    destination = serializers.CharField(max_length=255, required=True)
    packageType = serializers.CharField(max_length=20, required=True, source='package_type')
    weight = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    
    def validate_packageType(self, value):
        """Validate package type"""
        valid_types = ['small', 'medium', 'large', 'pallet']
        if value.lower() not in valid_types:
            raise serializers.ValidationError(f"Package type must be one of: {', '.join(valid_types)}")
        return value.lower()
    
    def validate_weight(self, value):
        """Validate weight is positive"""
        if value <= 0:
            raise serializers.ValidationError("Weight must be greater than 0")
        return value


class QuoteResponseSerializer(serializers.Serializer):
    """
    Serializer for instant quote estimation response
    """
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    estimatedDays = serializers.CharField(source='estimated_days')
    distance = serializers.IntegerField(required=False)
    serviceType = serializers.CharField(default='STANDARD', source='service_type')
