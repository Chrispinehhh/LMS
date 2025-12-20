// src/screens/ProfileScreen.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { StainedGlassCard } from '../components/StainedGlassCard';
import { StainedGlassTheme, Typography, Spacing, BorderRadius } from '../styles/globalStyles';
import { SSLogisticsLogo } from '../components/SSLogisticsLogo';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        // You could add a confirmation dialog here
        logout();
    };

    return (
        <ScreenWrapper style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <SSLogisticsLogo size="medium" variant="badge" />
                    </View>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <Text style={styles.headerSubtitle}>Driver Account</Text>
                </View>

                {/* Profile Card */}
                <StainedGlassCard style={styles.profileCard}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {user?.first_name?.charAt(0)?.toUpperCase() || 'D'}
                                {user?.last_name?.charAt(0)?.toUpperCase() || ''}
                            </Text>
                            <View style={styles.onlineIndicator} />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                                {user?.first_name} {user?.last_name}
                            </Text>
                            <View style={styles.roleBadge}>
                                <Ionicons name="shield-checkmark" size={14} color={StainedGlassTheme.colors.gold} />
                                <Text style={styles.userRole}>Official Driver</Text>
                            </View>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </View>
                    </View>
                </StainedGlassCard>

                {/* Stats Card */}
                <StainedGlassCard style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Performance Stats</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                                <Ionicons name="star" size={20} color="#FBBF24" />
                            </View>
                            <Text style={styles.statValue}>4.9</Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statBox}>
                            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                <Ionicons name="car" size={20} color="#3B82F6" />
                            </View>
                            <Text style={styles.statValue}>124</Text>
                            <Text style={styles.statLabel}>Trips</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statBox}>
                            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                                <Ionicons name="time" size={20} color="#22C55E" />
                            </View>
                            <Text style={styles.statValue}>98%</Text>
                            <Text style={styles.statLabel}>On Time</Text>
                        </View>
                    </View>
                </StainedGlassCard>

                {/* Menu Section */}
                <StainedGlassCard style={styles.menuCard}>
                    <Text style={styles.menuTitle}>Account & Settings</Text>

                    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(96, 165, 250, 0.15)' }]}>
                            <Ionicons name="car-sport-outline" size={22} color="#60A5FA" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Vehicle Information</Text>
                            <Text style={styles.menuSubtext}>Manage your vehicle details</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={StainedGlassTheme.colors.goldLight} />
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />

                    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
                            <Ionicons name="settings-outline" size={22} color="#A78BFA" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Account Settings</Text>
                            <Text style={styles.menuSubtext}>Update preferences & notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={StainedGlassTheme.colors.goldLight} />
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />

                    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
                            <Ionicons name="help-circle-outline" size={22} color="#FBBF24" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Help & Support</Text>
                            <Text style={styles.menuSubtext}>Get assistance & contact dispatch</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={StainedGlassTheme.colors.goldLight} />
                    </TouchableOpacity>

                    <View style={styles.menuDivider} />

                    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
                            <Ionicons name="document-text-outline" size={22} color="#34D399" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Documents</Text>
                            <Text style={styles.menuSubtext}>Licenses, insurance & permits</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={StainedGlassTheme.colors.goldLight} />
                    </TouchableOpacity>
                </StainedGlassCard>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <View style={styles.logoutIconContainer}>
                        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    </View>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                {/* Footer */}

            </ScrollView>
        </ScreenWrapper >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Reduced padding for floating tab bar
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    logoContainer: {
        marginBottom: Spacing.lg,
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.h2,
        color: StainedGlassTheme.colors.parchment,
        textAlign: 'center',
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    headerSubtitle: {
        ...Typography.caption,
        color: StainedGlassTheme.colors.parchmentLight,
        textAlign: 'center',
    },
    profileCard: {
        padding: Spacing.lg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    avatarSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: StainedGlassTheme.colors.goldMedium,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.lg,
        borderWidth: 2,
        borderColor: StainedGlassTheme.colors.gold,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '700',
        color: StainedGlassTheme.colors.deepPurple,
        letterSpacing: 1,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: StainedGlassTheme.colors.deepPurple,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        ...Typography.h4,
        color: StainedGlassTheme.colors.parchment,
        marginBottom: Spacing.xs,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 223, 186, 0.1)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        alignSelf: 'flex-start',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 223, 186, 0.2)',
    },
    userRole: {
        fontSize: 12,
        fontWeight: '600',
        color: StainedGlassTheme.colors.gold,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    userEmail: {
        ...Typography.caption,
        color: StainedGlassTheme.colors.parchmentLight,
        fontSize: 14,
    },
    statsCard: {
        padding: Spacing.lg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    statsTitle: {
        ...Typography.h4,
        color: StainedGlassTheme.colors.parchment,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: StainedGlassTheme.colors.parchment,
        marginBottom: Spacing.xs,
    },
    statLabel: {
        fontSize: 12,
        color: StainedGlassTheme.colors.parchmentLight,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 223, 186, 0.1)',
    },
    menuCard: {
        padding: Spacing.lg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    menuTitle: {
        ...Typography.h4,
        color: StainedGlassTheme.colors.parchment,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    menuIconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    menuTextContainer: {
        flex: 1,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
        color: StainedGlassTheme.colors.parchment,
        marginBottom: 2,
    },
    menuSubtext: {
        fontSize: 13,
        color: StainedGlassTheme.colors.parchmentLight,
    },
    menuDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 223, 186, 0.1)',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.lg,
        padding: Spacing.lg,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginBottom: Spacing.xl,
    },
    logoutIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#EF4444',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    footer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    footerText: {
        ...Typography.caption,
        color: StainedGlassTheme.colors.parchmentLight,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    footerSubtext: {
        fontSize: 12,
        color: StainedGlassTheme.colors.parchmentLight,
        opacity: 0.7,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});