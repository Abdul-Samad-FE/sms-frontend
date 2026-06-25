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
 * @typedef {Object} AttendanceBulkItem
 * @property {number} student_id
 * @property {AttendanceStatus} status
 * @property {string|null} [remarks]
 */

/**
 * @typedef {Object} AttendanceBulkPayload
 * @property {number} school_id
 * @property {string} date  ISO date (YYYY-MM-DD)
 * @property {AttendanceBulkItem[]} records
 */

/**
 * List attendance records (tenant-scoped server-side).
 *
 * @param {{ school_id?: number, student_id?: number, attendance_date?: string,
 *   skip?: number, limit?: number }} [params]
 * @returns {Promise<AttendanceRecord[]>}
 */
export async function listAttendance(params = {}) {
  const { data } = await apiClient.get('/attendance/', { params });
  return data;
}

/**
 * Mark/replace a whole day's attendance for many students in one call.
 *
 * @param {AttendanceBulkPayload} payload
 * @returns {Promise<{ date: string, processed: number, records: AttendanceRecord[] }>}
 */
export async function bulkUpsertAttendance(payload) {
  const { data } = await apiClient.post('/attendance/bulk', payload);
  return data;
}

/**
 * Update a single attendance record.
 *
 * @param {number} id
 * @param {Partial<Pick<AttendanceRecord, 'status'|'remarks'|'date'>>} payload
 * @returns {Promise<AttendanceRecord>}
 */
export async function updateAttendance(id, payload) {
  const { data } = await apiClient.put(`/attendance/${id}`, payload);
  return data;
}

/**
 * Delete a single attendance record.
 *
 * @param {number} id
 * @returns {Promise<{ message: string }>}
 */
export async function deleteAttendance(id) {
  const { data } = await apiClient.delete(`/attendance/${id}`);
  return data;
}
