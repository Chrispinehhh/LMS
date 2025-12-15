// customer-portal/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import apiClient from '@/lib/api';
import { toast } from 'react-hot-toast';
import { getToken, setToken, removeToken } from '@/lib/token';
import { BackendUser } from '@/types';

// Define the shape of the context's value
interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  backendUser: BackendUser | null;
  loading: boolean;
  googleLogin: () => Promise<void>;
  emailLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for an existing token on initial load
      const token = getToken();
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Verify token by fetching user profile
          const response = await apiClient.get<BackendUser>('/users/me/');
          setBackendUser(response.data);
        } catch (error) {
          console.error("Session rehydration failed, logging out:", error);
          removeToken(); // Invalid token, so remove it
          delete apiClient.defaults.headers.common['Authorization'];
        }
      }

      // Listen for Firebase auth state changes
      const auth = getFirebaseAuth();
      const unsubscribe = auth ? onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        if (!user) {
          // If Firebase user is logged out, ensure our backend state is also cleared.
          removeToken();
          delete apiClient.defaults.headers.common['Authorization'];
          setBackendUser(null);
        }
      }) : () => { };

      setLoading(false);
      return () => unsubscribe();
    };

    initializeAuth();
  }, []);

  // Updated handler without automatic redirects
  const handleTokenExchange = async (firebaseToken: string) => {
    const backendResponse = await apiClient.post('/auth/firebase/', { token: firebaseToken });
    const { access: accessToken, user: backendUserData } = backendResponse.data;

    setToken(accessToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setBackendUser(backendUserData);

    // Show success message instead of redirecting
    toast.success(`Welcome back, ${backendUserData.first_name}!`);
  };

  // Login with Google
  const googleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase auth not initialized');
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const firebaseToken = await result.user.getIdToken();
        await handleTokenExchange(firebaseToken);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      toast.error("Google login failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with Email/Password
  const emailLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!auth) throw new Error('Firebase auth not initialized');
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        const firebaseToken = await result.user.getIdToken();
        await handleTokenExchange(firebaseToken);
      }
    } catch (error) {
      console.error("Error during email login:", error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const auth = getFirebaseAuth();
    if (auth) signOut(auth);
    removeToken();
    delete apiClient.defaults.headers.common['Authorization'];
    setBackendUser(null);
    toast.success("You have been logged out successfully.");
    // No redirect - user stays on current page
  };

  const value = { firebaseUser, backendUser, loading, googleLogin, emailLogin, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};