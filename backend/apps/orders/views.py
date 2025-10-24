# apps/orders/views.py
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from .models import Job
from .serializers import JobSerializer
# Import the custom permissions, including the new object-level one
from apps.core.permissions import IsAdminOrManagerUser, IsOwnerOrAssignedDriverOrAdmin
from apps.transportation.models import Shipment
from apps.billing.models import Invoice
from datetime import date, timedelta

class JobViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Job records.
    It automatically creates a corresponding Shipment and Invoice upon job creation.
    """
    # Use select_related for necessary lookups for efficient retrieval and permission checks
    queryset = Job.objects.all().select_related('customer', 'shipment__driver__user').order_by('-created_at')
    serializer_class = JobSerializer
    
    # -----------------------------------------------------------------------
    # 🛑 FIX: Use get_permissions to define permissions per action
    # -----------------------------------------------------------------------
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list' or self.action == 'create':
            # Only Admin or Manager can list all jobs or create new ones via the admin endpoint
            self.permission_classes = [IsAdminOrManagerUser]
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            # For detail actions, use the object-level permission
            self.permission_classes = [IsOwnerOrAssignedDriverOrAdmin]
        else:
            # Default fallback for any other custom actions
            self.permission_classes = [IsAuthenticated]
            
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        """
        Custom logic to run after a new job is created.
        1. Saves the Job instance.
        2. Creates an associated Shipment record (set to PENDING).
        3. Creates an associated Invoice record (set to DRAFT) with a 14-day due date.
        """
        # First, save the Job instance
        job_instance = serializer.save()

        # Now, create the associated Shipment record
        Shipment.objects.get_or_create(
            job=job_instance,
            defaults={
                'driver': None,
                'vehicle': None,
                'status': Shipment.ShipmentStatus.PENDING
            }
        )

        # --- Logic to create the Invoice ---
        total_amount = 50.00

        # Adjust price based on service type
        if job_instance.service_type == Job.ServiceType.RESIDENTIAL_MOVING:
            total_amount += 250.00
        elif job_instance.service_type == Job.ServiceType.OFFICE_RELOCATION:
            total_amount += 400.00
        elif job_instance.service_type == Job.ServiceType.PALLET_DELIVERY:
            total_amount += 100.00

        # Create the Invoice for this Job
        Invoice.objects.create(
            job=job_instance,
            total_amount=total_amount,
            # Set due date 14 days from today
            due_date=date.today() + timedelta(days=14),
            status=Invoice.InvoiceStatus.DRAFT  # Starts as a draft
        )

        print(f"SUCCESS: Shipment and Invoice created for new job {job_instance.id}.")


# -----------------------------------------------------------------------
# --- NEW VIEW: BookingView ---
# -----------------------------------------------------------------------

class BookingView(generics.CreateAPIView):
    """
    A public-facing view for authenticated customers to create a new job booking.
    It ensures that the customer creating the job is the one on the record.
    """
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated] # ANY logged-in user can access this

    def perform_create(self, serializer):
        """
        Override perform_create to force the customer to be the request.user.
        This is a critical security measure.
        """
        # We ignore any 'customer_id' sent in the request body and force
        # it to be the currently authenticated user.
        job_instance = serializer.save(customer=self.request.user)

        # Replicate Shipment creation logic
        Shipment.objects.get_or_create(
            job=job_instance,
            defaults={
                'driver': None,
                'vehicle': None,
                'status': Shipment.ShipmentStatus.PENDING
            }
        )

        # Replicate Invoice creation logic
        total_amount = 50.00
        if job_instance.service_type == Job.ServiceType.RESIDENTIAL_MOVING:
            total_amount += 250.00
        elif job_instance.service_type == Job.ServiceType.OFFICE_RELOCATION:
            total_amount += 400.00
        elif job_instance.service_type == Job.ServiceType.PALLET_DELIVERY:
            total_amount += 100.00

        Invoice.objects.create(
            job=job_instance,
            total_amount=total_amount,
            due_date=date.today() + timedelta(days=14),
            status=Invoice.InvoiceStatus.DRAFT
        )
        print(f"SUCCESS: Shipment and Invoice created for new job {job_instance.id} from BookingView.")