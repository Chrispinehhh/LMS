// src/lib/api.ts
import axios from 'axios';

// CRITICAL: Replace with your computer's local network IP address.
// Your phone and computer MUST be on the same Wi-Fi network.
// Find this with 'ipconfig' (Windows) or 'ifconfig' (macOS/Linux).
const API_BASE_URL = 'https://lms-production-e985.up.railway.app/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;