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

  const { data: job, error, isLoading, mutate } = useApi<JobDetail>(jobId ? `/jobs/${jobId}/` : null);
  
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const markAsDelivered = async () => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    
    try {
      const response = await apiClient.post(`/transportation/shipments/${shipmentId}/mark-delivered/`, {});
      
      Alert.alert("Success", "Job has been marked as delivered!");
      mutate();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Failed to update status. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const startTrip = async () => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    
    try {
      await apiClient.patch(`/transportation/shipments/${shipmentId}/`, { 
        status: 'IN_TRANSIT' 
      });
      
      Alert.alert("Success", "Trip started!");
      mutate();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Failed to start trip. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
      const file = new File([blob], `pod_${shipmentId}_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      
      formData.append('proof_of_delivery_image', file);

      const uploadResponse = await apiClient.post(`/transportation/shipments/${shipmentId}/upload-pod/`, formData, {
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
    return <ActivityIndicator size="large" color="#007aff" style={{ flex: 1, justifyContent: 'center' }} />;
  }
  if (error || !job) {
    return <View style={styles.container}><Text style={styles.errorText}>Failed to load job details.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Status Header */}
        <View style={[styles.statusHeader, 
          job.status === 'PENDING' && styles.statusPending,
          job.status === 'IN_TRANSIT' && styles.statusInTransit,
          job.status === 'DELIVERED' && styles.statusDelivered,
          job.status === 'FAILED' && styles.statusFailed
        ]}>
          <Text style={styles.statusText}>
            {job.status.replace('_', ' ')}
          </Text>
        </View>

        {/* Job Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Job Details</Text>
          <InfoBlock label="Service Type" value={job.service_type?.replace(/_/g, ' ')} />
          <InfoBlock label="Cargo Description" value={job.cargo_description} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pickup</Text>
          <InfoBlock label="Address" value={`${job.pickup_address}, ${job.pickup_city}`} />
          <InfoBlock label="Contact" value={job.pickup_contact_person} />
          <InfoBlock label="Phone" value={job.pickup_contact_phone} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery</Text>
          <InfoBlock label="Address" value={`${job.delivery_address}, ${job.delivery_city}`} />
          <InfoBlock label="Contact" value={job.delivery_contact_person} />
          <InfoBlock label="Phone" value={job.delivery_contact_phone} />
        </View>

        {/* Proof of Delivery Section */}
        {capturedImage && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Proof of Delivery</Text>
            <Image source={{ uri: capturedImage }} style={styles.podImage} />
            <View style={styles.podActions}>
              <Button 
                title="Retake" 
                onPress={handleRetakePhoto} 
                color="#8e8e93"
                disabled={isUploading}
              />
              <Button 
                title={isUploading ? "Uploading..." : "Upload"} 
                onPress={handleUploadPhoto} 
                color="#34c759"
                disabled={isUploading}
              />
              <Button 
                title="Cancel" 
                onPress={handleCancelUpload} 
                color="#ff3b30"
                disabled={isUploading}
              />
            </View>
            {isUploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#007aff" />
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
            <Text style={styles.uploadedText}>✓ Delivered with photo</Text>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
            {job.status === 'PENDING' && (
                <TouchableOpacity 
                  style={styles.actionButton}
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

            {job.status === 'IN_TRANSIT' && !capturedImage && (
              <View style={styles.inTransitActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.photoButton]}
                  onPress={handleTakePhoto}
                >
                  <Text style={styles.actionButtonText}>Take Delivery Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deliverButton]}
                  onPress={markAsDelivered}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.actionButtonText}>Mark as Delivered</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {job.status === 'DELIVERED' && (
                <View style={styles.completedSection}>
                  <Text style={styles.completedText}>✓ Delivery Completed</Text>
                </View>
            )}

            {job.status === 'FAILED' && (
                <View style={styles.failedSection}>
                  <Text style={styles.failedText}>Delivery Failed</Text>
                  <Text style={styles.failedSubtext}>Please contact dispatch</Text>
                </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f9fa' 
    },
    statusHeader: {
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusPending: { 
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7',
        borderWidth: 1,
    },
    statusInTransit: { 
        backgroundColor: '#d1ecf1',
        borderColor: '#bee5eb',
        borderWidth: 1,
    },
    statusDelivered: { 
        backgroundColor: '#d4edda',
        borderColor: '#c3e6cb',
        borderWidth: 1,
    },
    statusFailed: { 
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb',
        borderWidth: 1,
    },
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    card: { 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 16, 
        marginHorizontal: 16, 
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 12,
        color: '#2c3e50',
    },
    infoBlock: { 
        marginVertical: 4 
    },
    label: { 
        fontSize: 14, 
        color: '#7f8c8d',
        fontWeight: '500',
    },
    value: { 
        fontSize: 16, 
        fontWeight: '400', 
        marginTop: 2, 
        color: '#2c3e50' 
    },
    actionsContainer: { 
        padding: 16, 
        marginTop: 8 
    },
    inTransitActions: {
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#007aff',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoButton: {
        backgroundColor: '#34c759',
    },
    deliverButton: {
        backgroundColor: '#007aff',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    // Proof of Delivery Styles
    podImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginVertical: 8,
    },
    podActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 8,
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        padding: 8,
    },
    uploadingText: {
        marginLeft: 8,
        color: '#007aff',
        fontWeight: '500',
    },
    uploadedText: {
        textAlign: 'center',
        color: '#34c759',
        fontWeight: '500',
        marginTop: 8,
    },
    completedSection: {
        backgroundColor: '#d4edda',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        borderColor: '#c3e6cb',
        borderWidth: 1,
    },
    completedText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#155724',
    },
    failedSection: {
        backgroundColor: '#f8d7da',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        borderColor: '#f5c6cb',
        borderWidth: 1,
    },
    failedText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#721c24',
    },
    failedSubtext: {
        fontSize: 14,
        color: '#721c24',
        marginTop: 4,
    },
    errorText: { 
        textAlign: 'center', 
        color: '#dc3545', 
        marginTop: 20,
        fontSize: 16,
    },
});