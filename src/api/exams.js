import apiClient from './client';
import { MAX_PAGE_SIZE } from './pagination';

/**
 * @typedef {'monthly'|'mid_term'|'final_term'|'annual'} ExamType
 */

/**
 * @typedef {Object} ExamRecord
 * @property {number} id
 * @property {number} school_id
 * @property {string} name
 * @property {ExamType} exam_type
 * @property {string|null} [academic_year]
 * @property {string|null} [start_date]
 * @property {string|null} [end_date]
 * @property {boolean} is_published
 * @property {string|null} [published_at]
 * @property {string} created_at
 */

/**
 * One page of exams, newest first.
 * @param {{ page?: number, page_size?: number, search?: string, exam_type?: string, is_published?: boolean }} [params]
 * @returns {Promise<import('./pagination').Page<ExamRecord>>}
 */
export async function listExams(params = {}) {
  const { data } = await apiClient.get('/exams/', { params });
  return data;
}

/** Every exam (for exam pickers), up to the API max. @returns {Promise<ExamRecord[]>} */
export async function listAllExams(params = {}) {
  const page = await listExams({
    ...params,
    page: 1,
    page_size: MAX_PAGE_SIZE,
  });
  return page.items;
}

export async function getExam(id) {
  const { data } = await apiClient.get(`/exams/${id}`);
  return data;
}

export async function createExam(payload) {
  const { data } = await apiClient.post('/exams/', payload);
  return data;
}

export async function updateExam(id, payload) {
  const { data } = await apiClient.put(`/exams/${id}`, payload);
  return data;
}

export async function deleteExam(id) {
  const { data } = await apiClient.delete(`/exams/${id}`);
  return data;
}

/** @param {number} examId @param {{ class_id?: number }} [params] */
export async function getExamSchedule(examId, params = {}) {
  const { data } = await apiClient.get(`/exams/${examId}/schedule`, { params });
  return data;
}

/** @param {number} examId @param {{ class_id: number, items: any[] }} payload */
export async function setExamSchedule(examId, payload) {
  const { data } = await apiClient.put(`/exams/${examId}/schedule`, payload);
  return data;
}
