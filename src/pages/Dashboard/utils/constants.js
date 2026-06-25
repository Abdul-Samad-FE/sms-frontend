export const MOCK_ALERTS = [
  {
    id: 'AL-1001',
    title: 'High Absenteeism - Grade 10',
    priority_level: 'P1',
    category: 'Attendance',
    status: 'Active',
    priority_score: 95,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    details: 'Multiple students marked absent unexpectedly in Section A.',
  },
  {
    id: 'AL-1002',
    title: 'Fee Payment Overdue',
    priority_level: 'P2',
    category: 'Finance',
    status: 'Pending',
    priority_score: 82,
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    details: '24 students have pending fee clearances for the current term.',
  },
  {
    id: 'AL-1003',
    title: 'Teacher Substitution Needed',
    priority_level: 'P3',
    category: 'Scheduling',
    status: 'Active',
    priority_score: 65,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    details: 'Mr. Smith reported sick. Mathematics for Grade 9 needs substitute.',
  },
  {
    id: 'AL-1004',
    title: 'Library System Sync Delay',
    priority_level: 'P4',
    category: 'IT System',
    status: 'In Progress',
    priority_score: 35,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    details: 'Nightly book checkout sync is running behind schedule.',
  },
  {
    id: 'AL-1005',
    title: 'Disciplinary Action Review',
    priority_level: 'P2',
    category: 'Admin',
    status: 'Pending',
    priority_score: 78,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    details: 'Student behavior report pending review by the principal.',
  }
];

export const MOCK_SUMMARY = {
  totalStudents: 1250,
  totalTeachers: 85,
  totalClasses: 42,
  avgAttendance: '94.5%',
};
