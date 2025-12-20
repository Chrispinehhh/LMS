// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform
} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as NavigationBar from 'expo-navigation-bar';

import LoginScreen from '../screens/LoginScreen';
import JobsScreen from '../screens/JobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { StainedGlassTheme } from '../styles/globalStyles';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  JobDetail: { jobId: string; shipmentId: string; };
};

export type TabParamList = {
  Jobs: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function StainedGlassTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 0) }]}>
      <BlurView
        intensity={60}
        tint="dark"
        style={styles.tabBar}
      >
        <View style={styles.tabBarTopBorder} />

        <View style={styles.tabItemsContainer}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            let iconName = 'list';
            if (route.name === 'Jobs') iconName = isFocused ? 'briefcase' : 'briefcase-outline';
            else if (route.name === 'History') iconName = isFocused ? 'time' : 'time-outline';
            else if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                {isFocused && (
                  <View style={styles.activeIndicator}>
                    <View style={styles.activeGlow} />
                  </View>
                )}

                <View style={[
                  styles.iconContainer,
                  isFocused && styles.activeIconContainer
                ]}>
                  <Ionicons
                    name={iconName}
                    size={22}
                    color={isFocused ? StainedGlassTheme.colors.gold : StainedGlassTheme.colors.parchmentLight}
                  />
                </View>

                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.activeTabLabel
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

function MainTabNavigator() {
  return (
    <View style={styles.mainContainer}>
      <Tab.Navigator
        tabBar={props => <StainedGlassTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Jobs"
          component={JobsScreen}
          options={{
            title: 'Jobs',
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'History' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    </View>
  );
}

function MainStack() {
  const { user, isLoading } = useAuth();

  // Hide Android navigation bar
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      // @ts-ignore
      NavigationBar.setBehaviorAsync("sticky-immersive");
      NavigationBar.setPositionAsync("absolute");

      // Optional: Change navigation bar color
      NavigationBar.setBackgroundColorAsync(StainedGlassTheme.colors.deepPurple);
    }

    // Show immersive mode
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setBarStyle('light-content');

    return () => {
      // Restore navigation bar when component unmounts
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync("visible");
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={StainedGlassTheme.colors.gold} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: StainedGlassTheme.colors.gold,
          background: StainedGlassTheme.colors.deepPurple,
          card: StainedGlassTheme.colors.deepPurple,
          text: StainedGlassTheme.colors.parchment,
          border: StainedGlassTheme.colors.gold,
          notification: StainedGlassTheme.colors.ruby,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' }
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={{
                headerShown: false,
                title: "Job Details",
                headerBackTitle: "Back",
                presentation: 'card',
                animation: 'fade'
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animation: 'fade',
              contentStyle: { backgroundColor: StainedGlassTheme.colors.deepPurple }
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return <MainStack />;
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: StainedGlassTheme.colors.deepPurple,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: StainedGlassTheme.colors.deepPurple,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: StainedGlassTheme.colors.parchment,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'column',
    borderRadius: 0, // Changed to 0 for full width
    marginHorizontal: 0, // No margin for full width
    marginBottom: 0,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: StainedGlassTheme.colors.goldDark,
    backgroundColor: StainedGlassTheme.colors.deepPurple,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15,
    minHeight: 70,
  },
  tabBarTopBorder: {
    height: 1,
    backgroundColor: StainedGlassTheme.colors.gold,
    opacity: 0.3,
    marginHorizontal: 16,
    marginTop: 8,
  },
  tabItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -12,
    width: 60,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: StainedGlassTheme.colors.gold,
    shadowColor: StainedGlassTheme.colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  activeGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: StainedGlassTheme.colors.gold,
    opacity: 0.2,
    borderRadius: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 223, 186, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 223, 186, 0.1)',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 223, 186, 0.15)',
    borderColor: StainedGlassTheme.colors.goldMedium,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: StainedGlassTheme.colors.parchmentLight,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  activeTabLabel: {
    color: StainedGlassTheme.colors.gold,
    fontWeight: '700',
  },
});