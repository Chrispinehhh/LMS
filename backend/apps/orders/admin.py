# apps/orders/admin.py

from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Job model.
    """
    list_display = (
        'id', 
        'customer', 
        'service_type',
        'pickup_city', 
        'delivery_city',
        'pickup_contact_person',
        'delivery_contact_person',
        'requested_pickup_date',
        'created_at'
    )
    
    list_filter = (
        'service_type', 
        'pickup_city',
        'delivery_city',
        'requested_pickup_date',
        'created_at'
    )
    
    search_fields = (
        'id', 
        'customer__username', 
        'customer__email',
        'pickup_city', 
        'delivery_city',
        'pickup_address',
        'delivery_address',
        'pickup_contact_person',
        'delivery_contact_person',
        'pickup_contact_phone',
        'delivery_contact_phone',
        'cargo_description'
    )
    
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['customer']

    # Organize the detail view into sections
    fieldsets = (
        ('Job Overview', {
            'fields': (
                'customer', 
                'service_type', 
                'cargo_description', 
                'requested_pickup_date'
            )
        }),
        ('Pickup Information', {
            'fields': (
                'pickup_address', 
                'pickup_city', 
                'pickup_contact_person', 
                'pickup_contact_phone'
            )
        }),
        ('Delivery Information', {
            'fields': (
                'delivery_address', 
                'delivery_city', 
                'delivery_contact_person', 
                'delivery_contact_phone'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)  # Makes this section collapsible
        }),
    )

    # Add date hierarchy for easy navigation by date
    date_hierarchy = 'created_at'
    
    # Show most recent jobs first by default
    ordering = ('-created_at',)