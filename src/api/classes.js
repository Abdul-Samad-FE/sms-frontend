import apiClient from './client';

/**
 * @typedef {Object} ClassRecord
 * @property {number} id
 * @property {number} school_id
 * @property {string} class_name
 * @property {string|null} [section]
 * @property {string} created_at  ISO timestamp
 */

/**
 * List classes (tenant-scoped server-side).
 *
 * @param {{ school_id?: number }} [params]
 * @returns {Promise<ClassRecord[]>}
 */
export async function listClasses(params = {}) {
  const { data } = await apiClient.get('/classes/', { params });
  return data;
}

/**
 * Fetch a single class.
 *
 * @param {number} id
 * @returns {Promise<ClassRecord>}
 */
export async function getClass(id) {
  const { data } = await apiClient.get(`/classes/${id}`);
  return data;
}

/**
 * Create a class.
 *
 * @param {{ class_name: string, section?: string|null, school_id?: number }} payload
 * @returns {Promise<ClassRecord>}
 */
export async function createClass(payload) {
  const { data } = await apiClient.post('/classes/', payload);
  return data;
}

/**
 * Update a class.
 *
 * @param {number} id
 * @param {{ class_name?: string, section?: string|null }} payload
 * @returns {Promise<ClassRecord>}
 */
export async function updateClass(id, payload) {
  const { data } = await apiClient.put(`/classes/${id}`, payload);
  return data;
}

/**
 * Delete a class.
 *
 * @param {number} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteClass(id) {
  const { data } = await apiClient.delete(`/classes/${id}`);
  return data;
}
