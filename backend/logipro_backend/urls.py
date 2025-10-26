# logipro_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    # All API endpoints are included via urls_api.py
    path("api/v1/", include("logipro_backend.urls_api", namespace="api")),
    # Transportation app URLs are now ONLY available through urls_api.py at /api/v1/transportation/
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)