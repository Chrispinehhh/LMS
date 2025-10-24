// driver-app/src/screens/JobsScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi'; // We need to create this hook
import { Shipment } from '../types';

// A reusable component for each item in our list
const JobListItem = ({ item, onPress }: { item: Shipment, onPress: () => void }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
    <View>
      <Text style={styles.itemAddress}>From: {item.job.pickup_address}</Text>
      <Text style={styles.itemAddress}>To: {item.job.delivery_address}</Text>
      <Text style={styles.itemDate}>
        Scheduled for: {new Date(item.job.requested_pickup_date).toLocaleString()}
      </Text>
    </View>
    <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
      <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
    </View>
  </TouchableOpacity>
);

export default function JobsScreen() {
  const { user, logout } = useAuth();
  
  // Fetch data from our new, dedicated endpoint
  const { data: assignedJobs, error, isLoading } = useApi<Shipment[]>('/jobs/assigned-to-me/');

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>Failed to load jobs. Please try again later.</Text>;
    }
    if (!assignedJobs || assignedJobs.length === 0) {
      return <Text style={styles.emptyText}>You have no jobs assigned.</Text>;
    }

    return (
      <FlatList
        data={assignedJobs}
        renderItem={({ item }) => (
          <JobListItem 
            item={item}
            onPress={() => console.log("Navigate to job detail:", item.id)} // We'll build this next
          />
        )}
        keyExtractor={(item) => item.id}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.first_name || 'Driver'}!</Text>
        <Button title="Log Out" onPress={logout} color="#ff3b30" />
      </View>
      <Text style={styles.subtitle}>My Assigned Jobs</Text>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 20, marginBottom: 16, color: '#666', paddingHorizontal: 16 },
  errorText: { textAlign: 'center', color: 'red', marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20 },
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
  itemAddress: { fontSize: 16, fontWeight: '500' },
  itemDate: { fontSize: 14, color: '#666', marginTop: 8 },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusPENDING: { backgroundColor: '#ffcc00' },
  statusIN_TRANSIT: { backgroundColor: '#007aff' },
  statusDELIVERED: { backgroundColor: '#34c759' },
  statusFAILED: { backgroundColor: '#ff3b30' },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});