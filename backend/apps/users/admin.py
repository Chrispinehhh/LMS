from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CustomerAddress

@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ('name', 'customer', 'label', 'city', 'state', 'is_default')
    list_filter = ('label', 'is_default', 'city')
    search_fields = ('name', 'address1', 'customer__email', 'phone')
    autocomplete_fields = ['customer']

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom Admin configuration for the User model.
    """
    # 1. ADD 'customer_type' to the Custom User Info fieldset
    fieldsets = UserAdmin.fieldsets + (
        ('Custom User Info', {
            'fields': ('role', 'customer_type'),
        }),
    )
    
    # 2. ADD 'customer_type' to the columns in the user list view
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'role', 'customer_type')
    
    # 3. ADD 'customer_type' to the sidebar filters
    list_filter = UserAdmin.list_filter + ('role', 'customer_type',)