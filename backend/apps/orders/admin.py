# apps/orders/admin.py

from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Job model.
    """
    # --- 'status' has been removed from list_display ---
    list_display = (
        'id', 
        'customer', 
        'service_type', # It's useful to see the service type here
        'pickup_city', 
        'delivery_city', 
        'requested_pickup_date'
    )
    
    # --- 'status' has been removed from list_filter ---
    list_filter = ('service_type', 'requested_pickup_date')
    
    search_fields = (
        'id', 
        'customer__username', 
        'pickup_city', 
        'delivery_city', 
        'cargo_description'
    )
    
    autocomplete_fields = ['customer']

    # Organize the detail view into sections
    fieldsets = (
        ('Job Overview', {
            # --- 'status' has been removed from the fields ---
            'fields': ('customer', 'service_type', 'cargo_description', 'requested_pickup_date')
        }),
        ('Pickup Information', {
            'fields': ('pickup_address', 'pickup_city', 'pickup_contact_person', 'pickup_contact_phone')
        }),
        ('Delivery Information', {
            'fields': ('delivery_address', 'delivery_city', 'delivery_contact_person', 'delivery_contact_phone')
        }),
    )