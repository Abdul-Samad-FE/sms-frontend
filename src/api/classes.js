import apiClient from './client';

// GET /classes/ -> ClassRead[]
export async function listClasses(params = {}) {
  const { data } = await apiClient.get('/classes/', { params });
  return data;
}

// POST /classes/ -> ClassRead
export async function createClass(payload) {
  const { data } = await apiClient.post('/classes/', payload);
  return data;
}
