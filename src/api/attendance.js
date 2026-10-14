import apiClient from './client';

/**
 * @typedef {'present'|'absent'|'leave'} AttendanceStatus
 */

/**
 * @typedef {Object} AttendanceRecord
 * @property {number} id
 * @property {number} school_id
 * @property {number} student_id
 * @property {string} date  ISO date (YYYY-MM-DD)
 * @property {AttendanceStatus} status
 * @property {string|null} [remarks]
 */

/**
 * @typedef {'Marked'|'Partial'|'Not marked'} MarkingStatus
 */

/**
 * One class's attendance position for a single day.
 *
 * @typedef {Object} ClassAttendanceSummary
 * @property {number} class_id
 * @property {number} school_id
 * @property {string} class_name
 * @property {string|null} section
 * @property {number|null} class_teacher_id
 * @property {string|null} class_teacher_name
 * @property {string} date               YYYY-MM-DD
 * @property {number} total_students     Enrolled (everyone except struck-off)
 * @property {number} marked_count
 * @property {number} present
 * @property {number} absent
 * @property {number} leave
 * @property {number} not_marked
 * @property {number|null} attendance_percentage  present / marked × 100
 * @property {MarkingStatus} status
 */

/**
 * Totals across every class in scope for one day.
 *
 * @typedef {Object} ClassAttendanceOverview
 * @property {string} date
 * @property {number} total_classes
 * @property {number} marked_classes
 * @property {number} partial_classes
 * @property {number} not_marked_classes
 * @property {number} total_students
 * @property {number} present
 * @property {number} absent
 * @property {number} leave
 * @property {number} not_marked
 * @property {number|null} attendance_percentage
 */

/**
 * A class's student with their status on the requested day.
 *
 * @typedef {Object} StudentAttendanceRow
 * @property {number} student_id
 * @property {string} admission_number
 * @property {string} name
 * @property {string|null} gender
 * @property {number|null} attendance_id
 * @property {AttendanceStatus|null} status  null = not marked yet
 * @property {string|null} remarks
 */

/**
 * @typedef {Object} ClassAttendanceDetail
 * @property {ClassAttendanceSummary} summary
 * @property {import('./pagination').Page<StudentAttendanceRow>} students
 */

/**
 * @typedef {Object} AttendanceMarkItem
 * @property {number} student_id
 * @property {AttendanceStatus} status
 * @property {string|null} [remarks]
 */

/**
 * @typedef {Object} AttendanceListParams
 * @property {number} [page]             1-based page (default 1)
 * @property {number} [page_size]        Rows per page (default 20, max 1000)
 * @property {number} [school_id]        Superadmin only
 * @property {number} [student_id]
 * @property {number} [class_id]         Student's current class
 * @property {string} [attendance_date]  Exact day, YYYY-MM-DD
 * @property {string} [date_from]        Inclusive, YYYY-MM-DD
 * @property {string} [date_to]          Inclusive, YYYY-MM-DD
 * @property {AttendanceStatus} [status]
 */

/**
 * GET /attendance/ — one page of raw records (newest date first).
 *
 * @param {AttendanceListParams} [params]
 * @returns {Promise<import('./pagination').Page<AttendanceRecord>>}
 */
export async function listAttendance(params = {}) {
  const { data } = await apiClient.get('/attendance/', { params });
  return data;
}

/**
 * GET /attendance/classes — one page of classes with each class's
 * attendance position on `date` (default today).
 *
 * @param {{ date?: string, search?: string, school_id?: number,
 *   page?: number, page_size?: number }} [params]
 * @returns {Promise<import('./pagination').Page<ClassAttendanceSummary>>}
 */
export async function listClassAttendance(params = {}) {
  const { data } = await apiClient.get('/attendance/classes', { params });
  return data;
}

/**
 * GET /attendance/classes/overview — totals across all classes for `date`.
 *
 * @param {{ date?: string, school_id?: number }} [params]
 * @returns {Promise<ClassAttendanceOverview>}
 */
export async function getAttendanceOverview(params = {}) {
  const { data } = await apiClient.get('/attendance/classes/overview', {
    params,
  });
  return data;
}

/**
 * GET /attendance/classes/{classId} — class summary + one page of its
 * students' statuses on `date`.
 *
 * @param {number|string} classId
 * @param {{ date?: string, search?: string,
 *   status?: AttendanceStatus|'not_marked', page?: number,
 *   page_size?: number }} [params]
 * @returns {Promise<ClassAttendanceDetail>}
 */
export async function getClassAttendance(classId, params = {}) {
  const { data } = await apiClient.get(`/attendance/classes/${classId}`, {
    params,
  });
  return data;
}

/**
 * PUT /attendance/classes/{classId}?date= — mark (or re-mark) the class for
 * one day in a single atomic submission. Every record must belong to an
 * enrolled student of that class.
 *
 * @param {number|string} classId
 * @param {string} date  YYYY-MM-DD
 * @param {AttendanceMarkItem[]} records
 * @returns {Promise<ClassAttendanceSummary>}
 */
export async function markClassAttendance(classId, date, records) {
  const { data } = await apiClient.put(
    `/attendance/classes/${classId}`,
    { records },
    { params: { date } }
  );
  return data;
}
