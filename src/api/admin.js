import apiClient from './client';

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

/** @returns {Promise<RoleRecord[]>} */
export async function listRoles() {
  const { data } = await apiClient.get('/admin/roles');
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
