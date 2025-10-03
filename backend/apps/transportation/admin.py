# apps/transportation/admin.py

from django.contrib import admin
from .models import Vehicle, Driver, Shipment

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('license_plate', 'make', 'model', 'capacity_kg', 'status')
    list_filter = ('status', 'make')
    search_fields = ('license_plate', 'make', 'model')

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'phone_number')
    search_fields = ('license_number', 'user__username', 'user__email')
    raw_id_fields = ('user',)

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'driver', 'vehicle', 'status')
    list_filter = ('status',)
    search_fields = ('id', 'job__id', 'driver__user__username')
    raw_id_fields = ('job', 'driver', 'vehicle')