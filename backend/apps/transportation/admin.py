# apps/transportation/admin.py

from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Vehicle, Driver, Shipment, MaintenanceLog


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        'license_plate', 
        'make', 
        'model', 
        'year',
        'capacity_kg', 
        'status',
        'created_at'
    )
    list_filter = ('status', 'make', 'year')
    search_fields = ('license_plate', 'make', 'model')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': (
                'license_plate',
                'make',
                'model',
                'year',
                'capacity_kg'
            )
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = (
        'user', 
        'license_number', 
        'phone_number',
        'created_at'
    )
    search_fields = (
        'license_number', 
        'user__username', 
        'user__email',
        'phone_number'
    )
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)
    
    fieldsets = (
        ('Driver Information', {
            'fields': (
                'user',
                'license_number',
                'phone_number'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'job', 
        'driver', 
        'vehicle', 
        'status',
        'estimated_arrival',
        'actual_arrival',
        'created_at',
        'has_proof_of_delivery'
    )
    list_filter = (
        'status',
        'estimated_arrival',
        'actual_arrival'
    )
    search_fields = (
        'id', 
        'job__id', 
        'driver__user__username',
        'vehicle__license_plate'
    )
    readonly_fields = ('created_at', 'updated_at', 'proof_of_delivery_preview')
    raw_id_fields = ('job', 'driver', 'vehicle')
    
    fieldsets = (
        ('Shipment Assignment', {
            'fields': (
                'job',
                'driver',
                'vehicle',
                'status'
            )
        }),
        ('Schedule - Estimated', {
            'fields': (
                'estimated_departure',
                'estimated_arrival'
            )
        }),
        ('Schedule - Actual', {
            'fields': (
                'actual_departure',
                'actual_arrival'
            )
        }),
        ('Proof of Delivery', {
            'fields': (
                'proof_of_delivery_image',
                'proof_of_delivery_preview',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def proof_of_delivery_preview(self, obj):
        if obj.proof_of_delivery_image:
            return mark_safe(f'<img src="{obj.proof_of_delivery_image.url}" style="max-height: 200px; max-width: 300px;" />')
        return "No proof of delivery image uploaded"
    
    proof_of_delivery_preview.short_description = "Current Proof of Delivery"

    def has_proof_of_delivery(self, obj):
        return bool(obj.proof_of_delivery_image)
    
    has_proof_of_delivery.boolean = True
    has_proof_of_delivery.short_description = "POD"


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = (
        'vehicle',
        'service_date',
        'cost',
        'created_at'
    )
    list_filter = (
        'service_date',
        'vehicle'
    )
    search_fields = (
        'vehicle__license_plate',
        'service_description'
    )
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('vehicle',)
    
    fieldsets = (
        ('Maintenance Details', {
            'fields': (
                'vehicle',
                'service_date',
                'service_description',
                'cost'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )