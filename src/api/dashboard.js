import apiClient from './client';

/**
 * @typedef {Object} DashboardSchoolInfo
 * @property {number} id
 * @property {string} name
 * @property {string} emis_code
 * @property {string} uc_name
 * @property {string|null} [address]
 */

/**
 * @typedef {Object} RecentActivityItem
 * @property {number} id
 * @property {string} action
 * @property {string|null} [entity]
 * @property {number|null} [entity_id]
 * @property {number|null} [user_id]
 * @property {string|null} [user_name]
 * @property {string|null} [ip_address]
 * @property {string} created_at  ISO timestamp
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} total_students
 * @property {number} total_teachers
 * @property {number} total_classes
 * @property {number} today_present
 * @property {number} today_marked
 * @property {number} today_attendance_percentage
 * @property {RecentActivityItem[]} recent_activity
 * @property {DashboardSchoolInfo|null} school
 * @property {string} generated_at  ISO timestamp
 */

/**
 * Fetch aggregate dashboard statistics for the current tenant.
 *
 * Non-superusers are pinned server-side to their own school. Superadmins get a
 * global view, or a single school when `school_id` is supplied.
 *
 * @param {{ school_id?: number }} [params]
 * @returns {Promise<DashboardStats>}
 */
export async function getDashboardStats(params = {}) {
  const { data } = await apiClient.get('/dashboard/stats', { params });
  return data;
}
