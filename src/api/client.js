import axios from 'axios';

// Base URL of the SMS backend's versioned API. Override per-environment via
// VITE_API_BASE_URL in a .env file.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const TOKEN_KEY = 'sms_access_token';
export const REFRESH_KEY = 'sms_refresh_token';
export const USER_KEY = 'sms_user';

/** Fired on window whenever the stored session changes (detail = user|null). */
export const SESSION_EVENT = 'sms:session';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Persist a sign-in / refresh response (`{access_token, refresh_token, user_info}`). */
export function storeSession(data) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
  if (data.user_info) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user_info));
    window.dispatchEvent(
      new CustomEvent(SESSION_EVENT, { detail: data.user_info })
    );
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACTIVE_SCHOOL_KEY);
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: null }));
}

function endSession() {
  clearSession();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

/** localStorage key of the active school chosen in the top-bar switcher. */
export const ACTIVE_SCHOOL_KEY = 'sms_active_school';

/** Header the backend reads to scope Super / Global Admin requests. */
const ACTIVE_SCHOOL_HEADER = 'X-School-Id';

/** Set (or clear with null) the school sent as `X-School-Id`. */
export function setActiveSchoolId(id) {
  if (id == null) localStorage.removeItem(ACTIVE_SCHOOL_KEY);
  else localStorage.setItem(ACTIVE_SCHOOL_KEY, String(id));
}

// Attach the bearer token and the active school (if any) to every request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // `skipActiveSchool: true` (axios config) opts out — used by pickers that
  // must list every accessible school, e.g. the switcher itself.
  const schoolId = localStorage.getItem(ACTIVE_SCHOOL_KEY);
  if (schoolId && !config.skipActiveSchool) {
    config.headers[ACTIVE_SCHOOL_HEADER] = schoolId;
  }
  return config;
});

// One refresh at a time: concurrent 401s all wait on the same promise, so a
// single-use refresh token is never presented twice (which the server would
// treat as token theft and revoke the whole session).
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    refreshPromise = (
      refreshToken
        ? axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
        : Promise.reject(new Error('No refresh token'))
    )
      .then(({ data }) => {
        storeSession(data);
        return data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Calls where a 401 means "bad credentials", not "access token expired".
const AUTH_CALLS = ['/auth/sign-in', '/auth/refresh', '/auth/sign-out'];

// 403s that mean the session itself is over (account or tenant disabled).
// Any other 403 is a plain permission denial and must NOT log the user out.
const SESSION_ENDING_403 =
  /account is inactive|inactive user|school has been deactivated|organization has been suspended|not assigned to a school/i;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const status = response?.status;
    const url = config?.url || '';
    const isAuthCall = AUTH_CALLS.some((path) => url.includes(path));

    // Expired / invalid access token: refresh once and replay the request.
    if (status === 401 && !isAuthCall && config && !config._retried) {
      try {
        const token = await refreshAccessToken();
        config._retried = true;
        config.headers.Authorization = `Bearer ${token}`;
        return apiClient(config);
      } catch {
        endSession();
        return Promise.reject(error);
      }
    }

    const detail = response?.data?.detail;
    if (
      (status === 401 && !isAuthCall) ||
      (status === 403 &&
        typeof detail === 'string' &&
        SESSION_ENDING_403.test(detail))
    ) {
      endSession();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
