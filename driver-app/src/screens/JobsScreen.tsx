// src/screens/JobsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// Type for our navigation prop
type JobsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Jobs'>;

// Type matching the Backend "DriverJobSerializer"
interface Job {
  id: string; // This is the ID
  pickup_city: string; // The serializer returns cities
  delivery_city: string;
  pickup_address: string;
  delivery_address: string;
  requested_pickup_date: string;
  customer_name: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  cargo_description: string;
}

const JobListItem = ({ item, onPress }: { item: ShipmentListItem, onPress: () => void }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View style={styles.itemContent}>
      <View style={styles.itemHeader}>
        <Text style={styles.jobId}>Job #{item.job_id}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeDot}>
          <View style={styles.dot} />
          <View style={styles.verticalLine} />
        </View>
        <View style={styles.routeAddresses}>
          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>PICKUP</Text>
            <Text style={styles.addressText} numberOfLines={2}>{item.pickup_address}</Text>
          </View>
          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>DELIVERY</Text>
            <Text style={styles.addressText} numberOfLines={2}>{item.delivery_address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemFooter}>
        <Text style={styles.itemDate}>
          📅 {new Date(item.requested_pickup_date).toLocaleDateString()} • {new Date(item.requested_pickup_date).toLocaleTimeString()}
        </Text>
        <Text style={styles.itemCustomer}>👤 {item.customer_name}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Helper function to get status styles
const getStatusStyle = (status: ShipmentListItem['status']) => {
  switch (status) {
    case 'PENDING':
      return styles.statusPENDING;
    case 'IN_TRANSIT':
      return styles.statusIN_TRANSIT;
    case 'DELIVERED':
      return styles.statusDELIVERED;
    case 'FAILED':
      return styles.statusFAILED;
    default:
      return styles.statusPENDING;
  }
};

export default function JobsScreen() {
  const { user, logout } = useAuth();
  const { data: assignedJobs, error, isLoading, mutate } = useApi<ShipmentListItem[]>('/transportation/drivers/me/jobs/');
  const navigation = useNavigation<JobsScreenNavigationProp>();

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading your jobs...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load jobs</Text>
          <Text style={styles.errorSubtext}>Please pull down to refresh</Text>
        </View>
      );
    }
    if (!assignedJobs || assignedJobs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Jobs Assigned</Text>
          <Text style={styles.emptyText}>You're all caught up! New jobs will appear here when assigned.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={assignedJobs}
        renderItem={({ item }) => (
          <JobListItem
            item={item}
            onPress={() => navigation.navigate('JobDetail', {
              jobId: item.job_id,
              shipmentId: item.id
            })}
          />
        )}
        keyExtractor={(item) => item.id}
        onRefresh={mutate}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.first_name || 'Driver'}! 👋</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Page Title */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>My Assigned Jobs</Text>
        <Text style={styles.pageSubtitle}>Manage your delivery assignments</Text>
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14,
  },
  // Title Section
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  // List Styles
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemContent: {
    padding: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusPENDING: {
    backgroundColor: '#ffedd5',
  },
  statusIN_TRANSIT: {
    backgroundColor: '#dbeafe',
  },
  statusDELIVERED: {
    backgroundColor: '#dcfce7',
  },
  statusFAILED: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Route Styles
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeDot: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  routeAddresses: {
    flex: 1,
  },
  addressSection: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    lineHeight: 18,
  },
  // Footer Styles
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  itemDate: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  itemCustomer: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 8,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
});