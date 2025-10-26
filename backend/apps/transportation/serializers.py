# apps/transportation/serializers.py

from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from .models import Vehicle, Driver, Shipment
from apps.users.models import User
from apps.users.serializers import UserSerializer
from apps.orders.serializers import JobSerializer

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )

    class Meta:
        model = Driver
        fields = ['id', 'user', 'user_id', 'license_number', 'phone_number']

class ShipmentSerializer(serializers.ModelSerializer):
    """
    A detailed serializer for viewing a single shipment, used for the manager's
    Job Detail page.
    """
    job = JobSerializer(read_only=True)
    driver = DriverSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)

    driver_id = serializers.PrimaryKeyRelatedField(
        queryset=Driver.objects.all(),
        source='driver',
        write_only=True,
        required=False,
        allow_null=True
    )
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source='vehicle',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Shipment
        fields = [
            'id', 'job', 'vehicle', 'vehicle_id', 'driver', 'driver_id',
            'status', 'estimated_departure', 'actual_departure',
            'estimated_arrival', 'actual_arrival',
            'proof_of_delivery_image'
        ]
        extra_kwargs = {
            'status': {'required': False},
            'estimated_departure': {'required': False},
            'actual_departure': {'required': False},
            'estimated_arrival': {'required': False},
            'actual_arrival': {'required': False},
            'proof_of_delivery_image': {'required': False},
        }

    def validate(self, attrs):
        """
        Comprehensive validation with detailed debugging
        """
        print("🔧 VALIDATION: ===== STARTING VALIDATION =====")
        print(f"🔧 VALIDATION: Received attributes: {attrs}")
        
        # Validate driver if present
        if 'driver' in attrs:
            driver = attrs['driver']
            if driver is None:
                print("🔧 VALIDATION: Driver is being set to None (clearing assignment)")
            else:
                print(f"🔧 VALIDATION: Driver object: {driver}")
                print(f"🔧 VALIDATION: Driver ID: {driver.id}, Type: {type(driver.id)}")
                
                # Check if driver exists
                try:
                    driver_obj = Driver.objects.get(id=driver.id)
                    print(f"🔧 VALIDATION: Driver found: {driver_obj}")
                    
                    # Check if driver's user is active
                    if not driver_obj.user.is_active:
                        print("❌ VALIDATION: Driver's user account is not active")
                        raise serializers.ValidationError({
                            'driver_id': 'Selected driver is not active'
                        })
                    print("🔧 VALIDATION: Driver is active and valid")
                        
                except ObjectDoesNotExist:
                    print("❌ VALIDATION: Driver does not exist")
                    raise serializers.ValidationError({
                        'driver_id': 'Selected driver does not exist'
                    })
        
        # Validate vehicle if present
        if 'vehicle' in attrs:
            vehicle = attrs['vehicle']
            if vehicle is None:
                print("🔧 VALIDATION: Vehicle is being set to None (clearing assignment)")
            else:
                print(f"🔧 VALIDATION: Vehicle object: {vehicle}")
                print(f"🔧 VALIDATION: Vehicle ID: {vehicle.id}, Type: {type(vehicle.id)}")
                
                # Check if vehicle exists
                try:
                    vehicle_obj = Vehicle.objects.get(id=vehicle.id)
                    print(f"🔧 VALIDATION: Vehicle found: {vehicle_obj}")
                    print(f"🔧 VALIDATION: Vehicle status: {vehicle_obj.status}")
                    
                    # Check if vehicle is available (only if it's being assigned, not cleared)
                    if vehicle_obj.status != 'AVAILABLE' and vehicle is not None:
                        print(f"❌ VALIDATION: Vehicle is not available. Current status: {vehicle_obj.status}")
                        raise serializers.ValidationError({
                            'vehicle_id': f'Selected vehicle is not available (current status: {vehicle_obj.status})'
                        })
                    print("🔧 VALIDATION: Vehicle is available and valid")
                        
                except ObjectDoesNotExist:
                    print("❌ VALIDATION: Vehicle does not exist")
                    raise serializers.ValidationError({
                        'vehicle_id': 'Selected vehicle does not exist'
                    })
        
        # Validate status transitions if status is being updated
        if 'status' in attrs:
            new_status = attrs['status']
            print(f"🔧 VALIDATION: Status update requested: {new_status}")
            
            # If this is a PATCH request, we might have the instance
            if self.instance:
                current_status = self.instance.status
                print(f"🔧 VALIDATION: Current status: {current_status} -> New status: {new_status}")
                
                # Add any status transition validation here if needed
                # For example, prevent going from DELIVERED back to ASSIGNED
                if current_status == 'DELIVERED' and new_status in ['ASSIGNED', 'IN_TRANSIT']:
                    raise serializers.ValidationError({
                        'status': 'Cannot change status from DELIVERED back to ASSIGNED or IN_TRANSIT'
                    })
        
        print("🔧 VALIDATION: ===== ALL VALIDATIONS PASSED =====")
        return attrs

    def update(self, instance, validated_data):
        """
        Enhanced update with automatic status management and comprehensive logging
        """
        print("🔧 UPDATE: ===== STARTING UPDATE =====")
        print(f"🔧 UPDATE: Instance ID: {instance.id}")
        print(f"🔧 UPDATE: Current driver: {instance.driver}")
        print(f"🔧 UPDATE: Current vehicle: {instance.vehicle}")
        print(f"🔧 UPDATE: Current status: {instance.status}")
        print(f"🔧 UPDATE: Validated data: {validated_data}")
        
        # Extract driver and vehicle from validated data (could be new values or None)
        new_driver = validated_data.get('driver')
        new_vehicle = validated_data.get('vehicle')
        
        print(f"🔧 UPDATE: New driver: {new_driver}")
        print(f"🔧 UPDATE: New vehicle: {new_vehicle}")
        
        # Automatic status management
        current_status = instance.status
        
        # Determine what the final driver and vehicle will be after update
        final_driver = new_driver if new_driver is not None else instance.driver
        final_vehicle = new_vehicle if new_vehicle is not None else instance.vehicle
        
        print(f"🔧 UPDATE: Final driver after update: {final_driver}")
        print(f"🔧 UPDATE: Final vehicle after update: {final_vehicle}")
        
        # Auto-update status based on driver/vehicle assignment
        if final_driver and final_vehicle:
            # Both driver and vehicle are assigned
            if current_status == 'PENDING':
                validated_data['status'] = 'ASSIGNED'
                print("🔧 UPDATE: Auto-updating status from PENDING to ASSIGNED (both assigned)")
            elif current_status in ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED']:
                # Keep current status if already beyond PENDING
                print(f"🔧 UPDATE: Keeping current status {current_status} (already assigned or in progress)")
        elif not final_driver and not final_vehicle:
            # Both driver and vehicle are cleared
            if current_status == 'ASSIGNED':
                validated_data['status'] = 'PENDING'
                print("🔧 UPDATE: Auto-updating status from ASSIGNED to PENDING (both cleared)")
        else:
            # Mixed state - one assigned, one cleared
            if current_status == 'ASSIGNED':
                validated_data['status'] = 'PENDING'
                print("🔧 UPDATE: Auto-updating status from ASSIGNED to PENDING (incomplete assignment)")
        
        # If status was explicitly provided in request, respect it (unless we have business logic against it)
        if 'status' in validated_data:
            print(f"🔧 UPDATE: Final status will be: {validated_data['status']}")
        else:
            print(f"🔧 UPDATE: Status will remain: {instance.status}")
        
        print(f"🔧 UPDATE: Final validated data for save: {validated_data}")
        
        try:
            # Perform the update
            result = super().update(instance, validated_data)
            
            # Refresh from database to get the actual updated state
            result.refresh_from_db()
            
            print("✅ UPDATE: ===== UPDATE COMPLETED SUCCESSFULLY =====")
            print(f"✅ UPDATE: Updated driver: {result.driver}")
            print(f"✅ UPDATE: Updated vehicle: {result.vehicle}")
            print(f"✅ UPDATE: Updated status: {result.status}")
            
            return result
            
        except Exception as e:
            print(f"❌ UPDATE: Exception during save: {str(e)}")
            print(f"❌ UPDATE: Exception type: {type(e)}")
            import traceback
            traceback.print_exc()
            raise serializers.ValidationError({
                'non_field_errors': f'Failed to update shipment: {str(e)}'
            })


class MyJobsShipmentSerializer(serializers.ModelSerializer):
    """
    A lightweight, "flat" serializer for the 'My Assigned Jobs' list.
    It provides just enough information for the driver's mobile app list view.
    """
    job_id = serializers.UUIDField(source='job.id', read_only=True)
    pickup_address = serializers.CharField(source='job.pickup_address', read_only=True)
    delivery_address = serializers.CharField(source='job.delivery_address', read_only=True)
    requested_pickup_date = serializers.DateTimeField(source='job.requested_pickup_date', read_only=True)
    customer_name = serializers.CharField(source='job.customer.get_full_name', read_only=True)

    class Meta:
        model = Shipment
        fields = [
            'id', 
            'status',
            'job_id',
            'customer_name',
            'pickup_address',
            'delivery_address',
            'requested_pickup_date',
            'proof_of_delivery_image'
        ]