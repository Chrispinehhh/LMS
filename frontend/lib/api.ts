// frontend/lib/api.ts

import axios from 'axios';

// Create a new Axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// We will add an interceptor here later to automatically add the auth token
// to every request.

export default apiClient;