import apiClient from './client';

/**
 * @typedef {Object} StudentListParams
 * @property {number} [page]       1-based page (default 1)
 * @property {number} [page_size]  Rows per page (default 20, max 1000)
 * @property {string} [search]     Name / admission no / father name / enroll no
 * @property {number} [school_id]  Superadmin only; ignored for school users
 * @property {number} [class_id]
 * @property {string} [status]     e.g. "Active", "Struck-off"
 */

/**
 * GET /students/ — one page of students plus the total match count.
 *
 * @param {StudentListParams} [params]
 * @returns {Promise<import('./pagination').Page<Object>>}
 */
export async function listStudents(params = {}) {
  const { data } = await apiClient.get('/students/', { params });
  return data;
}

// POST /students/add -> StudentRead
export async function createStudent(payload) {
  const { data } = await apiClient.post('/students/add', payload);
  return data;
}

// PUT /students/{id} -> StudentRead
export async function updateStudent(id, payload) {
  const { data } = await apiClient.put(`/students/${id}`, payload);
  return data;
}

// DELETE /students/{id}
export async function deleteStudent(id) {
  const { data } = await apiClient.delete(`/students/${id}`);
  return data;
}
