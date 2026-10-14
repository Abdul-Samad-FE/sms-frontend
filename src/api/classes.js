import apiClient from './client';

import { MAX_PAGE_SIZE } from './pagination';

/**
 * @typedef {Object} ClassRecord
 * @property {number} id
 * @property {number} school_id
 * @property {string} class_name
 * @property {string|null} [section]
 * @property {number|null} [class_teacher_id]
 * @property {string|null} [class_teacher_name]
 * @property {number} student_count
 * @property {number} male_count
 * @property {number} female_count
 * @property {string} created_at  ISO timestamp
 */

/**
 * One page of classes (tenant-scoped server-side).
 *
 * @param {{ page?: number, page_size?: number, search?: string, school_id?: number }} [params]
 * @returns {Promise<import('./pagination').Page<ClassRecord>>}
 */
export async function listClassesPage(params = {}) {
  const { data } = await apiClient.get('/classes/', { params });
  return data;
}

/**
 * Every class in scope (for pickers / filters), up to the API page cap.
 *
 * @param {{ school_id?: number, search?: string }} [params]
 * @returns {Promise<ClassRecord[]>}
 */
export async function listAllClasses(params = {}) {
  const page = await listClassesPage({
    ...params,
    page: 1,
    page_size: MAX_PAGE_SIZE,
  });
  return page.items;
}

/** @deprecated Use `listAllClasses` (pickers) or `listClassesPage` (tables). */
export const listClasses = listAllClasses;

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
 * @param {{ class_name: string, section?: string|null, school_id?: number, class_teacher_id?: number|null }} payload
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
 * @param {{ class_name?: string, section?: string|null, class_teacher_id?: number|null }} payload
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
