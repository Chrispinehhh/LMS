from django.apps import AppConfig # <-- ADD THIS LINE

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'