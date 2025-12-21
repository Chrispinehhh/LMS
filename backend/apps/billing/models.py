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

    # --- Financials ---
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Snapshot of the tax rule applied
    tax_rule_applied = models.JSONField(null=True, blank=True, help_text="Snapshot of the TaxRule used (rate, name, region)")

    def calculate_totals(self):
        """
        Helper method to auto-calculate totals based on active TaxRule for the jobs region if possible.
        For now, this is a placeholder for the logic.
        """
        self.total_amount = self.subtotal + self.tax_amount

    def __str__(self):
        return f"Invoice {self.id} for Job {self.job.id}"


class TaxRule(BaseModel):
    """
    Defines tax rates for different regions (e.g., ON, BC, KENYA).
    """
    region_code = models.CharField(max_length=10, unique=True, help_text="e.g. 'ON', 'BC', 'KE'")
    tax_name = models.CharField(max_length=50, help_text="e.g. 'HST', 'GST+PST', 'VAT'")
    rate = models.DecimalField(max_digits=5, decimal_places=4, help_text="e.g. 0.1300 for 13%")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.region_code} - {self.tax_name} ({self.rate * 100}%)"