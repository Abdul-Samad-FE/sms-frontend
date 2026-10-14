import apiClient from './client';

/**
 * @typedef {Object} ResultRecord
 * @property {number} id
 * @property {number} exam_id
 * @property {number} student_id
 * @property {number} class_id
 * @property {number} total_marks
 * @property {number} obtained_marks
 * @property {number} percentage
 * @property {string|null} grade
 * @property {'pass'|'fail'} status
 * @property {number|null} position
 * @property {string|null} remarks
 * @property {boolean} is_published
 * @property {string|null} [student_name]
 * @property {string|null} [admission_number]
 */

/** Compute & store results for an exam/class. */
export async function processResults(examId, classId) {
  const { data } = await apiClient.post('/results/process', null, {
    params: { exam_id: examId, class_id: classId },
  });
  return data;
}

/**
 * One page of results, ranked by position.
 * @param {{ exam_id: number, class_id?: number, published_only?: boolean, search?: string, page?: number, page_size?: number }} params
 * @returns {Promise<import('./pagination').Page<ResultRecord>>}
 */
export async function listResults(params) {
  const { data } = await apiClient.get('/results/', { params });
  return data;
}

/** Full DMC payload for one student in one exam. */
export async function getDMC(examId, studentId) {
  const { data } = await apiClient.get('/results/dmc', {
    params: { exam_id: examId, student_id: studentId },
  });
  return data;
}

export async function publishResults(examId, classId) {
  const { data } = await apiClient.post('/results/publish', null, {
    params: { exam_id: examId, ...(classId ? { class_id: classId } : {}) },
  });
  return data;
}

export async function unpublishResults(examId, classId) {
  const { data } = await apiClient.post('/results/unpublish', null, {
    params: { exam_id: examId, ...(classId ? { class_id: classId } : {}) },
  });
  return data;
}

// ---------- Reports ----------
export async function getClassPerformance(examId, classId) {
  const { data } = await apiClient.get('/results/reports/class-performance', {
    params: { exam_id: examId, class_id: classId },
  });
  return data;
}

export async function getSubjectPerformance(examId, classId) {
  const { data } = await apiClient.get('/results/reports/subject-performance', {
    params: { exam_id: examId, class_id: classId },
  });
  return data;
}

export async function getTopPerformers(examId, classId, limit = 10) {
  const { data } = await apiClient.get('/results/reports/top-performers', {
    params: { exam_id: examId, class_id: classId, limit },
  });
  return data;
}

/** One page of failed students. @param {{ page?: number, page_size?: number }} [params] */
export async function getFailedStudents(examId, classId, params = {}) {
  const { data } = await apiClient.get('/results/reports/failed-students', {
    params: { exam_id: examId, class_id: classId, ...params },
  });
  return data;
}
