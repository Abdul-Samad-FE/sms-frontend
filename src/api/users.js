import apiClient from './client';

/**
 * @typedef {Object} UserRecord
 * @property {number} id
 * @property {number|null} school_id
 * @property {string|null} [school_name]
 * @property {'global'|'super_admin'|'school'} [level]
 * @property {number|null} [organization_id]
 * @property {string|null} [organization_name]
 * @property {string} name
 * @property {string|null} [username]
 * @property {string} email
 * @property {number|null} [role_id]
 * @property {string|null} [role_name]
 * @property {boolean} is_active
 * @property {boolean} is_first_login
 * @property {string} created_at  ISO timestamp
 */

/**
 * @typedef {Object} UserWritePayload
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [username]
 * @property {string} [password]
 * @property {number|null} [school_id]
 * @property {number|null} [role_id]
 * @property {boolean} [is_active]
 * @property {'super_admin'|'school'} [level]   defaults to "school"
 * @property {number|null} [organization_id]   required for super_admin
 */

/**
 * GET /users/ — one page of users (tenant-scoped server-side) plus the total
 * match count.
 *
 * @param {{ page?: number, page_size?: number, search?: string,
 *   school_id?: number, role_id?: number, is_active?: boolean }} [params]
 *   `search` matches name, email or username; `page_size` max 1000.
 * @returns {Promise<import('./pagination').Page<UserRecord>>}
 */
export async function listUsers(params = {}) {
  const { data } = await apiClient.get('/users/', { params });
  return data;
}

/**
 * @param {number} id
 * @returns {Promise<UserRecord>}
 */
export async function getUser(id) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
}

/**
 * @param {UserWritePayload & { name: string, email: string, password: string }} payload
 * @returns {Promise<UserRecord>}
 */
export async function createUser(payload) {
  const { data } = await apiClient.post('/users/', payload);
  return data;
}

/**
 * @param {number} id
 * @param {UserWritePayload} payload
 * @returns {Promise<UserRecord>}
 */
export async function updateUser(id, payload) {
  const { data } = await apiClient.put(`/users/${id}`, payload);
  return data;
}

/**
 * @param {number} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteUser(id) {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
}
