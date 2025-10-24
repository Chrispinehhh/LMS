// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../lib/api';
import { getToken, setToken, removeToken } from '../lib/token';
import { BackendUser } from '../types';
import { AxiosError } from 'axios'; // Import AxiosError for robust error checking

// --- Types and Interfaces ---

interface AuthContextType {
  user: BackendUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Auth Provider Component ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    async function loadUserFromStorage() {
      const token = await getToken();
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Attempt to fetch current user data
          const { data } = await apiClient.get<BackendUser>('/users/me/');
          
          // Security Check: Ensure the user is a DRIVER
          if (data.role === 'DRIVER') {
            setUser(data);
          } else {
            // If token belongs to a non-driver, clear it
            await removeToken();
            delete apiClient.defaults.headers.common['Authorization'];
          }
        } catch (e) {
          // Token expired or invalid, clear it
          await removeToken();
        }
      }
      setIsLoading(false);
    }
    loadUserFromStorage();
  }, []);

  // Login Function
  const login = async (email: string, password: string) => {
    try {
      // 🔑 CRITICAL FIX: Use 'username' key for the email value.
      // This satisfies the default key expected by Django Simple JWT's serializer, 
      // even though the serializer uses the email field for lookup.
      const response = await apiClient.post<{ access: string }>('/auth/token/', {
        email: email, 
        password: password,
      });

      const { access: token } = response.data;
      
      await setToken(token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch user details immediately after successful token retrieval
      const { data } = await apiClient.get<BackendUser>('/users/me/');

      // Security Check: Only allow DRIVERs to log into the driver app
      if (data.role !== 'DRIVER') {
        await logout(); // Log them out immediately
        // Throw a specific error that LoginScreen can display
        throw new Error("Access Denied: Your account does not have driver privileges.");
      }
      setUser(data);

    } catch (error) {
      // 🚨 Robust Error Handling for 400/401 status codes
      if (error instanceof AxiosError) {
        // Attempt to extract the specific error message from the Django response body
        // Checks for: 1. detail (Simple JWT default), 2. non_field_errors (general serializer error), 3. generic fallback
        const errorMessage = error.response?.data?.detail || 
                             error.response?.data?.non_field_errors?.[0] || 
                             "Login failed. Please check credentials.";
        
        // Ensure tokens are cleared on any failed attempt
        await removeToken();
        delete apiClient.defaults.headers.common['Authorization'];
        
        // Re-throw the specific error for the LoginScreen to display
        throw new Error(errorMessage);

      } else {
        // Re-throw any other unexpected error
        throw error;
      }
    }
  };

  // Logout Function
  const logout = async () => {
    await removeToken();
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Custom Hook ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};