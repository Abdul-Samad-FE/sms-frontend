import apiClient, { REFRESH_KEY } from './client';

// POST /auth/sign-in ->
//   { access_token, expiration, refresh_token, refresh_expiration, user_info }
export async function signIn({ email, password }) {
  const { data } = await apiClient.post('/auth/sign-in', { email, password });
  return data;
}

// GET /auth/me -> identity payload (requires a valid token)
export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

// POST /auth/change-password -> { message }
export async function changePassword({ oldPassword, newPassword }) {
  const { data } = await apiClient.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return data;
}

// POST /auth/sign-out -> revokes the access token and the refresh-token
// session. Best-effort; never throws.
export async function signOut() {
  try {
    await apiClient.post('/auth/sign-out', {
      refresh_token: localStorage.getItem(REFRESH_KEY),
    });
  } catch {
    // ignore — the client clears local state regardless
  }
}
