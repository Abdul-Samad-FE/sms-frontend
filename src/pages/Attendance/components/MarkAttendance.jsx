import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Input,
  Segmented,
  Select,
  Space,
  Table,
  notification,
} from 'antd';
import dayjs from 'dayjs';
import { useAuth } from '../../../context/AuthContext';
import { useClasses } from '../../../hooks/useClasses';
import { useStudents } from '../../../hooks/useStudents';
import {
  useAttendanceList,
  useBulkUpsertAttendance,
} from '../../../hooks/useAttendance';
import { STATUS_OPTIONS } from './AttendanceStatusTag';
import AttendanceSummaryCards from './AttendanceSummaryCards';

const DEFAULT_STATUS = 'present';

/** Build the editable draft map (student_id -> {status, remarks}). */
const buildDraft = (students, existingByStudent) =>
  students.reduce((acc, student) => {
    const existing = existingByStudent.get(student.id);
    acc[student.id] = {
      status: existing?.status ?? DEFAULT_STATUS,
      remarks: existing?.remarks ?? '',
    };
    return acc;
  }, {});

/**
 * Daily attendance marking grid: pick a class + date, set each student's
 * status, then submit the whole day in one bulk call.
 */
export default function MarkAttendance() {
  const { user, hasPermission } = useAuth();
  const canMark = user?.is_superuser === true || hasPermission('attendance:create');

  const [classId, setClassId] = useState(null);
  const [date, setDate] = useState(() => dayjs());
  const [draft, setDraft] = useState({});

  const dateStr = date.format('YYYY-MM-DD');

  const { data: classes = [] } = useClasses();
  const studentsQuery = useStudents(
    { class_id: classId, limit: 1000 },
    { enabled: classId != null }
  );
  const attendanceQuery = useAttendanceList(
    { attendance_date: dateStr, limit: 1000 },
    { enabled: classId != null }
  );
  const bulkMutation = useBulkUpsertAttendance();

  const students = useMemo(
    () => studentsQuery.data ?? [],
    [studentsQuery.data]
  );

  const existingByStudent = useMemo(() => {
    const map = new Map();
    for (const rec of attendanceQuery.data ?? []) {
      map.set(rec.student_id, rec);
    }
    return map;
  }, [attendanceQuery.data]);

  // Reset the draft whenever the class, date, or loaded data changes.
  useEffect(() => {
    if (classId == null) {
      setDraft({});
      return;
    }
    if (studentsQuery.isSuccess && attendanceQuery.isSuccess) {
      setDraft(buildDraft(students, existingByStudent));
    }
  }, [
    classId,
    dateStr,
    students,
    existingByStudent,
    studentsQuery.isSuccess,
    attendanceQuery.isSuccess,
  ]);

  const setStatus = (studentId, status) =>
    setDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));

  const setRemarks = (studentId, remarks) =>
    setDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));

  const markAll = (status) =>
    setDraft((prev) => {
      const next = {};
      for (const id of Object.keys(prev)) {
        next[id] = { ...prev[id], status };
      }
      return next;
    });

  const existingCount = useMemo(
    () => students.filter((s) => existingByStudent.has(s.id)).length,
    [students, existingByStudent]
  );

  const draftRecords = useMemo(
    () => students.map((s) => ({ status: draft[s.id]?.status })),
    [students, draft]
  );

  const handleSubmit = async () => {
    if (!students.length) return;
    const schoolId = user?.is_superuser
      ? students[0]?.school_id
      : user?.school_id;
    if (schoolId == null) {
      notification.error({ message: 'Unable to determine the school to save against.' });
      return;
    }
    const records = students.map((s) => ({
      student_id: s.id,
      status: draft[s.id]?.status ?? DEFAULT_STATUS,
      remarks: draft[s.id]?.remarks?.trim() || null,
    }));
    try {
      const result = await bulkMutation.mutateAsync({
        school_id: schoolId,
        date: dateStr,
        records,
      });
      notification.success({
        message: `Attendance saved for ${result.processed} student(s) on ${dateStr}.`,
      });
    } catch (err) {
      notification.error({
        message: 'Failed to save attendance',
        description:
          err?.response?.data?.detail || err?.message || 'Please try again.',
      });
    }
  };

  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[var(--foreground)]">
            {record.name}
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)] font-mono">
            {record.admission_number}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 280,
      render: (_, record) => (
        <Segmented
          options={STATUS_OPTIONS}
          value={draft[record.id]?.status ?? DEFAULT_STATUS}
          onChange={(value) => setStatus(record.id, value)}
          disabled={!canMark}
        />
      ),
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (_, record) => (
        <Input
          placeholder="Optional"
          value={draft[record.id]?.remarks ?? ''}
          onChange={(e) => setRemarks(record.id, e.target.value)}
          disabled={!canMark}
          maxLength={255}
          allowClear
        />
      ),
    },
  ];

  const isBusy = studentsQuery.isFetching || attendanceQuery.isFetching;
  const loadError = studentsQuery.isError || attendanceQuery.isError;

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        <div className="flex items-center gap-2 bg-[var(--muted)] px-3 py-2 rounded-lg border border-[var(--border)]">
          <span className="text-sm text-[var(--muted-foreground)] font-medium">
            Class:
          </span>
          <Select
            value={classId}
            onChange={setClassId}
            placeholder="Select a class"
            className="min-w-[160px]"
            variant="borderless"
            options={classes.map((c) => ({
              value: c.id,
              label: c.section ? `${c.class_name} - ${c.section}` : c.class_name,
            }))}
          />
        </div>

        <div className="flex items-center gap-2 bg-[var(--muted)] px-3 py-2 rounded-lg border border-[var(--border)]">
          <span className="text-sm text-[var(--muted-foreground)] font-medium">
            Date:
          </span>
          <DatePicker
            value={date}
            onChange={(d) => setDate(d ?? dayjs())}
            allowClear={false}
            format="YYYY-MM-DD"
            disabledDate={(d) => d && d.isAfter(dayjs(), 'day')}
            variant="borderless"
          />
        </div>

        {canMark && classId != null && students.length > 0 && (
          <Space>
            <Button onClick={() => markAll('present')}>All Present</Button>
            <Button onClick={() => markAll('absent')}>All Absent</Button>
            <Button onClick={() => markAll('leave')}>All Leave</Button>
          </Space>
        )}
      </div>

      {!canMark && (
        <div className="px-2">
          <Alert
            type="info"
            showIcon
            message="You don't have permission to mark attendance (attendance:create). The grid is read-only."
          />
        </div>
      )}

      {classId == null ? (
        <div className="px-2 py-10">
          <Empty description="Select a class to begin marking attendance." />
        </div>
      ) : loadError ? (
        <div className="px-2">
          <Alert
            type="error"
            showIcon
            message="Failed to load students or existing attendance."
            action={
              <Button
                size="small"
                danger
                onClick={() => {
                  studentsQuery.refetch();
                  attendanceQuery.refetch();
                }}
              >
                Retry
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <AttendanceSummaryCards records={draftRecords} total={students.length} />

          {existingCount > 0 && (
            <div className="px-2">
              <Alert
                type="warning"
                showIcon
                message={`${existingCount} student(s) already have attendance for ${dateStr}. Saving will update those records.`}
              />
            </div>
          )}

          <div className="px-2">
            <div className="card-glass p-0 overflow-hidden border-[var(--card-border)] shadow-sm">
              <Table
                columns={columns}
                dataSource={students}
                rowKey="id"
                loading={isBusy}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: (
                    <Empty description="No students found in this class." />
                  ),
                }}
              />
            </div>
          </div>

          <div className="flex justify-end px-2">
            <Button
              type="primary"
              size="large"
              className="btn-primary border-0"
              disabled={!canMark || students.length === 0}
              loading={bulkMutation.isPending}
              onClick={handleSubmit}
            >
              Save Attendance
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
