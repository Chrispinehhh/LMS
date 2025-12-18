# apps/quoting/models.py

from django.db import models
from apps.core.models import BaseModel
from django.conf import settings


class QuoteRequest(BaseModel):
    """
    Stores instant quote requests for analytics
    """
    PACKAGE_TYPE_CHOICES = [
        ('small', 'Small (< 50 lbs)'),
        ('medium', 'Medium (50-150 lbs)'),
        ('large', 'Large (150-500 lbs)'),
        ('pallet', 'Pallet (500+ lbs)'),
    ]
    
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='quote_requests'
    )
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    package_type = models.CharField(max_length=20, choices=PACKAGE_TYPE_CHOICES)
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_days = models.CharField(max_length=20)
    distance_miles = models.IntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Quote Request'
        verbose_name_plural = 'Quote Requests'
    
    def __str__(self):
        return f"Quote: {self.origin} → {self.destination} (${self.estimated_price})"
