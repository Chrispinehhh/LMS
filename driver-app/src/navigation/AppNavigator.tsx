// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import JobsScreen from '../screens/JobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen'; // <-- 1. Import the new screen

// --- 2. UPDATE THE PARAM LIST ---
// This defines all screens in our app and the parameters they expect.
export type RootStackParamList = {
  Login: undefined; // No parameters
  Jobs: undefined; // The list of jobs
  JobDetail: { jobId: string; shipmentId: string; }; // <-- Define the new screen and its params
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#1c1c1e',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {user ? (
          // --- 3. ADD THE NEW SCREEN TO THE LOGGED-IN STACK ---
          <>
            <Stack.Screen name="Jobs" component={JobsScreen} options={{ title: "My Assigned Jobs" }} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: "Job Details" }} />
          </>
        ) : (
          // Screen to show if the user is NOT logged in
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}