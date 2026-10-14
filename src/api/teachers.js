import apiClient from './client';
import { MAX_PAGE_SIZE } from './pagination';

/**
 * @typedef {Object} TeacherRecord
 * @property {number} id
 * @property {number} school_id
 * @property {string|null} [employee_code]
 * @property {string} name
 * @property {'Male'|'Female'|null} [gender]
 * @property {string|null} [email]
 * @property {string|null} [phone]
 * @property {string|null} [cnic]
 * @property {string|null} [qualification]
 * @property {string|null} [specialization]
 * @property {string|null} [joining_date]  YYYY-MM-DD
 * @property {'Active'|'Inactive'|'On Leave'} status
 * @property {string|null} [address]
 * @property {number|null} [user_id]   linked login account
 * @property {boolean} has_login
 * @property {string[]} class_names    classes they are class teacher of
 * @property {string} created_at
 */

/**
 * @typedef {Object} TeacherSummary
 * @property {number} total
 * @property {number} active
 * @property {number} male
 * @property {number} female
 * @property {number} with_login
 */

/**
 * One page of teachers (tenant-scoped server-side).
 *
 * @param {{ page?: number, page_size?: number, search?: string,
 *   status?: string, gender?: string, school_id?: number }} [params]
 * @returns {Promise<import('./pagination').Page<TeacherRecord>>}
 */
export async function listTeachers(params = {}) {
  const { data } = await apiClient.get('/teachers/', { params });
  return data;
}

/**
 * Every teacher in scope (pickers / CSV export), up to the API page cap.
 *
 * @param {{ search?: string, status?: string, school_id?: number }} [params]
 * @returns {Promise<TeacherRecord[]>}
 */
export async function listAllTeachers(params = {}) {
  const page = await listTeachers({
    ...params,
    page: 1,
    page_size: MAX_PAGE_SIZE,
  });
  return page.items;
}

/** @returns {Promise<TeacherSummary>} */
export async function getTeacherSummary(params = {}) {
  const { data } = await apiClient.get('/teachers/summary', { params });
  return data;
}

/** @param {number} id @returns {Promise<TeacherRecord>} */
export async function getTeacher(id) {
  const { data } = await apiClient.get(`/teachers/${id}`);
  return data;
}

/**
 * Create a teacher; pass `create_login: true` + `password` to also create
 * their sign-in account (they must change the password on first login).
 *
 * @param {Partial<TeacherRecord> & { create_login?: boolean, password?: string }} payload
 * @returns {Promise<TeacherRecord>}
 */
export async function createTeacher(payload) {
  const { data } = await apiClient.post('/teachers/', payload);
  return data;
}

/**
 * @param {number} id
 * @param {Partial<TeacherRecord>} payload
 * @returns {Promise<TeacherRecord>}
 */
export async function updateTeacher(id, payload) {
  const { data } = await apiClient.put(`/teachers/${id}`, payload);
  return data;
}

/**
 * Create a sign-in account for an existing teacher.
 *
 * @param {number} id
 * @param {string} password
 * @returns {Promise<TeacherRecord>}
 */
export async function createTeacherLogin(id, password) {
  const { data } = await apiClient.post(`/teachers/${id}/login`, { password });
  return data;
}

/** Delete a teacher (and their login account). @param {number} id */
export async function deleteTeacher(id) {
  const { data } = await apiClient.delete(`/teachers/${id}`);
  return data;
}
