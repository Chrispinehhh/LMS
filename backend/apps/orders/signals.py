# apps/orders/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Job
from apps.transportation.models import Shipment

@receiver(post_save, sender=Job)
def create_or_update_shipment_for_job(sender, instance, created, **kwargs):
    """
    Ensures a Shipment record exists for a Job and is in the correct
    initial state. This is robust against multiple signal triggers.
    """
    # This signal should only run when a new Job is first created.
    if not created:
        return

    try:
        # Step 1: Use get_or_create.
        # This will either find an existing shipment (created by a ghost signal)
        # or create a new one. `shipment_created` will be True only if it's new.
        shipment, shipment_created = Shipment.objects.get_or_create(job=instance)

        # Step 2: Enforce the correct initial state.
        # This is the most important part. Whether the shipment was just found
        # or just created, we explicitly set its fields to the correct
        # unassigned state.
        shipment.driver = None
        shipment.vehicle = None
        shipment.status = Shipment.ShipmentStatus.PENDING
        shipment.save()

        if shipment_created:
            print(f"SUCCESS: Created and reset initial shipment for job {instance.id}")
        else:
            print(f"WARNING: Shipment for job {instance.id} already existed. Resetting to initial state.")

    except Exception as e:
        # Log any unexpected errors during this process.
        print(f"CRITICAL ERROR in shipment signal for job {instance.id}: {e}")