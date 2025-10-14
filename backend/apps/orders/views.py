from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from .models import Job
from .serializers import JobSerializer
from core.permissions import IsAdminOrManagerUser
from transportation.models import Shipment
from billing.models import Invoice
from datetime import date, timedelta

class JobViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Job records.
    It automatically creates a corresponding Shipment and Invoice upon job creation.
    """
    queryset = Job.objects.all().select_related('customer').order_by('-created_at')
    serializer_class = JobSerializer
    permission_classes = [IsAdminOrManagerUser]

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
        # Using get_or_create to ensure idempotence, though simple 'create' is fine too
        # in a well-controlled perform_create environment.
        Shipment.objects.get_or_create(
            job=job_instance,
            defaults={
                'driver': None,
                'vehicle': None,
                'status': Shipment.ShipmentStatus.PENDING
            }
        )

        # --- Logic to create the Invoice ---

        # Start with a base fee
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


# --- ADD THIS NEW VIEW ---
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

        # The logic for creating Shipments and Invoices will need to be
        # triggered here as well, or preferably, moved to a signal or the model's
        # save method to apply to all new Job creations.
        # For now, let's replicate the logic from the ViewSet.

        Shipment.objects.get_or_create(
            job=job_instance,
            defaults={
                'driver': None,
                'vehicle': None,
                'status': Shipment.ShipmentStatus.PENDING
            }
        )

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