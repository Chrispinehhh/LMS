# logipro_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    # ALL API routes go through urls_api.py
    path("api/v1/", include("logipro_backend.urls_api", namespace="api")),
    # REMOVE this duplicate line:
    # path("api/v1/transportation/", include("apps.transportation.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)