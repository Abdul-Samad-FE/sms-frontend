import apiClient from './client';

/**
 * @typedef {Object} MarkRecord
 * @property {number} id
 * @property {number} exam_id
 * @property {number} student_id
 * @property {number} subject_id
 * @property {number} class_id
 * @property {number} total_marks
 * @property {number|null} obtained_marks
 * @property {boolean} is_absent
 * @property {string|null} [remarks]
 * @property {string|null} [subject_name]
 */

/**
 * @param {{ exam_id?: number, class_id?: number, subject_id?: number,
 *   student_id?: number }} [params]
 * @returns {Promise<MarkRecord[]>}
 */
export async function listMarks(params = {}) {
  const { data } = await apiClient.get('/marks/', { params });
  return data;
}

/**
 * @param {{ school_id: number, exam_id: number, class_id: number,
 *   records: Array<{ student_id: number, subject_id: number, total_marks: number,
 *   obtained_marks: number|null, is_absent: boolean, remarks?: string|null }> }} payload
 */
export async function bulkMarks(payload) {
  const { data } = await apiClient.post('/marks/bulk', payload);
  return data;
}

export async function updateMark(id, payload) {
  const { data } = await apiClient.put(`/marks/${id}`, payload);
  return data;
}
