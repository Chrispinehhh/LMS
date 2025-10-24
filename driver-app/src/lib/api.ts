// src/lib/api.ts
import axios from 'axios';

// CRITICAL: Replace with your computer's local network IP address.
// Your phone and computer MUST be on the same Wi-Fi network.
// Find this with 'ipconfig' (Windows) or 'ifconfig' (macOS/Linux).
const API_BASE_URL = 'http://192.168.100.9:8001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;