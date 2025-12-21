# apps/transportation/models.py

from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.orders.models import Job


class Vehicle(BaseModel):
    """
    Represents a delivery vehicle.
    """

    class VehicleStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        IN_USE = 'IN_USE', 'In Use'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'

    license_plate = models.CharField(max_length=20, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    capacity_kg = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=VehicleStatus.choices,
        default=VehicleStatus.AVAILABLE
    )

    def __str__(self):
        return f"{self.make} {self.model} ({self.license_plate})"


class Driver(BaseModel):
    """
    Represents a driver, linked to a user account.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="driver_profile",
    )
    license_number = models.CharField(max_length=50, unique=True)
    phone_number = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.user.username


class Shipment(BaseModel):
    """
    Represents the shipment for a specific job.
    """

    class ShipmentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending Assignment"
        IN_TRANSIT = "IN_TRANSIT", "In Transit"
        DELIVERED = "DELIVERED", "Delivered"
        FAILED = "FAILED", "Failed Delivery"

    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='shipment')
    
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="shipments",
    )
    driver = models.ForeignKey(
        Driver,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="shipments",
    )
    status = models.CharField(
        max_length=20, choices=ShipmentStatus.choices, default=ShipmentStatus.PENDING
    )

    estimated_departure = models.DateTimeField(null=True, blank=True)
    actual_departure = models.DateTimeField(null=True, blank=True)
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    actual_arrival = models.DateTimeField(null=True, blank=True)

    # Proof of delivery image field (Deprecated in favor of ShipmentPhoto, but kept for legacy)
    proof_of_delivery_image = models.ImageField(
        upload_to='proof_of_delivery/', 
        null=True, 
        blank=True
    )
    
    # New: Signature field
    proof_of_delivery_signature = models.ImageField(
        upload_to='signatures/',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Shipment for Job #{self.job.job_number}"


class ShipmentPhoto(BaseModel):
    """
    Allows multiple photos for a single shipment's Proof of Delivery and Condition.
    """
    class PhotoType(models.TextChoices):
        PRE_MOVE = 'PRE_MOVE', 'Pre-Move Condition'
        POST_MOVE = 'POST_MOVE', 'Post-Move Condition'
        POD = 'POD', 'Proof of Delivery'
        OTHER = 'OTHER', 'Other'

    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='proof_of_delivery/')
    photo_type = models.CharField(max_length=20, choices=PhotoType.choices, default=PhotoType.POD)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo for Shipment {self.shipment.id} at {self.uploaded_at}"


class MaintenanceLog(BaseModel):
    """
    Records maintenance and repair activities for a vehicle.
    """
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_logs')
    service_date = models.DateField()
    service_description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Service for {self.vehicle.license_plate} on {self.service_date}"