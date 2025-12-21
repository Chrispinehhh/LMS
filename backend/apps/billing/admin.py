from django.contrib import admin
from .models import Invoice, TaxRule

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'status', 'payment_method', 'total_amount', 'due_date')
    
    list_filter = ('status', 'due_date', 'payment_method')
    
    search_fields = ('job__id', 'stripe_payment_intent_id') 
    autocomplete_fields = ['job']
    
    fieldsets = (
        ('Financial Breakdown', {
            'fields': ('subtotal', 'tax_amount', 'total_amount', 'tax_rule_applied'),
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'payment_notes', 'stripe_payment_intent_id'),
            'description': 'Details on how and when the invoice was paid. Use notes for manual payments like cheques.'
        }),
    )

@admin.register(TaxRule)
class TaxRuleAdmin(admin.ModelAdmin):
    list_display = ('region_code', 'tax_name', 'rate', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('region_code', 'tax_name')