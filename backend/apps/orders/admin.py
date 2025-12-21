# apps/orders/admin.py

from django.contrib import admin
from .models import Job, JobTimeline
from apps.transportation.models import Shipment

class ShipmentInline(admin.StackedInline):
    model = Shipment
    extra = 0 # One-to-One, so no extra needed typically
    can_delete = False
    readonly_fields = ('proof_of_delivery_image',) # View POD in admin
    fields = ('driver', 'vehicle', 'status', 'proof_of_delivery_image')

class JobTimelineInline(admin.TabularInline):
    model = JobTimeline
    extra = 1
    readonly_fields = ('timestamp',)

@admin.register(JobTimeline)
class JobTimelineAdmin(admin.ModelAdmin):
    list_display = ('job', 'status', 'timestamp', 'location', 'is_current')
    list_filter = ('status', 'is_current', 'timestamp')
    search_fields = ('job__job_number', 'job__id', 'location', 'description')
    autocomplete_fields = ['job']

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Job model.
    """
    inlines = [ShipmentInline, JobTimelineInline]  # Add ShipmentInline

    list_display = (
        'job_number', # Show friendly job number first
        'customer', 
        'service_type',
        'pickup_city', 
        'delivery_city',
        'requested_pickup_date',
        'created_at',
        'created_at',
    )
    
    list_filter = (
        'service_type', 
        'pickup_city',
        'delivery_city',
        'requested_pickup_date',
        'created_at'
    )
    
    search_fields = (
        'job_number', # Search by simplified ID
        'id', 
        'customer__username', 
        'customer__email',
        'pickup_city', 
        'delivery_city',
        'pickup_contact_person',
        'delivery_contact_person'
    )
    
    readonly_fields = ('job_number', 'created_at', 'updated_at', 'id')
    autocomplete_fields = ['customer']

    # Organize the detail view into sections
    fieldsets = (
        ('Identity', {
            'fields': (
                'job_number',
                'id',
            )
        }),
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
        ('Residential Details', {
            'fields': ('crew_size', 'estimated_items'),
            'classes': ('collapse',),
            'description': 'Fields specific to Residential jobs.'
        }),
        ('Commercial Details', {
            'fields': ('is_hazardous', 'bol_number'),
            'classes': ('collapse',),
            'description': 'Fields specific to Commercial jobs.'
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