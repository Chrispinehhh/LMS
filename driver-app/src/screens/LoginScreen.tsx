// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    StainedGlassTheme,
    StainedGlassStyles,
    Typography,
    Spacing,
    BorderRadius,
    Shadows
} from '../styles/globalStyles';
import { StainedGlassCard } from '../components/StainedGlassCard';
import { StainedGlassInput } from '../components/StainedGlassInput';
import { SSLogisticsLogo } from '../components/SSLogisticsLogo';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password.");
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            console.error("Login attempt failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            Alert.alert("Login Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Main Stained Glass Card - REUSABLE COMPONENT */}
                <StainedGlassCard
                    style={{ padding: Spacing.xl }}
                    showLogoAccents={true}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        {/* Premium S&S Logistics Logo */}
                        <View style={styles.logoContainer}>
                            <SSLogisticsLogo size="medium" variant="badge" />
                        </View>

                        <Text style={[
                            Typography.h2,
                            styles.title,
                            styles.stainedText
                        ]}>
                            Driver Portal
                        </Text>
                        <Text style={[
                            Typography.captionMedium,
                            styles.subtitle,
                            styles.stainedSubtext
                        ]}>
                            Verified drivers only
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={[styles.form, { gap: Spacing.md }]}>

                        {/* Email Input - REUSABLE COMPONENT */}
                        <StainedGlassInput
                            icon="mail-outline"
                            placeholder="Driver Email"
                            placeholderTextColor={StainedGlassTheme.colors.parchmentLight}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                        />

                        {/* Password Input - REUSABLE COMPONENT */}
                        <StainedGlassInput
                            icon="lock-closed-outline"
                            placeholder="Password"
                            placeholderTextColor={StainedGlassTheme.colors.parchmentLight}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            showPasswordToggle
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            autoComplete="password"
                        />

                        {/* Remember Me & Forgot Password */}
                        <View style={styles.rowBetween}>
                            <TouchableOpacity
                                style={styles.rememberRow}
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <Ionicons
                                    name={rememberMe ? "checkbox" : "square-outline"}
                                    size={20}
                                    color={rememberMe ? StainedGlassTheme.colors.gold : StainedGlassTheme.colors.goldLight}
                                />
                                <Text style={[
                                    Typography.smallMedium,
                                    styles.stainedSubtext,
                                    { marginLeft: Spacing.sm }
                                ]}>
                                    Remember this device
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Text style={[
                                    Typography.smallMedium,
                                    styles.goldLink
                                ]}>
                                    Forgot password?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button - FIXED HERE */}
                        <TouchableOpacity
                            style={[styles.primaryBtn, Shadows.lg]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={StainedGlassTheme.colors.buttonGradient as any}
                                style={styles.gradientBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={StainedGlassTheme.colors.gold} />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                                        <Text style={[
                                            styles.primaryBtnText,
                                            { color: StainedGlassTheme.colors.gold }
                                        ]}>
                                            Sign In
                                        </Text>
                                        <Ionicons name="arrow-forward" size={18} color={StainedGlassTheme.colors.gold} />
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Security Notice */}
                        <View style={[
                            styles.securityNotice,
                            styles.stainedPanel
                        ]}>
                            <View style={[
                                styles.sealContainer,
                                { backgroundColor: StainedGlassTheme.colors.goldVeryLight }
                            ]}>
                                <Ionicons name="shield-checkmark" size={16} color={StainedGlassTheme.colors.gold} />
                            </View>
                            <Text style={[
                                Typography.small,
                                styles.securityText,
                                styles.stainedSubtext
                            ]}>
                                Secure driver authentication required
                            </Text>
                        </View>

                    </View>

                    {/* Contact Support */}
                    <View style={[
                        styles.supportContainer,
                        styles.stainedDivider
                    ]}>
                        <Text style={[
                            Typography.caption,
                            styles.supportText,
                            styles.stainedSubtext
                        ]}>
                            Need access? Contact dispatch
                        </Text>
                        <TouchableOpacity style={[
                            styles.supportButton,
                            styles.stainedButton
                        ]}>
                            <Text style={[
                                Typography.captionMedium,
                                styles.supportButtonText,
                                styles.goldLink
                            ]}>
                                dispatch@company.com
                            </Text>
                        </TouchableOpacity>
                    </View>

                </StainedGlassCard>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoContainer: {
        marginBottom: Spacing.lg,
        alignItems: 'center',
        position: 'relative',
    },
    driverBadge: {
        display: 'none',
    },
    stainedText: {
        color: StainedGlassTheme.colors.parchment,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    stainedSubtext: {
        color: StainedGlassTheme.colors.parchmentLight,
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    goldLink: {
        color: StainedGlassTheme.colors.gold,
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
        fontWeight: '600',
    },
    form: {
        width: '100%',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    primaryBtn: {
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: StainedGlassTheme.colors.goldMedium,
    },
    gradientBtn: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    primaryBtnText: {
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    securityNotice: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    stainedPanel: {
        backgroundColor: StainedGlassTheme.colors.darkPurple,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
    },
    sealContainer: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.full,
    },
    securityText: {
        textAlign: 'center',
    },
    supportContainer: {
        alignItems: 'center',
        borderTopWidth: 2,
    },
    stainedDivider: {
        borderTopColor: StainedGlassTheme.colors.goldDark,
        marginTop: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    supportText: {
        textAlign: 'center',
    },
    supportButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.xs,
    },
    stainedButton: {
        backgroundColor: StainedGlassTheme.colors.goldVeryLight,
        borderColor: StainedGlassTheme.colors.goldDark,
        borderWidth: 1,
    },
    supportButtonText: {
        textAlign: 'center',
    },
    title: {
        marginBottom: Spacing.xs,
    },
    subtitle: {
        textAlign: 'center',
    },
});