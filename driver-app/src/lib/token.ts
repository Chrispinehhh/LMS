// src/lib/token.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'logipro_driver_token';

// --- Web/Fallback Storage Implementation ---
// window.localStorage is used for web since SecureStore is not available.
const WebStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  deleteItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

/**
 * Retrieves the authentication token from storage.
 */
export const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // Use web fallback for getItem
      return WebStorage.getItem(TOKEN_KEY);
    } else {
      // Use SecureStore for native platforms
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error("Storage Error (getToken): Failed to get token.", error);
    return null;
  }
};

/**
 * Stores the authentication token in storage.
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Use web fallback for setItem
      WebStorage.setItem(TOKEN_KEY, token);
    } else {
      // Use SecureStore for native platforms
      // Consider adding 'keychainAccessible' options for production
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    console.error("Storage Error (setToken): Failed to set token.", error);
  }
};

/**
 * Removes the authentication token from storage.
 */
export const removeToken = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Use web fallback for deleteItem
      WebStorage.deleteItem(TOKEN_KEY);
    } else {
      // Use SecureStore for native platforms
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error("Storage Error (removeToken): Failed to remove token.", error);
  }
};