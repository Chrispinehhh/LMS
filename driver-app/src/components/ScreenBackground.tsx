// src/components/ScreenBackground.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface ScreenBackgroundProps {
    children?: React.ReactNode;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1A0B4E', '#2D1B69', '#1A0B4E']}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            />

            {/* Decorative orbs for depth */}
            <View style={styles.backgroundGradient}>
                <View style={[styles.orb, styles.orbTop]} />
                <View style={[styles.orb, styles.orbBottom]} />
                <View style={[styles.orb, styles.orbAccent]} />
            </View>

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A0B4E',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundGradient: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        borderRadius: 1000,
        opacity: 0.15,
    },
    orbTop: {
        top: -width * 0.45,
        left: -width * 0.25,
        width: width * 1.6,
        height: width * 1.6,
        backgroundColor: '#FFB347', // Warm Gold
        opacity: 0.1,
        transform: [{ rotate: '20deg' }],
    },
    orbBottom: {
        bottom: -width * 0.45,
        right: -width * 0.25,
        width: width * 1.6,
        height: width * 1.6,
        backgroundColor: '#6A0DAD', // Deep Purple
        opacity: 0.12,
        transform: [{ rotate: '-20deg' }],
    },
    orbAccent: {
        top: height * 0.35,
        right: -width * 0.4,
        width: width * 1.2,
        height: width * 1.2,
        backgroundColor: '#E11D48', // Ruby/Rose support 
        opacity: 0.08,
        transform: [{ scale: 1.2 }],
    },
});