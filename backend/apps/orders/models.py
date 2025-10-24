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