import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MANAGER = "MANAGER", "Manager"
        DRIVER = "DRIVER", "Driver"
        CUSTOMER = "CUSTOMER", "Customer"

    # --- ADDED CustomerType CLASS ---
    class CustomerType(models.TextChoices):
        ONE_TIME = 'ONE_TIME', 'One-Time'
        REGULAR = 'REGULAR', 'Regular'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)

    # --- ADDED customer_type FIELD ---
    customer_type = models.CharField(
        max_length=20, 
        choices=CustomerType.choices, 
        default=CustomerType.ONE_TIME
    )

    def __str__(self):
        return self.username


class CustomerAddress(models.Model):
    """
    Customer address book for storing saved pickup/delivery locations
    """
    class AddressLabel(models.TextChoices):
        HOME = 'HOME', 'Home'
        OFFICE = 'OFFICE', 'Office'
        WAREHOUSE = 'WAREHOUSE', 'Warehouse'
        OTHER = 'OTHER', 'Other'

    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='addresses',
        limit_choices_to={'role': User.Role.CUSTOMER}
    )
    label = models.CharField(max_length=20, choices=AddressLabel.choices)
    name = models.CharField(max_length=255, help_text="Contact person name")
    address1 = models.CharField(max_length=255)
    address2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2, help_text="Two-letter state code")
    zip_code = models.CharField(max_length=10)
    phone = models.CharField(max_length=20)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default', '-created_at']
        verbose_name = 'Customer Address'
        verbose_name_plural = 'Customer Addresses'

    def __str__(self):
        return f"{self.get_label_display()} - {self.name}"

    def save(self, *args, **kwargs):
        # Ensure only one default address per customer
        if self.is_default:
            CustomerAddress.objects.filter(
                customer=self.customer, 
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)