import apiClient from './client';

/**
 * @typedef {Object} SchoolRecord
 * @property {number} id
 * @property {string} emis_code
 * @property {string} name
 * @property {string} uc_name
 * @property {string|null} [address]
 * @property {string} created_at  ISO timestamp
 */

/**
 * List schools. Superadmins see all; school-bound users see only their own
 * (enforced server-side).
 *
 * @returns {Promise<SchoolRecord[]>}
 */
export async function listSchools() {
  const { data } = await apiClient.get('/schools/');
  return data;
}
