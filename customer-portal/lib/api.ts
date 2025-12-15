// customer-portal/lib/api.ts
import axios from 'axios';

// We will read this from an environment variable later when we deploy.
// For local development, we hardcode the backend URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// NOTE: Unlike the admin app, this public client does not need
// an interceptor or default auth headers, as the tracking endpoint
// will be public.

export default apiClient;