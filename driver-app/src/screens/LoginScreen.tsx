// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    
    // 🚨 DEBUG: Log the input values before calling the login function
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Email:', email);
    console.log('Password Length:', password.length);
    console.log('---------------------');
    
    setIsLoading(true);
    try {
      await login(email, password);
      // Success handled by AuthContext state change
    } catch (error) {
      // NOTE: The updated AuthContext is throwing a clean Error object
      console.error("Login attempt failed:", error);
      
      // Use the specific message thrown from AuthContext
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>LogiPro Driver Portal</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <Button 
        title={isLoading ? "Signing In..." : "Sign In"} 
        onPress={handleLogin} 
        disabled={isLoading} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});