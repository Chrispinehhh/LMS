import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../lib/api';
import { Job } from '../types';

export default function JobsListScreen() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<any>();

    const fetchJobs = async () => {
        try {
            const response = await api.get('/driver/jobs/');
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#f59e0b'; // Amber
            case 'PICKED_UP': return '#3b82f6'; // Blue
            case 'IN_TRANSIT': return '#8b5cf6'; // Purple
            case 'DELIVERED': return '#10b981'; // Green
            default: return '#6b7280';
        }
    };

    const renderItem = ({ item }: { item: Job }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
                <Text style={styles.date}>{new Date(item.requested_pickup_date).toLocaleDateString()}</Text>
            </View>

            <View style={styles.routeContainer}>
                <View style={styles.location}>
                    <View style={styles.dot} />
                    <Text style={styles.city}>{item.pickup_city}</Text>
                </View>
                <View style={styles.line} />
                <View style={styles.location}>
                    <View style={[styles.dot, styles.dotDest]} />
                    <Text style={styles.city}>{item.delivery_city}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.cargo}>{item.cargo_description}</Text>
                <Text style={styles.customer}>{item.customer_name}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>My Jobs</Text>
            </View>

            <FlatList
                data={jobs}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No jobs assigned yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    list: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    date: {
        fontSize: 12,
        color: '#64748b',
    },
    routeContainer: {
        marginBottom: 16,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: 4,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2563eb',
    },
    dotDest: {
        backgroundColor: '#10b981',
    },
    line: {
        height: 20,
        width: 2,
        backgroundColor: '#e2e8f0',
        marginLeft: 4,
        marginVertical: -4,
    },
    city: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    cargo: {
        fontSize: 14,
        color: '#64748b',
    },
    customer: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
    },
    empty: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    }
});
