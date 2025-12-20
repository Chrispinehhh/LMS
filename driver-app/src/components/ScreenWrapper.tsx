import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView, Edges } from 'react-native-safe-area-context';
import { ScreenBackground } from './ScreenBackground';
import { StatusBar } from 'expo-status-bar';

interface ScreenWrapperProps {
    children: ReactNode;
    style?: ViewStyle;
    edges?: Edges;
    useSafeArea?: boolean;
    showStatusBar?: boolean;
    statusBarStyle?: 'light' | 'dark' | 'auto';
    translucent?: boolean;
    backgroundColor?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
    children,
    style,
    edges = ['top'],
    useSafeArea = true,
    showStatusBar = true,
    statusBarStyle = 'light',
    translucent = true,
}) => {
    const Content = (
        <>
            {showStatusBar && <StatusBar style={statusBarStyle} translucent={translucent} backgroundColor="transparent" />}
            {useSafeArea ? (
                <SafeAreaView style={[styles.container, style]} edges={edges}>
                    {children}
                </SafeAreaView>
            ) : (
                <View style={[styles.container, style]}>
                    {children}
                </View>
            )}
        </>
    );

    return (
        <ScreenBackground>
            {Content}
        </ScreenBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
