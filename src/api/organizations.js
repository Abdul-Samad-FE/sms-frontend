import apiClient from './client';

/**
 * Organizations are the owner tier: one school owner (Super Admin) and the
 * schools they run. Managed by the Global Admin.
 *
 * @typedef {Object} OrganizationRecord
 * @property {number} id
 * @property {string} name
 * @property {boolean} is_active
 * @property {number} school_count
 * @property {number} student_count
 * @property {number} user_count
 * @property {number} owner_count
 * @property {string} created_at  ISO timestamp
 */

/**
 * @typedef {OrganizationRecord & {
 *   schools: Array<{ id: number, name: string, emis_code: string,
 *     is_active: boolean, deleted_at: string|null }>,
 *   owners: Array<{ id: number, name: string, email: string,
 *     is_active: boolean }>,
 * }} OrganizationDetail
 */

/**
 * @typedef {Object} OnboardPayload
 * @property {{ name: string }} organization
 * @property {{ name: string, email: string, password: string }} owner
 * @property {{ emis_code: string, name: string, uc_name: string,
 *   address?: string|null }} school
 * @property {{ name: string, email: string, password: string }|null} admin
 *   Optional separate school admin for the first school.
 */

/**
 * GET /organizations/ — one page plus the total.
 *
 * @param {{ page?: number, page_size?: number, search?: string,
 *   is_active?: boolean }} [params]
 * @returns {Promise<import('./pagination').Page<OrganizationRecord>>}
 */
export async function listOrganizations(params = {}) {
  const { data } = await apiClient.get('/organizations/', {
    params,
    skipActiveSchool: true,
  });
  return data;
}

/** @returns {Promise<OrganizationDetail>} */
export async function getOrganization(id) {
  const { data } = await apiClient.get(`/organizations/${id}`, {
    skipActiveSchool: true,
  });
  return data;
}

/**
 * Create organization + owner + first school (+ optional school admin) in
 * one transaction.
 *
 * @param {OnboardPayload} payload
 */
export async function onboardOrganization(payload) {
  const { data } = await apiClient.post('/organizations/onboard', payload);
  return data;
}

/** @param {number} id @param {{ name: string }} payload */
export async function updateOrganization(id, payload) {
  const { data } = await apiClient.put(`/organizations/${id}`, payload);
  return data;
}

/** Suspend (false) or reactivate (true) an organization. */
export async function setOrganizationStatus(id, isActive) {
  const { data } = await apiClient.patch(`/organizations/${id}/status`, {
    is_active: isActive,
  });
  return data;
}

/**
 * Add a co-owner (Super Admin) to an organization.
 * @param {number} id
 * @param {{ name: string, email: string, password: string }} payload
 */
export async function addOrganizationOwner(id, payload) {
  const { data } = await apiClient.post(`/organizations/${id}/owners`, payload);
  return data;
}
