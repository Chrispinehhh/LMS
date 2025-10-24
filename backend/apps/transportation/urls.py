# apps/transportation/urls.py

from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, DriverViewSet, ShipmentViewSet

# The router automatically handles the URLs for the ViewSets,
# including the new custom @action on the DriverViewSet.
router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'shipments', ShipmentViewSet, basename='shipment')

urlpatterns = router.urls