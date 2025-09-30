// frontend/context/AuthContext.tsx

"use client"; // This is a client-side context

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getToken, setToken, removeToken } from '@/lib/token';

// --- THIS IS THE FIX ---
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
          const response = await apiClient.get<BackendUser>('/users/me/');
          setBackendUser(response.data);
        } catch (error) {
          console.error("Session rehydration failed:", error);
          removeToken();
          delete apiClient.defaults.headers.common['Authorization'];
          setBackendUser(null);
        }
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        if (!user) {
          removeToken();
          delete apiClient.defaults.headers.common['Authorization'];
          setBackendUser(null);
        }
      });
      
      setLoading(false);
      return () => unsubscribe();
    };

    initializeAuth();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
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
      console.error("Error during login:", error);
      signOut(auth);
      removeToken();
      delete apiClient.defaults.headers.common['Authorization'];
      setBackendUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    signOut(auth);
    removeToken();
    delete apiClient.defaults.headers.common['Authorization'];
    setBackendUser(null);
    router.push('/login');
  };

  const value = { firebaseUser, backendUser, loading, login, logout };

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