# apps/orders/customer_views.py
"""
Customer-facing job/order API views
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job, JobTimeline
from .serializers import JobSerializer, JobTimelineSerializer


class CustomerJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Customer job management (read-only for customers)
    GET /api/v1/customers/me/orders/ - List customer's jobs with filtering
    GET /api/v1/customers/me/orders/{id}/ - Get job detail with timeline
    """
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['service_type']
    search_fields = ['id', 'pickup_address', 'delivery_address', 'pickup_city', 'delivery_city']
    ordering_fields = ['created_at', 'requested_pickup_date']
    ordering = ['-created_at']

    def get_queryset(self):
        # Only return jobs for the current user
        queryset = Job.objects.filter(customer=self.request.user).prefetch_related('timeline')
        
        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            # Filter by timeline status
            queryset = queryset.filter(timeline__status=status_param, timeline__is_current=True)
        
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get customer order statistics"""
        total = self.get_queryset().count()
        in_transit = self.get_queryset().filter(
            timeline__status=JobTimeline.Status.IN_TRANSIT,
            timeline__is_current=True
        ).count()
        delivered = self.get_queryset().filter(
            timeline__status=JobTimeline.Status.DELIVERED,
            timeline__is_current=True
        ).count()
        
        return Response({
            'total': total,
            'active': in_transit,
            'completed': delivered,
        })


class TrackingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public tracking endpoint (no auth required)
    GET /api/v1/tracking/{job_id}/ - Get tracking information
    """
    serializer_class = JobSerializer
    permission_classes = []  # Public endpoint
    lookup_field = 'id'

    def get_queryset(self):
        return Job.objects.all().prefetch_related('timeline')

    def retrieve(self, request, *args, **kwargs):
        """Get tracking details for a specific job"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Include additional tracking-specific data
        data = serializer.data
        
        # Add current location from most recent timeline entry
        current_timeline = instance.timeline.filter(is_current=True).first()
        if current_timeline:
            data['current_location'] = current_timeline.location
            data['current_status'] = current_timeline.get_status_display()
        else:
            data['current_location'] = instance.pickup_city
            data['current_status'] = 'Pending'
        
        # Add driver info if assigned (this would come from transportation app)
        # For now, return placeholder
        data['driver'] = None
        
        # Add proof of delivery if exists
        data['proof'] = {
            'signature': None,
            'photo': None
        }
        
        return Response(data)
