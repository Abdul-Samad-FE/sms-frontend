import apiClient from './client';
import { MAX_PAGE_SIZE } from './pagination';

/**
 * @typedef {Object} PermissionRecord
 * @property {number} id
 * @property {string} permission_key
 * @property {string} display_name
 * @property {string} module
 * @property {string|null} [sub_module]
 * @property {string} action
 * @property {string|null} [description]
 */

/**
 * @typedef {Object} ModuleRecord
 * @property {number} id
 * @property {string} modules_name
 * @property {string} display_name
 * @property {string|null} [icon]
 * @property {string|null} [route]
 * @property {number} sort_order
 */

/**
 * @typedef {Object} RoleRecord
 * @property {number} id
 * @property {string} role_name
 * @property {string|null} [description]
 * @property {string} created_at
 * @property {PermissionRecord[]} permissions
 * @property {ModuleRecord[]} modules
 */

/**
 * @typedef {Object} RoleWritePayload
 * @property {string} [role_name]
 * @property {string|null} [description]
 * @property {number[]} [permission_ids]
 * @property {number[]} [module_ids]
 */

/**
 * One page of roles (with permissions + modules).
 * @param {{ page?: number, page_size?: number }} [params]
 * @returns {Promise<import('./pagination').Page<RoleRecord>>}
 */
export async function listRoles(params = {}) {
  const { data } = await apiClient.get('/admin/roles', { params });
  return data;
}

/** Every role (for role pickers). @returns {Promise<RoleRecord[]>} */
export async function listAllRoles() {
  const page = await listRoles({ page: 1, page_size: MAX_PAGE_SIZE });
  return page.items;
}

/**
 * One page of audit-log entries, newest first (school admins: own school).
 * @param {{ page?: number, page_size?: number, user_id?: number, action?: string, entity?: string }} [params]
 */
export async function listAuditLogs(params = {}) {
  const { data } = await apiClient.get('/admin/audit-logs', { params });
  return data;
}

/**
 * @param {number} id
 * @returns {Promise<RoleRecord>}
 */
export async function getRole(id) {
  const { data } = await apiClient.get(`/admin/roles/${id}`);
  return data;
}

/**
 * @param {RoleWritePayload & { role_name: string }} payload
 * @returns {Promise<RoleRecord>}
 */
export async function createRole(payload) {
  const { data } = await apiClient.post('/admin/roles', payload);
  return data;
}

/**
 * @param {number} id
 * @param {RoleWritePayload} payload
 * @returns {Promise<RoleRecord>}
 */
export async function updateRole(id, payload) {
  const { data } = await apiClient.put(`/admin/roles/${id}`, payload);
  return data;
}

/**
 * @param {number} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteRole(id) {
  const { data } = await apiClient.delete(`/admin/roles/${id}`);
  return data;
}

/** @returns {Promise<PermissionRecord[]>} */
export async function listPermissions() {
  const { data } = await apiClient.get('/admin/permissions');
  return data;
}

/** @returns {Promise<ModuleRecord[]>} */
export async function listModules() {
  const { data } = await apiClient.get('/admin/modules');
  return data;
}
