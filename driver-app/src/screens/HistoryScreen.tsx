// src/screens/HistoryScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StainedGlassCard } from '../components/StainedGlassCard';
import {
    StainedGlassTheme,
    Typography,
    Spacing,
    BorderRadius,
    StainedGlassStyles
} from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SSLogisticsLogo } from '../components/SSLogisticsLogo';
import { useApi } from '../hooks/useApi';
import { ShipmentListItem } from '../types';

export default function HistoryScreen() {
    const { data: allJobs, error, isLoading, mutate } = useApi<ShipmentListItem[]>('/transportation/drivers/me/jobs/');

    // Filter to only show delivered jobs
    const history = allJobs?.filter((job) => job.status === 'DELIVERED') || [];

    const getStatusColor = (status: string) => {
        return status === 'DELIVERED' ? '#10B981' : '#F59E0B';
    };

    const renderHistoryItem = (item: ShipmentListItem) => {
        const statusColor = getStatusColor(item.status);

        return (
            <StainedGlassCard key={item.id} style={styles.historyCard}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.jobInfo}>
                        <Text style={styles.jobNumber}>Job #{item.job_id}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                            <Ionicons
                                name="checkmark-circle"
                                size={12}
                                color={statusColor}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.date}>
                        {new Date(item.requested_pickup_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </Text>
                </View>

                {/* Route */}
                <View style={styles.routeContainer}>
                    <View style={styles.locationRow}>
                        <View style={[styles.dot, styles.pickupDot]} />
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationLabel}>From</Text>
                            <Text style={styles.city}>{item.pickup_city}</Text>
                        </View>
                    </View>

                    <View style={styles.routeLine}>
                        <View style={styles.line} />
                        <Ionicons name="arrow-down" size={16} color={StainedGlassTheme.colors.goldMedium} />
                    </View>

                    <View style={styles.locationRow}>
                        <View style={[styles.dot, styles.deliveryDot]} />
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationLabel}>To</Text>
                            <Text style={styles.city}>{item.delivery_city}</Text>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Customer</Text>
                            <Text style={styles.detailValue}>{item.customer_name}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Shipment ID</Text>
                            <Text style={[styles.detailValue, styles.earnings]}>
                                {item.id.substring(0, 8)}...
                            </Text>
                        </View>
                    </View>
                </View>
            </StainedGlassCard>
        );
    };

    return (
        <ScreenWrapper style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleSection}>
                        <SSLogisticsLogo size="small" variant="badge" />
                        <View style={styles.titleInfo}>
                            <Text style={styles.title}>Job History</Text>
                            <Text style={styles.subtitle}>
                                {history.length} completed {history.length === 1 ? 'job' : 'jobs'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={StainedGlassTheme.colors.gold} />
                    <Text style={styles.loadingText}>Loading history...</Text>
                </View>
            ) : history.length > 0 ? (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={mutate}
                            tintColor={StainedGlassTheme.colors.gold}
                        />
                    }
                >
                    {history.map(renderHistoryItem)}
                </ScrollView>
            ) : (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                        <Ionicons
                            name="time-outline"
                            size={64}
                            color={StainedGlassTheme.colors.goldLight}
                        />
                    </View>
                    <Text style={styles.emptyTitle}>No History Yet</Text>
                    <Text style={styles.emptyText}>
                        Completed jobs will appear here with detailed records.
                    </Text>
                    <Text style={styles.emptySubtext}>
                        Check back after completing your first delivery.
                    </Text>

                    <View style={styles.emptyBrand}>
                        <SSLogisticsLogo size="medium" variant="badge" />
                        <Text style={styles.emptyBrandText}>
                            S&S Logistics History
                        </Text>
                    </View>
                </View>
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        marginTop: Spacing.md,
        color: StainedGlassTheme.colors.parchmentLight,
        fontSize: 14,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        backgroundColor: 'rgba(41, 37, 66, 0.3)',
        borderBottomWidth: 1,
        borderBottomColor: StainedGlassTheme.colors.goldDark,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    titleInfo: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    title: {
        ...Typography.h2,
        color: StainedGlassTheme.colors.parchment,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.captionMedium,
        color: StainedGlassTheme.colors.parchmentLight,
    },
    statsCard: {
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: StainedGlassTheme.colors.gold,
        marginBottom: Spacing.xs,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    statLabel: {
        fontSize: 12,
        color: StainedGlassTheme.colors.parchmentLight,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 223, 186, 0.2)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100, // Reduced padding for floating tab bar
        gap: Spacing.lg,
    },
    historyCard: {
        padding: Spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 223, 186, 0.1)',
    },
    jobInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    jobNumber: {
        ...Typography.h4,
        color: StainedGlassTheme.colors.parchment,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 12,
        color: StainedGlassTheme.colors.parchmentLight,
        fontWeight: '500',
    },
    routeContainer: {
        marginBottom: Spacing.lg,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: Spacing.sm,
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
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 11,
        color: StainedGlassTheme.colors.parchmentLight,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    city: {
        fontSize: 16,
        fontWeight: '600',
        color: StainedGlassTheme.colors.parchment,
    },
    routeLine: {
        alignItems: 'center',
        height: 20,
        marginLeft: 5,
        marginVertical: 2,
    },
    line: {
        width: 2,
        height: '100%',
        backgroundColor: StainedGlassTheme.colors.goldMedium,
        opacity: 0.4,
    },
    detailsContainer: {
        marginBottom: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: 'rgba(28, 25, 48, 0.3)',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 223, 186, 0.1)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: StainedGlassTheme.colors.parchmentLight,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        color: StainedGlassTheme.colors.parchment,
        fontWeight: '500',
    },
    earnings: {
        color: StainedGlassTheme.colors.gold,
        fontWeight: '700',
    },
    cardFooter: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    receiptButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        backgroundColor: 'rgba(255, 223, 186, 0.1)',
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: StainedGlassTheme.colors.goldDark,
        gap: Spacing.xs,
    },
    receiptButtonText: {
        color: StainedGlassTheme.colors.gold,
        fontSize: 14,
        fontWeight: '600',
    },
    repeatButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        backgroundColor: 'rgba(28, 25, 48, 0.4)',
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderColor: StainedGlassTheme.colors.goldDark,
        gap: Spacing.xs,
    },
    repeatButtonText: {
        color: StainedGlassTheme.colors.goldLight,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 223, 186, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: StainedGlassTheme.colors.goldDark,
    },
    emptyTitle: {
        ...Typography.h3,
        color: StainedGlassTheme.colors.parchment,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    emptyText: {
        ...Typography.body,
        color: StainedGlassTheme.colors.parchmentLight,
        textAlign: 'center',
        marginBottom: Spacing.xs,
        lineHeight: 22,
        maxWidth: 300,
    },
    emptySubtext: {
        ...Typography.caption,
        color: StainedGlassTheme.colors.parchmentLight,
        textAlign: 'center',
        opacity: 0.7,
        marginBottom: Spacing.xl,
    },
    emptyBrand: {
        alignItems: 'center',
        marginTop: Spacing.lg,
        gap: Spacing.sm,
    },
    emptyBrandText: {
        color: StainedGlassTheme.colors.parchmentLight,
        fontSize: 14,
        fontWeight: '300',
        fontStyle: 'italic',
    },
});
