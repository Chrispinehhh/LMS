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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../lib/api';

// Stained Glass Components
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StainedGlassCard } from '../components/StainedGlassCard';
import {
  StainedGlassTheme,
  Typography,
  Spacing,
  BorderRadius,
} from '../styles/globalStyles';
import { DeliveryCompletionModal } from '../components/DeliveryCompletionModal';

type JobDetailScreenRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;
type JobDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'JobDetail'>;

export default function JobDetailScreen() {
  const route = useRoute<JobDetailScreenRouteProp>();
  const navigation = useNavigation<JobDetailScreenNavigationProp>();
  const { jobId } = route.params;
  const insets = useSafeAreaInsets();

  const { data: job, isLoading, error, mutate } = useApi<JobDetail>(`/driver/jobs/${jobId}/`);

  // State
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
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
      if (newStatus === 'DELIVERED') {
          setDeliveryModalVisible(true);
          setStatusUpdating(false);
          return;
      }

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

  const handleFinishDelivery = async (photos: any[], signature: string) => {
      setStatusUpdating(true);
      try {
          const formData = new FormData();
          
          if (signature) {
             formData.append('proof_of_delivery_signature', {
                uri: `data:image/png;base64,${signature}`,
                name: 'signature.png',
                type: 'image/png'
             } as any);
          }

          photos.forEach((photo, index) => {
             formData.append('photos', {
                 uri: photo.uri,
                 name: `photo_${index}.jpg`,
                 type: 'image/jpeg'
             } as any);
          });

          // Using the new complete-delivery endpoint
          await apiClient.post(`/driver/jobs/${jobId}/complete-delivery/`, formData, {
               headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          Alert.alert("Success", "Job Completed!");
          setDeliveryModalVisible(false);
          mutate();
          navigation.goBack();
      } catch (e: any) {
          console.error("Completion Error", e);
          Alert.alert("Error", "Failed to upload delivery data. " + (e.message || "Unknown error"));
      } finally {
          setStatusUpdating(false);
      }
  }

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
        <TouchableOpacity style={styles.retryButton} onPress={() => mutate()}>
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={StainedGlassTheme.colors.parchment} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.jobId}>Job #{job.job_number || job.id.toString().slice(0, 8)}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Ionicons name={statusConfig.icon as any} size={16} color={statusConfig.color} style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
              </View>
              <Text style={styles.date}>{new Date(job.requested_pickup_date).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {/* Main Job Card */}
        <StainedGlassCard style={styles.mainCard}>
          <View style={styles.routeSection}>
            <Text style={styles.sectionTitle}>ROUTE</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationDot}><View style={[styles.dot, styles.pickupDot]} /></View>
                <Text style={styles.locationLabel}>PICKUP LOCATION</Text>
              </View>
              <Text style={styles.address}>{job.pickup_address}</Text>
              <Text style={styles.city}>{job.pickup_city}</Text>
              <TouchableOpacity style={styles.navigationButton} onPress={() => openMaps(job.pickup_address, job.pickup_city)}>
                <Ionicons name="navigate" size={16} color={StainedGlassTheme.colors.gold} />
                <Text style={styles.navigationText}>Navigate to Pickup</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.routeLineContainer}>
              <View style={styles.routeLine} /><Ionicons name="arrow-down" size={20} color={StainedGlassTheme.colors.goldMedium} />
            </View>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationDot}><View style={[styles.dot, styles.deliveryDot]} /></View>
                <Text style={styles.locationLabel}>DELIVERY LOCATION</Text>
              </View>
              <Text style={styles.address}>{job.delivery_address}</Text>
              <Text style={styles.city}>{job.delivery_city}</Text>
              <TouchableOpacity style={styles.navigationButton} onPress={() => openMaps(job.delivery_address, job.delivery_city)}>
                <Ionicons name="navigate" size={16} color={StainedGlassTheme.colors.gold} />
                <Text style={styles.navigationText}>Navigate to Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>JOB DETAILS</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={20} color={StainedGlassTheme.colors.goldLight} />
                <View>
                  <Text style={styles.detailLabel}>Cargo Type</Text>
                  <Text style={styles.detailValue}>{job.cargo_description || 'General Cargo'}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color={StainedGlassTheme.colors.goldLight} />
                <View>
                  <Text style={styles.detailLabel}>Service Type</Text>
                  <Text style={styles.detailValue}>{job.service_type?.replace(/_/g, ' ') || 'Standard'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.customerSection}>
            <Text style={styles.sectionTitle}>CUSTOMER</Text>
            <View style={styles.customerCard}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerInitial}>{job.customer_name?.[0]?.toUpperCase() || 'C'}</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.customer_name}</Text>
                <Text style={styles.customerLabel}>Client</Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={() => callNumber(job.pickup_contact_phone || '')}>
                 <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

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
                    {statusUpdating ? <ActivityIndicator color="#1A0B4E" /> : (
                        <Text style={styles.primaryActionText}>Start Trip</Text>
                    )}
                </TouchableOpacity>
             ) : job.status === 'IN_TRANSIT' ? (
                <TouchableOpacity
                  style={[styles.primaryActionButton, { backgroundColor: '#60A5FA' }]}
                  onPress={() => handleUpdateStatus('PICKED_UP')}
                  disabled={statusUpdating}
                >
                    {statusUpdating ? <ActivityIndicator color="#1A0B4E" /> : (
                        <Text style={styles.primaryActionText}>Confirm Pickup</Text>
                    )}
                </TouchableOpacity>
             ) : (
                <TouchableOpacity
                  style={[styles.primaryActionButton, styles.completeButton]}
                  onPress={() => setDeliveryModalVisible(true)}
                >
                    <Text style={styles.primaryActionText}>Finish Delivery</Text>
                    <Ionicons name="flag" size={20} color={StainedGlassTheme.colors.parchment} />
                </TouchableOpacity>
             )}
        </View>
      )}

      <DeliveryCompletionModal 
         visible={deliveryModalVisible} 
         onClose={() => setDeliveryModalVisible(false)}
         onSubmit={handleFinishDelivery}
         uploading={statusUpdating}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: StainedGlassTheme.colors.parchment, marginTop: 12 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: StainedGlassTheme.colors.parchment, textAlign: 'center', marginBottom: 20 },
  retryButton: { padding: 12, borderWidth: 1, borderColor: StainedGlassTheme.colors.gold, borderRadius: 8 },
  retryButtonText: { color: StainedGlassTheme.colors.gold },
  
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40 },
  backButton: { marginRight: 16 },
  headerContent: { flex: 1 },
  jobId: { ...Typography.h3, color: StainedGlassTheme.colors.parchment },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statusBadge: { flexDirection: 'row', padding: 6, borderRadius: 4, alignItems: 'center' },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  date: { color: StainedGlassTheme.colors.parchmentLight },
  
  mainCard: { margin: 20, padding: 20 },
  sectionTitle: { color: StainedGlassTheme.colors.gold, fontWeight: 'bold', marginBottom: 16, fontSize: 12 },
  
  // Route Styles
  routeSection: { marginBottom: 24 },
  locationCard: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationDot: { width: 24 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pickupDot: { backgroundColor: '#3B82F6' },
  deliveryDot: { backgroundColor: '#10B981' },
  locationLabel: { color: StainedGlassTheme.colors.parchmentLight, fontSize: 10, fontWeight: 'bold' },
  address: { color: StainedGlassTheme.colors.parchment, fontSize: 16, fontWeight: '600', marginLeft: 24 },
  city: { color: StainedGlassTheme.colors.parchmentLight, marginLeft: 24, marginBottom: 12 },
  navigationButton: { flexDirection: 'row', marginLeft: 24, paddingVertical: 8, gap: 8 },
  navigationText: { color: StainedGlassTheme.colors.gold, fontSize: 14, fontWeight: '600' },
  routeLineContainer: { height: 30, marginLeft: 20, alignItems: 'center', justifyContent: 'center' },
  routeLine: { width: 2, height: '100%', backgroundColor: StainedGlassTheme.colors.gold, opacity: 0.3, position: 'absolute' },

  // Details Styles
  detailsSection: { marginBottom: 24 },
  detailsGrid: { gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 },
  detailLabel: { color: StainedGlassTheme.colors.parchmentLight, fontSize: 12, fontWeight: 'bold' },
  detailValue: { color: StainedGlassTheme.colors.parchment, fontSize: 14 },

  // Customer Styles
  customerSection: { marginBottom: 24 },
  customerCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12 },
  customerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 215, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  customerInitial: { color: StainedGlassTheme.colors.gold, fontSize: 20, fontWeight: 'bold' },
  customerInfo: { flex: 1 },
  customerName: { color: StainedGlassTheme.colors.parchment, fontSize: 16, fontWeight: '600' },
  customerLabel: { color: StainedGlassTheme.colors.parchmentLight },
  callButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: StainedGlassTheme.colors.gold, justifyContent: 'center', alignItems: 'center' },

  // Footer Button Styles
  actionFooter: {
      position: 'absolute',
      bottom: 0, 
      left: 0, 
      right: 0,
      backgroundColor: StainedGlassTheme.colors.deepPurple,
      borderTopWidth: 1,
      borderTopColor: StainedGlassTheme.colors.goldDark,
      padding: Spacing.lg,
  },
  primaryActionButton: {
      backgroundColor: StainedGlassTheme.colors.gold,
      borderRadius: BorderRadius.lg,
      height: 56,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
  },
  completeButton: {
      backgroundColor: '#34D399',
  },
  primaryActionText: {
      color: '#1A0B4E',
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
});