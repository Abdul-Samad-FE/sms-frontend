import apiClient from './client';
import { MAX_PAGE_SIZE } from './pagination';

/**
 * @typedef {Object} SubjectRecord
 * @property {number} id
 * @property {number} school_id
 * @property {string} name
 * @property {string} code
 * @property {string} created_at
 */

/**
 * One page of subjects (name order).
 * @param {{ page?: number, page_size?: number, search?: string, school_id?: number }} [params]
 * @returns {Promise<import('./pagination').Page<SubjectRecord>>}
 */
export async function listSubjects(params = {}) {
  const { data } = await apiClient.get('/subjects/', { params });
  return data;
}

/** Every subject (for pickers), up to the API max. @returns {Promise<SubjectRecord[]>} */
export async function listAllSubjects(params = {}) {
  const page = await listSubjects({
    ...params,
    page: 1,
    page_size: MAX_PAGE_SIZE,
  });
  return page.items;
}

/** @returns {Promise<SubjectRecord>} */
export async function createSubject(payload) {
  const { data } = await apiClient.post('/subjects/', payload);
  return data;
}

/** @returns {Promise<SubjectRecord>} */
export async function updateSubject(id, payload) {
  const { data } = await apiClient.put(`/subjects/${id}`, payload);
  return data;
}

export async function deleteSubject(id) {
  const { data } = await apiClient.delete(`/subjects/${id}`);
  return data;
}

/**
 * One page of class-subject assignments.
 * @param {{ page?: number, page_size?: number, class_id?: number }} [params]
 */
export async function listAssignments(params = {}) {
  const { data } = await apiClient.get('/subjects/assignments', { params });
  return data;
}

/** Every assignment for a class (date-sheet editor / marks entry). */
export async function listAllAssignments(params = {}) {
  const page = await listAssignments({
    ...params,
    page: 1,
    page_size: MAX_PAGE_SIZE,
  });
  return page.items;
}

export async function assignSubject(payload) {
  const { data } = await apiClient.post('/subjects/assignments', payload);
  return data;
}

export async function unassignSubject(assignmentId) {
  const { data } = await apiClient.delete(
    `/subjects/assignments/${assignmentId}`
  );
  return data;
}
