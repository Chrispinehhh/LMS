from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Job, JobTimeline
from .serializers import DriverJobSerializer, DriverJobUpdateSerializer
from apps.users.models import User

class DriverJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for drivers to view their assigned jobs and update status.
    """
    serializer_class = DriverJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'job_number'

    def get_queryset(self):
        # Filter jobs assigned to the current driver via Shipment
        user = self.request.user
        if user.role == User.Role.DRIVER:
             # Ensure the user has a Driver profile and filter shipments
             return Job.objects.filter(shipment__driver__user=user).select_related('shipment').order_by('-created_at')
        return Job.objects.none()

    @action(detail=True, methods=['post'], serializer_class=DriverJobUpdateSerializer)
    def update_status(self, request, job_number=None, pk=None):
        job = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            new_status = serializer.validated_data['status']
            location = serializer.validated_data.get('location', '')
            description = serializer.validated_data.get('description', '')

            # Create new timeline entry
            JobTimeline.objects.create(
                job=job,
                status=new_status,
                location=location,
                description=description,
                timestamp=timezone.now(),
                is_current=True
            )
            
            # Auto-update Shipment status if applicable
            if hasattr(job, 'shipment'):
                if new_status == 'IN_TRANSIT':
                    job.shipment.status = 'IN_TRANSIT'
                elif new_status == 'DELIVERED':
                    job.shipment.status = 'DELIVERED'
                job.shipment.save()
            
            return Response({'status': 'success', 'new_status': new_status})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='upload-pod')
    def upload_pod(self, request, job_number=None, pk=None):
        job = self.get_object()
        
        if not hasattr(job, 'shipment'):
             return Response({'error': 'No shipment associated with this job'}, status=status.HTTP_404_NOT_FOUND)

        image = request.FILES.get('proof_of_delivery_image')
        if not image:
             return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
             
        job.shipment.proof_of_delivery_image = image
        job.shipment.save()
        
        return Response({'status': 'success', 'image_url': job.shipment.proof_of_delivery_image.url if job.shipment.proof_of_delivery_image else ''})
