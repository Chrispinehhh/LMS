# apps/billing/models.py

from django.db import models
from apps.core.models import BaseModel
from apps.orders.models import Job

class Invoice(BaseModel):
    class InvoiceStatus(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        SENT = 'SENT', 'Sent'
        PAID = 'PAID', 'Paid'
        VOID = 'VOID', 'Void'

    # --- ADD THIS NEW CLASS FOR PAYMENT METHODS ---
    class PaymentMethod(models.TextChoices):
        NOT_PAID = 'NOT_PAID', 'Not Paid'
        STRIPE = 'STRIPE', 'Stripe'
        PAYPAL = 'PAYPAL', 'PayPal'
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        CARD = 'CARD', 'Card (Manual)'
        CHEQUE = 'CHEQUE', 'Cheque'

    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='invoice')
    status = models.CharField(max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT)
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    
    # --- ADD THESE TWO NEW FIELDS ---
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.NOT_PAID
    )
    payment_notes = models.TextField(blank=True, help_text="Internal notes for manual payments (e.g., cheque number, transaction ID).")

    def __str__(self):
        return f"Invoice {self.id} for Job {self.job.id}"