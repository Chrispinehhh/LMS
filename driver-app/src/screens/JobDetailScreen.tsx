// driver-app/src/screens/JobDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Button, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApi } from '../hooks/useApi';
import { JobDetail } from '../types';
import apiClient from '../lib/api';

const InfoBlock = ({ label, value }: { label: string; value: string | undefined }) => (
    <View style={styles.infoBlock}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
);

export default function JobDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'JobDetail'>>();
  const { jobId, shipmentId } = route.params;

  // We fetch the Job data, which now includes the shipment's status
  const { data: job, error, isLoading, mutate } = useApi<JobDetail>(jobId ? `/jobs/${jobId}/` : null);

  const handleUpdateStatus = async (status: 'IN_TRANSIT' | 'DELIVERED') => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to mark this job as ${status.replace('_', ' ')}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              // We PATCH the SHIPMENT with the new status
              await apiClient.patch(`/shipments/${shipmentId}/`, { status });
              Alert.alert("Success", `Job status updated to ${status}!`);
              mutate(); // Re-fetch the job details to show the new status
            } catch (err) {
              Alert.alert("Error", "Failed to update status.");
              console.error(err);
            }
          },
        },
      ]
    );
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service & Cargo</Text>
          <InfoBlock label="Service Type" value={job.service_type.replace(/_/g, ' ')} />
          <InfoBlock label="Cargo Description" value={job.cargo_description} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pickup Details</Text>
          <InfoBlock label="Address" value={`${job.pickup_address}, ${job.pickup_city}`} />
          <InfoBlock label="Contact Person" value={job.pickup_contact_person} />
          <InfoBlock label="Contact Phone" value={job.pickup_contact_phone} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <InfoBlock label="Address" value={`${job.delivery_address}, ${job.delivery_city}`} />
          <InfoBlock label="Contact Person" value={job.delivery_contact_person} />
          <InfoBlock label="Contact Phone" value={job.delivery_contact_phone} />
        </View>
        
        <View style={styles.actionsContainer}>
            {/* --- THIS LOGIC IS NOW CORRECT AND TYPE-SAFE --- */}
            {job.status === 'PENDING' && (
                <Button title="Start Job (Mark as In Transit)" onPress={() => handleUpdateStatus('IN_TRANSIT')} />
            )}
            {job.status === 'IN_TRANSIT' && (
                <Button title="Complete Job (Mark as Delivered)" color="#34c759" onPress={() => handleUpdateStatus('DELIVERED')} />
            )}
             {job.status === 'DELIVERED' && (
                <Text style={styles.completedText}>✓ This job is complete.</Text>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f7' },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginHorizontal: 16, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
    infoBlock: { marginVertical: 6 },
    label: { fontSize: 14, color: '#8e8e93' },
    value: { fontSize: 16, fontWeight: '500', marginTop: 2, color: '#1c1c1e' },
    actionsContainer: { padding: 16, marginTop: 16 },
    completedText: { textAlign: 'center', fontSize: 16, color: '#34c759', fontWeight: 'bold' },
    errorText: { textAlign: 'center', color: 'red', marginTop: 20 },
});