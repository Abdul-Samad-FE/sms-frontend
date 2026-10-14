import apiClient from './client';

/**
 * @typedef {Object} SchoolRecord
 * @property {number} id
 * @property {number} [organization_id]
 * @property {string|null} [organization_name]
 * @property {string} emis_code
 * @property {string} name
 * @property {string} uc_name
 * @property {string|null} [address]
 * @property {boolean} is_active      Tenant suspended when false
 * @property {string|null} deleted_at Archived (soft-deleted) when set
 * @property {string|null} created_at ISO timestamp
 * @property {string|null} updated_at ISO timestamp
 * @property {number} [student_count]
 * @property {number} [user_count]
 * @property {number} [class_count]
 */

/**
 * @typedef {Object} SchoolPage
 * @property {SchoolRecord[]} items
 * @property {{ total: number, page: number, page_size: number, pages: number }} meta
 */

/**
 * @typedef {Object} SchoolWritePayload
 * @property {string} [emis_code]
 * @property {string} [name]
 * @property {string} [uc_name]
 * @property {string|null} [address]
 */

/**
 * List schools. Superadmins see every tenant; school-bound users see only
 * their own (enforced server-side).
 *
 * @param {{
 *   page?: number,
 *   page_size?: number,
 *   search?: string,
 *   status?: 'active'|'inactive'|'all',
 *   include_archived?: boolean,
 * }} [params]
 * @returns {Promise<SchoolPage>}
 */
export async function listSchools(params = {}) {
  // The school directory is never narrowed by the active school.
  const { data } = await apiClient.get('/schools/', {
    params,
    skipActiveSchool: true,
  });
  return data;
}

/**
 * @param {number} id
 * @returns {Promise<SchoolRecord>}
 */
/**
 * Every school the user can access, for pickers and the school switcher.
 * Not narrowed by the active school (no `X-School-Id`).
 *
 * @param {{ organization_id?: number, status?: string }} [params]
 * @returns {Promise<Array<SchoolRecord>>}
 */
export async function listSchoolOptions(params = {}) {
  const { data } = await apiClient.get('/schools/', {
    params: { page_size: 1000, ...params },
    skipActiveSchool: true,
  });
  return data?.items ?? [];
}

export async function getSchool(id) {
  const { data } = await apiClient.get(`/schools/${id}`);
  return data;
}

/**
 * @param {SchoolWritePayload & { emis_code: string, name: string, uc_name: string }} payload
 * @returns {Promise<SchoolRecord>}
 */
export async function createSchool(payload) {
  const { data } = await apiClient.post('/schools/', payload);
  return data;
}

/**
 * @param {number} id
 * @param {SchoolWritePayload} payload
 * @returns {Promise<SchoolRecord>}
 */
export async function updateSchool(id, payload) {
  const { data } = await apiClient.put(`/schools/${id}`, payload);
  return data;
}

/**
 * Activate or suspend a tenant. Suspending blocks sign-in for all of the
 * school's users and invalidates their live sessions.
 *
 * @param {number} id
 * @param {boolean} isActive
 * @param {string} [reason]
 * @returns {Promise<SchoolRecord>}
 */
export async function setSchoolStatus(id, isActive, reason) {
  const { data } = await apiClient.patch(`/schools/${id}/status`, {
    is_active: isActive,
    reason: reason ?? null,
  });
  return data;
}

/**
 * Archive (soft delete) a school. Reversible — no data is removed.
 *
 * @param {number} id
 * @returns {Promise<SchoolRecord>}
 */
export async function archiveSchool(id) {
  const { data } = await apiClient.delete(`/schools/${id}`);
  return data;
}

/**
 * @param {number} id
 * @returns {Promise<SchoolRecord>}
 */
export async function restoreSchool(id) {
  const { data } = await apiClient.post(`/schools/${id}/restore`);
  return data;
}

/**
 * Permanently delete an archived school and every record belonging to it.
 * Irreversible. `confirm` must exactly match the school's name.
 *
 * @param {number} id
 * @param {string} confirm
 * @returns {Promise<{ message: string, deleted: Record<string, unknown> }>}
 */
export async function purgeSchool(id, confirm) {
  const { data } = await apiClient.delete(`/schools/${id}/purge`, {
    params: { confirm },
  });
  return data;
}
