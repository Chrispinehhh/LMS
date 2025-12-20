// src/screens/JobsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { ShipmentListItem } from '../types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StainedGlassCard } from '../components/StainedGlassCard';
import { SSLogisticsLogo } from '../components/SSLogisticsLogo';
import { StainedGlassTheme, Typography, Spacing, BorderRadius } from '../styles/globalStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Type for our navigation prop - using any for simplicity since we navigate to both tab and stack screens
type JobsScreenNavigationProp = any;

const JobListItem = ({ item, onPress }: { item: ShipmentListItem, onPress: () => void }) => {
  const statusConfig = getStatusConfig(item.status);

  return (
    <View
      style={styles.listItemTouchable}
    >
      <StainedGlassCard style={styles.jobCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.jobIdContainer}>
            <Ionicons name="document-text-outline" size={16} color={StainedGlassTheme.colors.goldLight} />
            <Text style={styles.jobId}>Job #{item.job_id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Route Visualization */}
        <View style={styles.routeContainer}>
          {/* Pickup Location */}
          <View style={styles.locationRow}>
            <View style={[styles.routeDot, styles.pickupDot]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>PICKUP</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {item.pickup_address}
              </Text>
            </View>
          </View>

          {/* Route Line */}
          <View style={styles.routeLineContainer}>
            <View style={styles.verticalLine} />
            <Ionicons name="arrow-down" size={16} color={StainedGlassTheme.colors.goldMedium} style={styles.routeArrow} />
          </View>

          {/* Delivery Location */}
          <View style={styles.locationRow}>
            <View style={[styles.routeDot, styles.deliveryDot]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>DELIVERY</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {item.delivery_address}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerRow}>
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={14} color={StainedGlassTheme.colors.parchmentLight} />
              <Text style={styles.footerText}>
                {new Date(item.requested_pickup_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={14} color={StainedGlassTheme.colors.parchmentLight} />
              <Text style={styles.footerText}>
                {new Date(item.requested_pickup_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          <View style={styles.customerRow}>
            <Ionicons name="person-outline" size={14} color={StainedGlassTheme.colors.parchmentLight} />
            <Text style={styles.customerText}>{item.customer_name}</Text>
          </View>
        </View>

        {/* View Details Button */}
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.viewDetailsText}>View Job Details</Text>
          <Ionicons name="chevron-forward" size={16} color={StainedGlassTheme.colors.gold} />
        </TouchableOpacity>
      </StainedGlassCard>
    </View>
  );
};

// Helper function to get status config
// Helper function to get status config
const getStatusConfig = (status: ShipmentListItem['status']) => {
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

export default function JobsScreen() {
  const { user, logout } = useAuth();
  const { data: assignedJobs, error, isLoading, mutate } = useApi<ShipmentListItem[]>('/transportation/drivers/me/jobs/');
  const navigation = useNavigation<JobsScreenNavigationProp>();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_transit'>('all');

  // Filter to only show active jobs (not delivered or cancelled)
  const activeJobs = assignedJobs?.filter(
    (job) => !['DELIVERED', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(job.status)
  ) || [];

  // Apply additional filter based on selected chip
  const filteredJobs = activeJobs.filter((job) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') {
      return ['PENDING', 'ORDER_PLACED'].includes(job.status);
    }
    if (selectedFilter === 'in_transit') {
      return ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(job.status);
    }
    return true;
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={StainedGlassTheme.colors.gold} />
          <Text style={styles.loadingText}>Loading your jobs...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={48} color={StainedGlassTheme.colors.goldLight} />
          </View>
          <Text style={styles.errorText}>Failed to load jobs</Text>
          <Text style={styles.errorSubtext}>Please pull down to refresh</Text>
        </View>
      );
    }
    if (!activeJobs || activeJobs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="briefcase-outline" size={48} color={StainedGlassTheme.colors.goldLight} />
          </View>
          <Text style={styles.emptyTitle}>No Active Jobs</Text>
          <Text style={styles.emptyText}>
            You're all caught up! Completed jobs are in History.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredJobs}
        renderItem={({ item }) => (
          <JobListItem
            item={item}
            onPress={() => navigation.navigate('JobDetail', {
              jobId: item.job_id.toString(),
              shipmentId: item.id
            })}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={mutate}
            colors={[StainedGlassTheme.colors.gold]}
            tintColor={StainedGlassTheme.colors.gold}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <ScreenWrapper style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userSection}>
            <SSLogisticsLogo size="small" variant="badge" />
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>{getTimeBasedGreeting()},</Text>
              <Text style={styles.userName}>
                {user?.first_name || 'Driver'}! 👋
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={StainedGlassTheme.colors.parchmentLight} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>
            All ({activeJobs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'pending' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('pending')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="hourglass-outline"
            size={14}
            color={selectedFilter === 'pending' ? StainedGlassTheme.colors.gold : StainedGlassTheme.colors.parchmentLight}
          />
          <Text style={[styles.filterChipText, selectedFilter === 'pending' && styles.filterChipTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedFilter === 'in_transit' && styles.filterChipActive]}
          onPress={() => setSelectedFilter('in_transit')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="car-outline"
            size={14}
            color={selectedFilter === 'in_transit' ? StainedGlassTheme.colors.gold : StainedGlassTheme.colors.parchmentLight}
          />
          <Text style={[styles.filterChipText, selectedFilter === 'in_transit' && styles.filterChipTextActive]}>
            In Transit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  // Header Styles
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(41, 37, 66, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: StainedGlassTheme.colors.goldDark,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    marginLeft: Spacing.md,
  },
  greeting: {
    ...Typography.caption,
    color: StainedGlassTheme.colors.parchmentLight,
    fontWeight: '500',
  },
  userName: {
    ...Typography.h3,
    color: StainedGlassTheme.colors.parchment,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 223, 186, 0.1)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
    gap: Spacing.xs,
  },
  logoutText: {
    color: StainedGlassTheme.colors.parchmentLight,
    fontWeight: '600',
    fontSize: 14,
  },
  // Title Section
  titleSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    position: 'relative',
  },
  pageTitle: {
    ...Typography.h1,
    color: StainedGlassTheme.colors.parchment,
    marginBottom: Spacing.xs,
  },
  pageSubtitle: {
    ...Typography.body,
    color: StainedGlassTheme.colors.parchmentLight,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  jobCountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 223, 186, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
  },
  jobCountText: {
    color: StainedGlassTheme.colors.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Filter Styles
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 223, 186, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 186, 0.1)',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 223, 186, 0.15)',
    borderColor: StainedGlassTheme.colors.gold,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: StainedGlassTheme.colors.parchmentLight,
  },
  filterChipTextActive: {
    color: StainedGlassTheme.colors.gold,
  },
  // List Styles
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100, // Reduced padding for floating tab bar
  },
  listItemTouchable: {
    marginBottom: Spacing.lg,
  },
  jobCard: {
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  jobIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  jobId: {
    ...Typography.bodySemibold,
    color: StainedGlassTheme.colors.parchment,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Route Styles
  routeContainer: {
    marginBottom: Spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: Spacing.md,
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
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressText: {
    ...Typography.body,
    color: StainedGlassTheme.colors.parchment,
    lineHeight: 20,
  },
  routeLineContainer: {
    alignItems: 'center',
    height: 20,
    marginLeft: 5,
    marginVertical: 2,
  },
  verticalLine: {
    width: 2,
    height: '100%',
    backgroundColor: StainedGlassTheme.colors.goldMedium,
    opacity: 0.4,
  },
  routeArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -8,
  },
  // Card Footer
  cardFooter: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 223, 186, 0.1)',
    marginBottom: Spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    color: StainedGlassTheme.colors.parchmentLight,
    fontSize: 13,
    fontWeight: '500',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  customerText: {
    color: StainedGlassTheme.colors.parchment,
    fontSize: 14,
    fontWeight: '600',
  },
  // View Details Button
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 223, 186, 0.08)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: StainedGlassTheme.colors.goldDark,
  },
  viewDetailsText: {
    color: StainedGlassTheme.colors.gold,
    fontSize: 14,
    fontWeight: '600',
    marginRight: Spacing.xs,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: StainedGlassTheme.colors.parchmentLight,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  errorText: {
    ...Typography.h4,
    color: StainedGlassTheme.colors.parchment,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  errorSubtext: {
    ...Typography.body,
    color: StainedGlassTheme.colors.parchmentLight,
    textAlign: 'center',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 223, 186, 0.1)',
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
    lineHeight: 22,
    paddingHorizontal: Spacing.xl,
  },
});

