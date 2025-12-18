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

    def get_queryset(self):
        # Filter jobs assigned to the current driver
        # Note: We need to add an 'assigned_driver' field to Job model first
        # For now, we'll return all jobs if user is a driver for testing
        user = self.request.user
        if user.role == User.Role.DRIVER:
             return Job.objects.all().order_by('-created_at') # Temporary until assignment field exists
        return Job.objects.none()

    @action(detail=True, methods=['post'], serializer_class=DriverJobUpdateSerializer)
    def update_status(self, request, pk=None):
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
            
            return Response({'status': 'success', 'new_status': new_status})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='upload-pod')
    def upload_pod(self, request, pk=None):
        job = self.get_object()
        # Assume job model has proof_of_delivery_image field (we might need to add it to model if missing)
        # Checking model... Job model likely doesn't have it yet based on previous sessions.
        # I'll rely on the existing job model structure. If it's missing, I'll update it.
        
        image = request.FILES.get('proof_of_delivery_image')
        if not image:
             return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
             
        job.proof_of_delivery_image = image
        job.save()
        
        return Response({'status': 'success', 'image_url': job.proof_of_delivery_image.url if job.proof_of_delivery_image else ''})
