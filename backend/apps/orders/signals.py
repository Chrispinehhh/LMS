# apps/orders/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Job
from transportation.models import Shipment

@receiver(post_save, sender=Job)
def create_shipment_for_job(sender, instance, created, **kwargs):
    """
    Automatically create a Shipment record when a new Job is created.
    """
    if created:
        job=instance,
        driver=None,
        vehicle=None,
        status=Shipment.ShipmentStatus.PENDING