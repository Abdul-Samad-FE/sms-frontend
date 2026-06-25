import axios from 'axios';

// Base URL of the SMS backend's versioned API. Override per-environment via
// VITE_API_BASE_URL in a .env file.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const TOKEN_KEY = 'sms_access_token';
export const USER_KEY = 'sms_user';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the bearer token (if any) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On an auth failure (missing / expired / revoked token) clear the session and
// bounce to the login page. A 403 caused by lacking a *permission* (while still
// authenticated) is NOT treated as a session failure, so we only force logout
// when the token is absent or the error clearly relates to the token itself.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const isTokenError =
      typeof detail === 'string' &&
      /token|authoriz|authenticat|credential/i.test(detail);
    const hasToken = !!localStorage.getItem(TOKEN_KEY);

    if (status === 401 || (status === 403 && (isTokenError || !hasToken))) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
