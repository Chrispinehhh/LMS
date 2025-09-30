// frontend/lib/token.ts
const LOCAL_STORAGE_KEY = 'logipro_auth_token';

export const getToken = (): string | null => {
  return localStorage.getItem(LOCAL_STORAGE_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};