# apps/orders/models.py

from django.db import models
from django.conf import settings
from apps.core.models import BaseModel

class Job(BaseModel):
    """
    Represents a transportation job requested by a customer.
    The status of the job is now derived from its related Shipment.
    """
    class JobType(models.TextChoices):
        RESIDENTIAL = 'RESIDENTIAL', 'Residential (Movers)'
        COMMERCIAL = 'COMMERCIAL', 'Commercial (Freight)'

    class PricingModel(models.TextChoices):
        HOURLY = 'HOURLY', 'Hourly Rate + Travel Fee'
        FLAT_RATE = 'FLAT_RATE', 'Flat Lane Rate'
        CWT = 'CWT', 'CWT (Per 100 lbs)'

    # Human-readable job number (auto-incrementing)
    job_number = models.PositiveIntegerField(unique=True, editable=False, null=True, blank=True)

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='jobs')
    
    # Core Classification
    job_type = models.CharField(
        max_length=20,
        choices=JobType.choices,
        default=JobType.COMMERCIAL
    )
    
    # Keeping service_type for backward compatibility but making it optional or mapped
    service_type = models.CharField(
        max_length=50, 
        blank=True,
        null=True,
        help_text="Legacy field, use job_type for new logic"
    )
    
    # Residential Metrics
    room_count = models.PositiveIntegerField(null=True, blank=True, help_text="For Residential: Number of rooms")
    volume_cf = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="For Residential: Volume in cubic feet")
    estimated_items = models.JSONField(default=dict, blank=True, help_text="For Residential: Inventory list (e.g. {'sofa': 2})")
    crew_size = models.PositiveSmallIntegerField(null=True, blank=True, help_text="For Residential: Number of movers required")
    
    # Commercial Metrics
    pallet_count = models.PositiveIntegerField(null=True, blank=True, help_text="For Commercial: Number of pallets")
    weight_lbs = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="For Commercial: Weight in lbs")
    is_hazardous = models.BooleanField(default=False, help_text="For Commercial: Hazardous material flag")
    bol_number = models.CharField(max_length=50, unique=True, null=True, blank=True, help_text="For Commercial: Bill of Lading Number")
    
    # Pricing
    pricing_model = models.CharField(
        max_length=20,
        choices=PricingModel.choices,
        default=PricingModel.FLAT_RATE
    )
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="For Hourly pricing")
    travel_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="For Hourly pricing")
    cwt_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="For CWT pricing")
    flat_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="For Flat Rate pricing")

    cargo_description = models.TextField()
    
    # Pickup Information
    pickup_address = models.TextField()
    pickup_city = models.CharField(max_length=100)
    pickup_contact_person = models.CharField(max_length=100)
    pickup_contact_phone = models.CharField(max_length=20)
    
    # Delivery Information
    delivery_address = models.TextField()
    delivery_city = models.CharField(max_length=100)
    delivery_contact_person = models.CharField(max_length=100)
    delivery_contact_phone = models.CharField(max_length=20)

    requested_pickup_date = models.DateTimeField()


    # --- THE 'status' FIELD HAS BEEN REMOVED FROM THIS MODEL ---

    def save(self, *args, **kwargs):
        if self.job_number is None:
            # Get the highest job number and increment
            last_job = Job.objects.order_by('-job_number').first()
            if last_job and last_job.job_number:
                self.job_number = last_job.job_number + 1
            else:
                self.job_number = 1001  # Start from 1001
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Job #{self.job_number or self.id} for {self.customer.username if self.customer else 'N/A'}"


class JobTimeline(BaseModel):
    """
    Tracks the status history of a job from placement to delivery
    """
    class Status(models.TextChoices):
        ORDER_PLACED = 'ORDER_PLACED', 'Order Placed'
        PICKED_UP = 'PICKED_UP', 'Picked Up'
        IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='timeline')
    status = models.CharField(max_length=50, choices=Status.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=255)
    description = models.TextField()
    completed = models.BooleanField(default=True)
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']
        verbose_name = 'Job Timeline'
        verbose_name_plural = 'Job Timelines'

    def __str__(self):
        return f"{self.job.id} - {self.get_status_display()} at {self.timestamp}"

    def save(self,  *args, **kwargs):
        # Ensure only one current status per job
        if self.is_current:
            JobTimeline.objects.filter(
                job=self.job,
                is_current=True
            ).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)