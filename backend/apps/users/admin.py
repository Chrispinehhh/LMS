# NEW, CORRECT version
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom Admin configuration for the User model.
    """
    # This is the key part. We are extending the default fieldsets.
    fieldsets = UserAdmin.fieldsets + (
        ('Custom User Info', {
            'fields': ('role',),
        }),
    )
    
    # This will add 'role' to the columns in the user list view
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'role')
    
    # This will allow filtering by role in the sidebar
    list_filter = UserAdmin.list_filter + ('role',)