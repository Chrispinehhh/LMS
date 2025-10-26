// src/screens/JobsScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { JobDetail } from '../types'; // Updated import
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Fixed import
import { RootStackParamList } from '../navigation/AppNavigator';

// Type for our navigation prop
type JobsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Jobs'>;

// Define the ShipmentListItem type since it's not exported from types
interface ShipmentListItem {
  id: string;
  job_id: string;
  pickup_address: string;
  delivery_address: string;
  requested_pickup_date: string;
  customer_name: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
}

const JobListItem = ({ item, onPress }: { item: ShipmentListItem, onPress: () => void }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View>
      <Text style={styles.itemAddress} numberOfLines={1}>From: {item.pickup_address}</Text>
      <Text style={styles.itemAddress} numberOfLines={1}>To: {item.delivery_address}</Text>
      <Text style={styles.itemDate}>
        Scheduled for: {new Date(item.requested_pickup_date).toLocaleString()}
      </Text>
      <Text style={styles.itemCustomer}>Customer: {item.customer_name}</Text>
    </View>
    <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
      <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
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
  // UPDATED: Added '/transportation/' prefix to the API endpoint
  const { data: assignedJobs, error, isLoading, mutate } = useApi<ShipmentListItem[]>('/transportation/drivers/me/jobs/');
  const navigation = useNavigation<JobsScreenNavigationProp>();

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 20 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>Failed to load jobs. Please pull down to refresh.</Text>;
    }
    if (!assignedJobs || assignedJobs.length === 0) {
      return <Text style={styles.emptyText}>You have no jobs assigned at the moment.</Text>;
    }

    return (
      <FlatList
        data={assignedJobs}
        renderItem={({ item }) => (
          <JobListItem 
            item={item}
            onPress={() => navigation.navigate('JobDetail', { 
              jobId: item.job_id,
              shipmentId: item.id // Pass the shipment ID as well
            })}
          />
        )}
        keyExtractor={(item) => item.id}
        onRefresh={mutate} // Enables pull-to-refresh
        refreshing={isLoading}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>Welcome, {user?.first_name || 'Driver'}!</Text>
        <Button title="Log Out" onPress={logout} color="#ff3b30" />
      </View>
      <Text style={styles.subtitle}>My Assigned Jobs</Text>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f7' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 10, 
    paddingBottom: 5 
  },
  title: { fontSize: 24, fontWeight: 'bold', flexShrink: 1 },
  subtitle: { fontSize: 20, marginBottom: 10, color: '#666', paddingHorizontal: 16 },
  errorText: { textAlign: 'center', color: 'red', marginTop: 20, paddingHorizontal: 16 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20, paddingHorizontal: 16 },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemAddress: { fontSize: 16, fontWeight: '500', color: '#1c1c1e' },
  itemDate: { fontSize: 14, color: '#8e8e93', marginTop: 8 },
  itemCustomer: { fontSize: 14, color: '#3c3c43', marginTop: 4, fontStyle: 'italic' },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusPENDING: { backgroundColor: '#ff9500' },
  statusIN_TRANSIT: { backgroundColor: '#007aff' },
  statusDELIVERED: { backgroundColor: '#34c759' },
  statusFAILED: { backgroundColor: '#ff3b30' },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
});