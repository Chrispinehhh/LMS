# apps/quoting/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from .serializers import QuoteRequestSerializer, QuoteResponseSerializer
from .models import QuoteRequest


class InstantQuoteView(APIView):
    """
    POST /api/v1/quotes/instant-estimate/
    Provides instant quote estimation without authentication
    """
    permission_classes = []  # Public endpoint
    
    def post(self, request):
        """Calculate instant quote based on simple algorithm"""
        serializer = QuoteRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Simple pricing algorithm
        price = self.calculate_price(
            data['package_type'],
            data['weight'],
            data['origin'],
            data['destination']
        )
        
        # Estimate delivery days based on distance (simplified)
        estimated_days = self.estimate_delivery_days(data['origin'], data['destination'])
        
        # Mock distance (in production, use Google Distance Matrix API)
        distance = self.estimate_distance(data['origin'], data['destination'])
        
        # Save quote request for analytics (optional)
        try:
            quote_request = QuoteRequest.objects.create(
                customer=request.user if request.user.is_authenticated else None,
                origin=data['origin'],
                destination=data['destination'],
                package_type=data['package_type'],
                weight=data['weight'],
                estimated_price=price,
                estimated_days=estimated_days,
                distance_miles=distance
            )
        except Exception as e:
            # Log but don't fail if save fails
            print(f"Failed to save quote request: {e}")
        
        response_data = {
            'price': price,
            'estimated_days': estimated_days,
            'distance': distance,
            'service_type': 'STANDARD'
        }
        
        response_serializer = QuoteResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    def calculate_price(self, package_type, weight, origin, destination):
        """
        Simple pricing algorithm
        Base price + (weight factor) + (package type multiplier)
        """
        base_price = Decimal('50.00')
        
        # Weight-based pricing ($0.50 per lb)
        weight_cost = Decimal(str(weight)) * Decimal('0.50')
        
        # Package type multiplier
        package_multipliers = {
            'small': Decimal('1.0'),
            'medium': Decimal('1.5'),
            'large': Decimal('2.0'),
            'pallet': Decimal('3.0'),
        }
        multiplier = package_multipliers.get(package_type, Decimal('1.0'))
        
        # Distance-based cost (mock calculation)
        distance = self.estimate_distance(origin, destination)
        distance_cost = Decimal(str(distance)) * Decimal('0.15')
        
        total = (base_price + weight_cost + distance_cost) * multiplier
        
        # Round to 2 decimal places
        return round(total, 2)
    
    def estimate_delivery_days(self, origin, destination):
        """
        Estimate delivery days based on distance
        In production, use real distance calculation
        """
        distance = self.estimate_distance(origin, destination)
        
        if distance < 500:
            return "1-2"
        elif distance < 1500:
            return "2-3"
        elif distance < 2500:
            return "3-4"
        else:
            return "4-5"
    
    def estimate_distance(self, origin, destination):
        """
        Mock distance calculation
        In production, integrate with Google Distance Matrix API
        """
        # Simple hash-based mock for consistent results
        combined = f"{origin}{destination}".lower()
        hash_value = sum(ord(c) for c in combined)
        
        # Return value between 100 and 3000 miles
        return (hash_value % 2900) + 100
