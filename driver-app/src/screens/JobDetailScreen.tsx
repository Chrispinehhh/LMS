// src/screens/JobDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Modal,
  Linking,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApi } from '../hooks/useApi';
import { JobDetail } from '../types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../lib/api';

// Stained Glass Components
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StainedGlassCard } from '../components/StainedGlassCard';
import {
  StainedGlassTheme,
  Typography,
  Spacing,
  BorderRadius,
  StainedGlassStyles
} from '../styles/globalStyles';

type JobDetailScreenRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;
type JobDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'JobDetail'>;

const { width } = Dimensions.get('window');

export default function JobDetailScreen() {
  const route = useRoute<JobDetailScreenRouteProp>();
  const navigation = useNavigation<JobDetailScreenNavigationProp>();
  const { jobId, shipmentId } = route.params;
  const insets = useSafeAreaInsets();

  const { data: job, isLoading, error, mutate } = useApi<JobDetail>(`/driver/jobs/${jobId}/`);

  // State
  const [uploading, setUploading] = useState(false);
  const [podImage, setPodImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Helpers
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'ORDER_PLACED':
        return {
          color: '#FBBF24', // Gold
          bgColor: 'rgba(251, 191, 36, 0.15)',
          icon: 'time-outline',
          label: 'Pending'
        };
      case 'PICKED_UP':
        return {
          color: '#60A5FA', // Blue
          bgColor: 'rgba(96, 165, 250, 0.15)',
          icon: 'cube-outline',
          label: 'Picked Up'
        };
      case 'IN_TRANSIT':
        return {
          color: '#A78BFA', // Purple
          bgColor: 'rgba(167, 139, 250, 0.15)',
          icon: 'car-outline',
          label: 'In Transit'
        };
      case 'OUT_FOR_DELIVERY':
        return {
          color: '#818CF8', // Indigo
          bgColor: 'rgba(129, 140, 248, 0.15)',
          icon: 'bicycle-outline',
          label: 'Out for Delivery'
        };
      case 'DELIVERED':
      case 'COMPLETED':
        return {
          color: '#34D399', // Green
          bgColor: 'rgba(52, 211, 153, 0.15)',
          icon: 'checkmark-circle-outline',
          label: 'Delivered'
        };
      case 'FAILED':
      case 'CANCELLED':
        return {
          color: '#F87171', // Red
          bgColor: 'rgba(248, 113, 113, 0.15)',
          icon: 'alert-circle-outline',
          label: 'Failed'
        };
      default:
        return {
          color: '#9CA3AF',
          bgColor: 'rgba(156, 163, 175, 0.15)',
          icon: 'help-circle-outline',
          label: status.replace('_', ' ')
        };
    }
  };

  const openMaps = (address: string, city: string) => {
    const fullAddress = `${address}, ${city}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(fullAddress)}`,
      android: `geo:0,0?q=${encodeURIComponent(fullAddress)}`,
    });
    Linking.openURL(url || "").catch(err => {
      console.error('Error opening maps:', err);
      Alert.alert("Error", "Could not open maps app.");
    });
  };

  const callNumber = (phone: string) => {
    if (!phone) {
      Alert.alert("No Phone", "Phone number not available.");
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      await apiClient.post(`/driver/jobs/${jobId}/update_status/`, {
        status: newStatus,
        description: `Driver updated status to ${newStatus}`,
        location: 'Driver Location'
      });
      mutate();
    } catch (err: any) {
      console.error('Update status error:', err);
      Alert.alert("Error", err.response?.data?.error || "Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCameraLaunch = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to allow camera access to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPodImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert("Error", "Could not open camera.");
    }
  };

  const handleUploadPOD = async () => {
    if (!podImage) return;
    setUploading(true);

    try {
      const formData = new FormData();
      const localUri = podImage.uri;
      const filename = localUri.split('/').pop() || `pod_${jobId}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('proof_of_delivery_image', {
        uri: localUri,
        name: filename,
        type,
      } as any);

      await apiClient.post(`/driver/jobs/${jobId}/upload-pod/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert("Success", "Proof of Delivery uploaded!");
      setModalVisible(false);
      setPodImage(null);
      mutate();
    } catch (e: any) {
      console.error('Upload error:', e);
      Alert.alert("Error", "Failed to upload Proof of Delivery.");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return (
    <ScreenWrapper>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={StainedGlassTheme.colors.gold} />
        <Text style={styles.loadingText}>Loading Job Details...</Text>
      </View>
    </ScreenWrapper>
  );

  if (error || !job) return (
    <ScreenWrapper>
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={StainedGlassTheme.colors.gold} />
        <Text style={styles.errorText}>Error loading job details.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => mutate()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );

  const statusConfig = getStatusConfig(job.status);

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Job Info */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={StainedGlassTheme.colors.parchment} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.jobId}>Job #{job.id.slice(0, 8)}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Ionicons
                  name={statusConfig.icon as any}
                  size={16}
                  color={statusConfig.color}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
              <Text style={styles.date}>
                {new Date(job.requested_pickup_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Job Card */}
        <StainedGlassCard style={styles.mainCard}>
          {/* Route Information */}
          <View style={styles.routeSection}>
            <Text style={styles.sectionTitle}>ROUTE</Text>

            {/* Pickup Location */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationDot}>
                  <View style={[styles.dot, styles.pickupDot]} />
                </View>
                <Text style={styles.locationLabel}>PICKUP LOCATION</Text>
                {job.pickup_contact_phone && (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => callNumber(job.pickup_contact_phone)}
                  >
                    <Ionicons name="call" size={24} color="#1A0B4E" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.address}>{job.pickup_address}</Text>
              <Text style={styles.city}>{job.pickup_city}</Text>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => openMaps(job.pickup_address, job.pickup_city)}
              >
                <Ionicons name="navigate" size={16} color={StainedGlassTheme.colors.gold} />
                <Text style={styles.navigationText}>Navigate to Pickup</Text>
              </TouchableOpacity>
            </View>

            {/* Route Line */}
            <View style={styles.routeLineContainer}>
              <View style={styles.routeLine} />
              <Ionicons name="arrow-down" size={20} color={StainedGlassTheme.colors.goldMedium} />
            </View>

            {/* Delivery Location */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationDot}>
                  <View style={[styles.dot, styles.deliveryDot]} />
                </View>
                <Text style={styles.locationLabel}>DELIVERY LOCATION</Text>
              </View>
              <Text style={styles.address}>{job.delivery_address}</Text>
              <Text style={styles.city}>{job.delivery_city}</Text>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => openMaps(job.delivery_address, job.delivery_city)}
              >
                <Ionicons name="navigate" size={16} color={StainedGlassTheme.colors.gold} />
                <Text style={styles.navigationText}>Navigate to Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Job Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>JOB DETAILS</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={20} color={StainedGlassTheme.colors.goldLight} />
                <View>
                  <Text style={styles.detailLabel}>Cargo Type</Text>
                  <Text style={styles.detailValue}>
                    {job.cargo_description || 'General Cargo'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color={StainedGlassTheme.colors.goldLight} />
                <View>
                  <Text style={styles.detailLabel}>Service Type</Text>
                  <Text style={styles.detailValue}>
                    {job.service_type?.replace(/_/g, ' ') || 'Standard'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Customer Information */}
          <View style={styles.customerSection}>
            <Text style={styles.sectionTitle}>CUSTOMER</Text>

            <View style={styles.customerCard}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerInitial}>
                  {job.customer_name?.[0]?.toUpperCase() || 'C'}
                </Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.customer_name}</Text>
                <Text style={styles.customerLabel}>Client</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => callNumber(job.pickup_contact_phone || '')}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Proof of Delivery Section */}
          {(job.status === 'IN_TRANSIT' || job.status === 'DELIVERED' || job.proof_of_delivery_image) && (
            <View style={styles.podSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>PROOF OF DELIVERY</Text>
                {job.status === 'IN_TRANSIT' && (
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.uploadText}>
                      {job.proof_of_delivery_image ? "Retake" : "Upload"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {job.proof_of_delivery_image ? (
                <Image
                  source={{ uri: job.proof_of_delivery_image }}
                  style={styles.podImage}
                />
              ) : (
                <TouchableOpacity
                  style={styles.podPlaceholder}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="camera" size={32} color={StainedGlassTheme.colors.goldLight} />
                  <Text style={styles.podPlaceholderText}>Tap to Upload Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </StainedGlassCard>
      </ScrollView>

      {/* Action Footer */}
      {job.status !== 'DELIVERED' && job.status !== 'FAILED' && (
        <View style={[styles.actionFooter, { paddingBottom: insets.bottom + Spacing.md }]}>
          {job.status === 'PENDING' || job.status === 'ORDER_PLACED' ? (
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => handleUpdateStatus('IN_TRANSIT')}
              disabled={statusUpdating}
            >
              {statusUpdating ? (
                <ActivityIndicator color={StainedGlassTheme.colors.parchment} />
              ) : (
                <>
                  <Text style={styles.primaryActionText}>Start Trip</Text>
                  <Ionicons name="arrow-forward" size={20} color={StainedGlassTheme.colors.parchment} />
                </>
              )}
            </TouchableOpacity>
          ) : job.status === 'IN_TRANSIT' ? (
            <TouchableOpacity
              style={[styles.primaryActionButton, { backgroundColor: '#60A5FA' }]}
              onPress={() => handleUpdateStatus('PICKED_UP')}
              disabled={statusUpdating}
            >
              {statusUpdating ? (
                <ActivityIndicator color={StainedGlassTheme.colors.parchment} />
              ) : (
                <>
                  <Text style={styles.primaryActionText}>Confirm Pickup</Text>
                  <Ionicons name="cube" size={20} color={StainedGlassTheme.colors.parchment} />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                styles.completeButton,
                !job.proof_of_delivery_image && styles.disabledButton
              ]}
              onPress={() => {
                if (!job.proof_of_delivery_image) {
                  Alert.alert("Required", "Please upload Proof of Delivery before completing.");
                  return;
                }
                handleUpdateStatus('DELIVERED');
              }}
            >
              <Text style={styles.primaryActionText}>Complete Delivery</Text>
              <Ionicons name="checkmark-circle" size={20} color={StainedGlassTheme.colors.parchment} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* POD Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Proof of Delivery</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={StainedGlassTheme.colors.parchment} />
              </TouchableOpacity>
            </View>

            {podImage ? (
              // Preview Mode
              <>
                <Image source={{ uri: podImage.uri }} style={styles.modalPreview} />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.secondaryModalButton}
                    onPress={() => setPodImage(null)}
                  >
                    <Ionicons name="refresh" size={20} color={StainedGlassTheme.colors.parchment} />
                    <Text style={styles.secondaryModalText}>Retake</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryModalButton}
                    onPress={handleUploadPOD}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryModalText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Camera Mode
              <>
                <Text style={styles.modalDescription}>
                  Please take a clear photo of the delivered package.
                </Text>

                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleCameraLaunch}
                >
                  <Ionicons name="camera" size={40} color={StainedGlassTheme.colors.parchment} />
                  <Text style={styles.cameraButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: StainedGlassTheme.colors.parchmentLight,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  errorText: {
    color: StainedGlassTheme.colors.parchment,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 223, 186, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    color: StainedGlassTheme.colors.gold,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 223, 186, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
  },
  headerContent: {
    flex: 1,
  },
  jobId: {
    ...Typography.h3,
    color: StainedGlassTheme.colors.parchment,
    marginBottom: Spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 14,
    color: StainedGlassTheme.colors.parchmentLight,
    fontWeight: '500',
  },
  mainCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    color: StainedGlassTheme.colors.parchmentLight,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  routeSection: {
    marginBottom: Spacing.xl,
  },
  locationCard: {
    backgroundColor: 'rgba(28, 25, 48, 0.5)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 186, 0.1)',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationDot: {
    marginRight: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  pickupDot: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  deliveryDot: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  locationLabel: {
    flex: 1,
    fontSize: 11,
    color: StainedGlassTheme.colors.parchmentLight,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  callButtonSmall: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 223, 186, 0.1)',
  },
  address: {
    fontSize: 16,
    color: StainedGlassTheme.colors.parchment,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  city: {
    fontSize: 14,
    color: StainedGlassTheme.colors.parchmentLight,
    marginBottom: Spacing.md,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  navigationText: {
    color: StainedGlassTheme.colors.gold,
    fontWeight: '600',
    fontSize: 14,
  },
  routeLineContainer: {
    alignItems: 'center',
    height: 30,
    marginVertical: Spacing.xs,
  },
  routeLine: {
    width: 2,
    height: '100%',
    backgroundColor: StainedGlassTheme.colors.goldMedium,
    opacity: 0.3,
  },
  detailsSection: {
    marginBottom: Spacing.xl,
  },
  detailsGrid: {
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(28, 25, 48, 0.5)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 186, 0.1)',
  },
  detailLabel: {
    fontSize: 12,
    color: StainedGlassTheme.colors.parchmentLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: StainedGlassTheme.colors.parchment,
    fontWeight: '500',
  },
  customerSection: {
    marginBottom: Spacing.xl,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(28, 25, 48, 0.5)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 186, 0.1)',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 223, 186, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
  },
  customerInitial: {
    fontSize: 20,
    color: StainedGlassTheme.colors.gold,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    color: StainedGlassTheme.colors.parchment,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerLabel: {
    fontSize: 14,
    color: StainedGlassTheme.colors.parchmentLight,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: StainedGlassTheme.colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uploadText: {
    color: StainedGlassTheme.colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  podImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    backgroundColor: '#000',
  },
  podPlaceholder: {
    height: 120,
    borderWidth: 2,
    borderColor: StainedGlassTheme.colors.goldDark,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 223, 186, 0.05)',
  },
  podPlaceholderText: {
    color: StainedGlassTheme.colors.parchmentLight,
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(41, 37, 66, 0.8)',
    borderTopWidth: 1,
    borderTopColor: StainedGlassTheme.colors.goldDark,
  },
  primaryActionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: StainedGlassTheme.colors.gold,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButton: {
    backgroundColor: '#34D399',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryActionText: {
    color: '#1A0B4E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: StainedGlassTheme.colors.deepPurple,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 223, 186, 0.1)',
  },
  modalTitle: {
    ...Typography.h4,
    color: StainedGlassTheme.colors.parchment,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalDescription: {
    color: StainedGlassTheme.colors.parchmentLight,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: StainedGlassTheme.colors.gold,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  cameraButtonText: {
    color: '#1A0B4E',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
    backgroundColor: 'rgba(255, 223, 186, 0.1)',
  },
  cancelButtonText: {
    color: StainedGlassTheme.colors.parchment,
    fontSize: 16,
    fontWeight: '600',
  },
  modalPreview: {
    width: '100%',
    height: 300,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    backgroundColor: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(255, 223, 186, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
    gap: Spacing.sm,
  },
  secondaryModalText: {
    color: StainedGlassTheme.colors.parchment,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryModalButton: {
    flex: 1.5,
    padding: Spacing.lg,
    backgroundColor: StainedGlassTheme.colors.gold,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryModalText: {
    color: '#1A0B4E',
    fontSize: 16,
    fontWeight: 'bold',
  },
});