// driver-app/src/screens/JobDetailScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Button,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { launchCameraAsync, requestCameraPermissionsAsync, PermissionStatus } from 'expo-image-picker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApi } from '../hooks/useApi';
import { JobDetail } from '../types';
import apiClient from '../lib/api';

// Reusable component for info blocks
const InfoBlock = ({ label, value }: { label: string; value: string | undefined }) => (
  <View style={styles.infoBlock}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

export default function JobDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'JobDetail'>>();
  const { jobId, shipmentId } = route.params;

  const { data: job, error, isLoading, mutate } = useApi<JobDetail>(jobId ? `/driver/jobs/${jobId}/` : null);

  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  // Type assertion to include all statuses
  const status = job?.status as 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | undefined;

  const updateStatus = async (newStatus: string) => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      console.log(`Updating status to ${newStatus} for job: ${jobId}`);
      // Unified Endpoint Call
      await apiClient.post(`/driver/jobs/${jobId}/update_status/`, {
        status: newStatus,
        description: `Driver updated status to ${newStatus}`,
        location: 'Driver Location'
      });

      Alert.alert("Success", "Status updated successfully!");
      mutate();

    } catch (err: any) {
      console.error('Update status error:', err);
      const errorMessage = err.response?.data?.error || "Failed to update status.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const startTrip = () => updateStatus('IN_TRANSIT');
  const confirmPickup = () => updateStatus('PICKED_UP');
  const markAsDelivered = () => updateStatus('DELIVERED');

  const handleTakePhoto = async () => {
    const permissionResult = await requestCameraPermissionsAsync();
    if (permissionResult.status !== PermissionStatus.GRANTED) {
      Alert.alert("Permission Required", "You need to grant camera permissions to upload Proof of Delivery.");
      return;
    }

    const result = await launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setCapturedImage(asset.uri);
    }
  };

  const handleUploadPhoto = async () => {
    if (!capturedImage) return;

    setIsUploading(true);

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      const formData = new FormData();
      const file = new File([blob], `pod_${jobId}_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      formData.append('proof_of_delivery_image', file as any);

      // Use the new simplified upload endpoint
      const uploadResponse = await apiClient.post(`/driver/jobs/${jobId}/upload-pod/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert("Success", "Proof of Delivery uploaded successfully!");

      setCapturedImage(null);
      mutate();

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.details || "Upload failed. Please try again.";
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setCapturedImage(null);
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    handleTakePhoto();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !job || !status) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load job details.</Text>
          <Text style={styles.errorSubtext}>Please check your connection and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        {/* Status Header */}
        <View style={[styles.statusHeader,
        status === 'PENDING' && styles.statusPending,
        status === 'ASSIGNED' && styles.statusAssigned,
        status === 'IN_TRANSIT' && styles.statusInTransit,
        status === 'DELIVERED' && styles.statusDelivered,
        status === 'FAILED' && styles.statusFailed
        ]}>
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>CURRENT STATUS</Text>
            <Text style={styles.statusText}>
              {status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Job Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Job Details</Text>
            <View style={styles.jobIdBadge}>
              <Text style={styles.jobIdText}>#{jobId}</Text>
            </View>
          </View>
          <InfoBlock label="Service Type" value={job.service_type?.replace(/_/g, ' ')} />
          <InfoBlock label="Cargo Description" value={job.cargo_description} />
        </View>

        {/* Route Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Information</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routeDot}>
              <View style={styles.dot} />
              <View style={styles.verticalLine} />
            </View>
            <View style={styles.routeAddresses}>
              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>PICKUP LOCATION</Text>
                <Text style={styles.addressText}>{job.pickup_address}, {job.pickup_city}</Text>
                <InfoBlock label="Contact" value={job.pickup_contact_person} />
                <InfoBlock label="Phone" value={job.pickup_contact_phone} />
              </View>
              <View style={styles.addressSection}>
                <Text style={styles.addressLabel}>DELIVERY LOCATION</Text>
                <Text style={styles.addressText}>{job.delivery_address}, {job.delivery_city}</Text>
                <InfoBlock label="Contact" value={job.delivery_contact_person} />
                <InfoBlock label="Phone" value={job.delivery_contact_phone} />
              </View>
            </View>
          </View>
        </View>

        {/* Proof of Delivery Section */}
        {capturedImage && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Proof of Delivery</Text>
            <Image source={{ uri: capturedImage }} style={styles.podImage} />
            <View style={styles.podActions}>
              <TouchableOpacity
                style={[styles.podButton, styles.retakeButton]}
                onPress={handleRetakePhoto}
                disabled={isUploading}
              >
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.podButton, styles.uploadButton]}
                onPress={handleUploadPhoto}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.uploadButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.podButton, styles.cancelButton]}
                onPress={handleCancelUpload}
                disabled={isUploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            {isUploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </View>
        )}

        {job.proof_of_delivery_image && !capturedImage && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Proof of Delivery</Text>
            <Image
              source={{ uri: job.proof_of_delivery_image }}
              style={styles.podImage}
            />
            <View style={styles.uploadedContainer}>
              <Text style={styles.uploadedText}>✓ Delivered with photo</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {status === 'PENDING' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startTripButton]}
              onPress={confirmPickup}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.actionButtonText}>Confirm Pickup</Text>
              )}
            </TouchableOpacity>
          )}

          {(status === 'PICKED_UP' || status === 'ASSIGNED') && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startTripButton]}
              onPress={startTrip}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.actionButtonText}>Start Trip</Text>
              )}
            </TouchableOpacity>
          )}

          {status === 'IN_TRANSIT' && !capturedImage && (
            <View style={styles.inTransitActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.photoButton]}
                onPress={handleTakePhoto}
              >
                <Text style={styles.actionButtonText}>📸 Take Delivery Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deliverButton]}
                onPress={markAsDelivered}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.actionButtonText}>🚚 Mark as Delivered</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {status === 'DELIVERED' && (
            <View style={[styles.statusSection, styles.completedSection]}>
              <Text style={styles.completedIcon}>✓</Text>
              <Text style={styles.completedText}>Delivery Completed</Text>
              <Text style={styles.completedSubtext}>Great job! Delivery has been successfully completed.</Text>
            </View>
          )}

          {status === 'FAILED' && (
            <View style={[styles.statusSection, styles.failedSection]}>
              <Text style={styles.failedIcon}>⚠️</Text>
              <Text style={styles.failedText}>Delivery Failed</Text>
              <Text style={styles.failedSubtext}>Please contact dispatch for assistance</Text>
            </View>
          )}
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  // Status Header
  statusHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusPending: {
    backgroundColor: '#ffedd5',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statusAssigned: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statusInTransit: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statusDelivered: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  statusFailed: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  jobIdBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  jobIdText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  // Info Blocks
  infoBlock: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1e293b',
    lineHeight: 22,
  },
  // Route Information
  routeContainer: {
    flexDirection: 'row',
  },
  routeDot: {
    alignItems: 'center',
    marginRight: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
  routeAddresses: {
    flex: 1,
  },
  addressSection: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 22,
  },
  // Proof of Delivery
  podImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 12,
  },
  podActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  podButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  retakeButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  uploadingText: {
    marginLeft: 8,
    color: '#3B82F6',
    fontWeight: '500',
  },
  uploadedContainer: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    marginTop: 8,
  },
  uploadedText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  // Action Buttons
  actionsContainer: {
    padding: 16,
    marginTop: 8,
  },
  inTransitActions: {
    gap: 12,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startTripButton: {
    backgroundColor: '#3B82F6',
  },
  photoButton: {
    backgroundColor: '#10b981',
  },
  deliverButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Status Sections
  statusSection: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  completedSection: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  completedIcon: {
    fontSize: 32,
    color: '#16a34a',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4,
  },
  completedSubtext: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
  failedSection: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  failedIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  failedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 4,
  },
  failedSubtext: {
    fontSize: 14,
    color: '#991b1b',
    textAlign: 'center',
  },
  footerSpacer: {
    height: 24,
  },
});