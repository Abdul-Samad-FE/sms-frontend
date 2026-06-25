import apiClient from './client';

// POST /auth/sign-in -> { access_token, token_type, expiration, user_info }
export async function signIn({ email, password }) {
  const { data } = await apiClient.post('/auth/sign-in', { email, password });
  return data;
}

// GET /auth/me -> identity payload (requires a valid token)
export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

// POST /auth/sign-out -> revokes the current token. Best-effort; never throws.
export async function signOut() {
  try {
    await apiClient.post('/auth/sign-out');
  } catch {
    // ignore — the client clears local state regardless
  }
}
