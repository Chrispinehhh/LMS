# apps/orders/models.py

from django.db import models
from django.conf import settings
from apps.core.models import BaseModel

class Job(BaseModel):
    """
    Represents a transportation job requested by a customer.
    The status of the job is now derived from its related Shipment.
    """
    class ServiceType(models.TextChoices):
        RESIDENTIAL_MOVING = 'RESIDENTIAL_MOVING', 'Residential Moving'
        OFFICE_RELOCATION = 'OFFICE_RELOCATION', 'Office Relocation'
        PALLET_DELIVERY = 'PALLET_DELIVERY', 'Pallet Delivery'
        SMALL_DELIVERIES = 'SMALL_DELIVERIES', 'Small Deliveries'

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='jobs')
    
    service_type = models.CharField(
        max_length=50, 
        choices=ServiceType.choices,
        default=ServiceType.SMALL_DELIVERIES
    )
    
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

    def __str__(self):
        return f"Job {self.id} for {self.customer.username if self.customer else 'N/A'}"


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