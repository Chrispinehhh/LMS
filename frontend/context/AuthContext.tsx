"use client"; // This is a client-side context

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from 'firebase/auth';
// FIX: Correcting import paths
import { getFirebaseAuth } from '../lib/firebase';
import apiClient from '../lib/api';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken } from '../lib/token';

// Define a type for our backend user data, including the new name fields.
interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

// Define the shape of the context's value
interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  backendUser: BackendUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  emailLogin: (email: string, password: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Type assertion to ensure Axios knows the expected return type
          const response = await apiClient.get<BackendUser>('/users/me/');
          setBackendUser(response.data);
        } catch (error) {
          console.error("Session rehydration failed:", error);
          removeToken();
          delete apiClient.defaults.headers.common['Authorization'];
          setBackendUser(null);
        }
      }

      const auth = getFirebaseAuth();
      const unsubscribe = auth ? onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        if (!user) {
          // Ensure local session is cleared if Firebase user state is lost
          removeToken();
          delete apiClient.defaults.headers.common['Authorization'];
          setBackendUser(null);
        }
      });

      setLoading(false);
      return () => unsubscribe();
    };

    initializeAuth();
    // Removed unused eslint-disable directive here
  }, []);

  const login = async () => { // Google Login (kept as 'login')
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase not initialized');
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        const firebaseToken = await result.user.getIdToken();
        const backendResponse = await apiClient.post('/auth/firebase/', { token: firebaseToken });
        const { access: accessToken, user: backendUserData } = backendResponse.data;

        setToken(accessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setBackendUser(backendUserData);

        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      const auth = getFirebaseAuth();
      if (auth) signOut(auth);
      removeToken();
      delete apiClient.defaults.headers.common['Authorization'];
      setBackendUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const emailLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Step 1: Sign in to Firebase with email and password
      const auth = getFirebaseAuth();
      if (!auth) throw new Error('Firebase not initialized');
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (result.user) {
        // Step 2: Get the Firebase ID token
        const firebaseToken = await result.user.getIdToken();

        // Step 3: Exchange the token with our backend
        const backendResponse = await apiClient.post('/auth/firebase/', { token: firebaseToken });
        const { access: accessToken, user: backendUserData } = backendResponse.data;

        // Step 4: Persist session and redirect
        setToken(accessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setBackendUser(backendUserData);
        router.push('/dashboard');
      }
    } catch (error) { // FIX: Removed ': any' here. The error is now implicitly 'unknown'.
      console.error("Error during email login:", error);
      // Ensure session is cleared on login failure
      const auth = getFirebaseAuth();
      if (auth) signOut(auth);
      removeToken();
      delete apiClient.defaults.headers.common['Authorization'];
      setBackendUser(null);
      // Let the component handle the error message by re-throwing it
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
    router.push('/login');
  };

  // 5. Add the new function to the context value
  const value = { firebaseUser, backendUser, loading, login, logout, emailLogin };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};