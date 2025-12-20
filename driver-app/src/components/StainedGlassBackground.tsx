// src/components/StainedGlassBackground.tsx
import React, { ReactNode } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StainedGlassTheme } from '../styles/globalStyles';

const { width, height } = Dimensions.get('window');

interface StainedGlassBackgroundProps {
    children: ReactNode;
    showPattern?: boolean;
    variant?: 'solid' | 'gradient' | 'pattern';
}

export const StainedGlassBackground: React.FC<StainedGlassBackgroundProps> = ({
    children,
    showPattern = false,
    variant = 'gradient',
}) => {
    // You can use a local image or a pattern
    // For now, we'll use a gradient with decorative elements

    const BackgroundGradient = () => (
        <LinearGradient
            colors={['#0A003E', '#1A0B4E', '#2A1B5E'] as any}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {showPattern && (
                <>
                    {/* Decorative background elements */}
                    <View style={[styles.bgAccent, styles.bgAccent1]} />
                    <View style={[styles.bgAccent, styles.bgAccent2]} />
                    <View style={[styles.bgAccent, styles.bgAccent3]} />
                    <View style={[styles.bgAccent, styles.bgAccent4]} />
                    <View style={[styles.bgAccent, styles.bgAccent5]} />
                </>
            )}
            {children}
        </LinearGradient>
    );

    const BackgroundSolid = () => (
        <View style={[styles.container, { backgroundColor: StainedGlassTheme.colors.deepPurple }]}>
            {showPattern && (
                <>
                    <View style={[styles.bgAccent, styles.bgAccent1]} />
                    <View style={[styles.bgAccent, styles.bgAccent2]} />
                    <View style={[styles.bgAccent, styles.bgAccent3]} />
                    <View style={[styles.bgAccent, styles.bgAccent4]} />
                    <View style={[styles.bgAccent, styles.bgAccent5]} />
                </>
            )}
            {children}
        </View>
    );

    const BackgroundPattern = () => (
        <ImageBackground
            source={require('../assets/images/stained-glass-bg.png')} // You'll need to add this image
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                {children}
            </View>
        </ImageBackground>
    );

    switch (variant) {
        case 'solid':
            return <BackgroundSolid />;
        case 'pattern':
            return <BackgroundPattern />;
        case 'gradient':
        default:
            return <BackgroundGradient />;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(10, 0, 62, 0.4)', // Dark overlay for pattern
    },
    bgAccent: {
        position: 'absolute',
        borderRadius: 9999,
        opacity: 0.1,
    },
    bgAccent1: {
        width: 300,
        height: 300,
        top: -100,
        left: -100,
        backgroundColor: StainedGlassTheme.colors.amethyst,
    },
    bgAccent2: {
        width: 200,
        height: 200,
        bottom: -50,
        right: -50,
        backgroundColor: StainedGlassTheme.colors.sapphire,
    },
    bgAccent3: {
        width: 150,
        height: 150,
        top: '30%',
        right: '20%',
        backgroundColor: StainedGlassTheme.colors.ruby,
    },
    bgAccent4: {
        width: 100,
        height: 100,
        bottom: '40%',
        left: '15%',
        backgroundColor: StainedGlassTheme.colors.goldLight,
    },
    bgAccent5: {
        width: 250,
        height: 250,
        top: '60%',
        left: '5%',
        backgroundColor: StainedGlassTheme.colors.amethyst,
    },
});

export default StainedGlassBackground;