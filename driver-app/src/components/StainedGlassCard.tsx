// src/components/StainedGlassCard.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { StainedGlassTheme, StainedGlassStyles } from '../styles/globalStyles';

interface StainedGlassCardProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'extraLight';
  showAccents?: boolean;
  showLogoAccents?: boolean;
}

export const StainedGlassCard: React.FC<StainedGlassCardProps> = ({
  children,
  style,
  intensity = StainedGlassTheme.glass.intensity,
  tint = StainedGlassTheme.glass.tint,
  showAccents = false,
  showLogoAccents = false,
  ...props
}) => {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        StainedGlassStyles.stainedGlassCard,
        {
          backgroundColor: StainedGlassTheme.colors.deepPurple,
          borderColor: StainedGlassTheme.colors.goldDark,
        },
        style,
      ]}
      {...props}
    >
      {/* Decorative glass accents */}
      {showAccents && (
        <View style={StainedGlassStyles.glassOverlayContainer}>
          {/* Top-left accent */}
          <View style={[
            StainedGlassStyles.glassAccent,
            {
              top: -20,
              left: -20,
              backgroundColor: StainedGlassTheme.colors.amethyst,
              width: 100,
              height: 100,
              borderRadius: 50,
            }
          ]} />

          {/* Bottom-right accent */}
          <View style={[
            StainedGlassStyles.glassAccent,
            {
              bottom: -30,
              right: -30,
              backgroundColor: StainedGlassTheme.colors.sapphire,
              width: 120,
              height: 120,
              borderRadius: 60,
            }
          ]} />

          {/* Center accent */}
          <View style={[
            StainedGlassStyles.glassAccent,
            {
              top: '40%',
              left: '30%',
              backgroundColor: StainedGlassTheme.colors.ruby,
              width: 80,
              height: 80,
              borderRadius: 40,
            }
          ]} />

          {/* Special logo area accents (optional) */}
          {showLogoAccents && (
            <>
              {/* Logo left accent */}
              <View style={[
                StainedGlassStyles.glassAccent,
                {
                  top: '15%',
                  left: '10%',
                  backgroundColor: 'rgba(255, 223, 186, 0.2)',
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                }
              ]} />

              {/* Logo right accent */}
              <View style={[
                StainedGlassStyles.glassAccent,
                {
                  top: '15%',
                  right: '10%',
                  backgroundColor: 'rgba(67, 97, 238, 0.2)',
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                }
              ]} />
            </>
          )}
        </View>
      )}

      {/* Content */}
      <View style={{ zIndex: 1 }}>
        {children}
      </View>
    </BlurView>
  );
};