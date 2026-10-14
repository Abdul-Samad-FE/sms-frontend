import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Segmented, notification } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  useClassRoster,
  useMarkClassAttendance,
} from '../../hooks/useAttendance';
import { CalendarIcon } from '../../components/Icons';
import {
  ContentCard,
  DataTable,
  MonoCell,
  PageContainer,
  PageHeader,
  PrimaryCell,
} from '../../components/ui';
import AttendanceDatePicker from './components/AttendanceDatePicker';
import { STATUS_OPTIONS } from './components/AttendanceStatusTag';
import { ClassStats } from './components/AttendanceStats';
import useAttendanceDate from './useAttendanceDate';

const DEFAULT_STATUS = 'present';

/** student_id -> { status, remarks }, prefilled from the saved records. */
const buildDraft = (students) =>
  Object.fromEntries(
    students.map((s) => [
      s.student_id,
      { status: s.status ?? DEFAULT_STATUS, remarks: s.remarks ?? '' },
    ])
  );

/**
 * Mark (or edit) one class's attendance for a day. Loads the class's whole
 * roster — a single data-entry form, so it is intentionally not paged —
 * prefilled with any saved statuses (unmarked students default to Present),
 * and saves everything in one atomic request.
 */
export default function MarkClassAttendance() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canMark = hasPermission('attendance:create');

  const { date, dateStr, setDate } = useAttendanceDate();
  const rosterQuery = useClassRoster(classId, dateStr);
  const markMutation = useMarkClassAttendance();

  const summary = rosterQuery.data?.summary;
  const students = useMemo(
    () => rosterQuery.data?.students?.items ?? [],
    [rosterQuery.data]
  );
  const [draft, setDraft] = useState({});

  // Start (again) from the server state whenever class, day or data change.
  useEffect(() => {
    setDraft(buildDraft(students));
  }, [students]);

  const setField = (studentId, field, value) =>
    setDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));

  const markAll = (status) =>
    setDraft((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, row]) => [id, { ...row, status }])
      )
    );

  // Live tallies of the draft, in the same shape as the server summary.
  const draftSummary = useMemo(() => {
    const tally = { present: 0, absent: 0, leave: 0 };
    for (const s of students) {
      const status = draft[s.student_id]?.status;
      if (tally[status] != null) tally[status] += 1;
    }
    const marked = tally.present + tally.absent + tally.leave;
    return {
      ...tally,
      total_students: students.length,
      marked_count: marked,
      not_marked: students.length - marked,
      attendance_percentage: marked
        ? Math.round((tally.present * 1000) / marked) / 10
        : null,
    };
  }, [students, draft]);

  const alreadyMarked = summary?.marked_count ?? 0;
  const backToList = () => navigate(`/attendance?date=${dateStr}`);
  const title = summary
    ? summary.section
      ? `${summary.class_name} - ${summary.section}`
      : summary.class_name
    : 'Mark Attendance';

  const handleSave = async () => {
    const records = students.map((s) => ({
      student_id: s.student_id,
      status: draft[s.student_id]?.status ?? DEFAULT_STATUS,
      remarks: draft[s.student_id]?.remarks?.trim() || null,
    }));
    try {
      const saved = await markMutation.mutateAsync({
        classId,
        date: dateStr,
        records,
      });
      notification.success({
        message: `Attendance saved for ${title}`,
        description: `${saved.present} present · ${saved.absent} absent · ${saved.leave} on leave (${date.format('D MMM YYYY')}).`,
      });
      backToList();
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
      title: 'Admission No',
      dataIndex: 'admission_number',
      key: 'admission_number',
      render: (v) => <MonoCell>{v}</MonoCell>,
    },
    {
      title: 'Student',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <PrimaryCell>{v}</PrimaryCell>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, row) => (
        <Segmented
          aria-label={`Attendance status for ${row.name}`}
          options={STATUS_OPTIONS}
          value={draft[row.student_id]?.status ?? DEFAULT_STATUS}
          onChange={(value) => setField(row.student_id, 'status', value)}
          disabled={!canMark}
        />
      ),
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (_, row) => (
        <Input
          aria-label={`Remarks for ${row.name}`}
          placeholder="Optional"
          value={draft[row.student_id]?.remarks ?? ''}
          onChange={(e) => setField(row.student_id, 'remarks', e.target.value)}
          disabled={!canMark}
          maxLength={255}
          allowClear
          className="min-w-[220px]"
        />
      ),
    },
  ];

  if (rosterQuery.isError) {
    return (
      <PageContainer>
        <PageHeader
          title="Mark Attendance"
          actions={<Button onClick={backToList}>← Back</Button>}
        />
        <Alert
          type="error"
          showIcon
          title={
            rosterQuery.error?.response?.status === 404
              ? 'Class not found.'
              : 'Failed to load the class roster.'
          }
          description={rosterQuery.error?.response?.data?.detail}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon={<CalendarIcon />}
        title={title}
        subtitle={
          summary
            ? `Mark attendance · Class teacher: ${summary.class_teacher_name || 'Not assigned'}`
            : 'Mark attendance'
        }
        actions={
          <>
            <AttendanceDatePicker value={date} onChange={setDate} />
            <Button onClick={backToList}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={markMutation.isPending}
              disabled={!canMark || students.length === 0}
            >
              Save Attendance
            </Button>
          </>
        }
      />

      {!canMark && (
        <Alert
          type="info"
          showIcon
          title="You can view this class but don't have permission to mark attendance."
        />
      )}
      {canMark && alreadyMarked > 0 && (
        <Alert
          type="warning"
          showIcon
          title={`${alreadyMarked} of ${students.length} student(s) already have attendance for ${date.format('D MMM YYYY')}. Saving updates their records.`}
        />
      )}

      <ClassStats summary={draftSummary} loading={rosterQuery.isLoading} />

      <ContentCard
        title="Students"
        subtitle={`${students.length} student(s) · ${date.format('dddd, D MMMM YYYY')}`}
        extra={
          canMark &&
          students.length > 0 && (
            <>
              <Button size="small" onClick={() => markAll('present')}>
                All Present
              </Button>
              <Button size="small" onClick={() => markAll('absent')}>
                All Absent
              </Button>
              <Button size="small" onClick={() => markAll('leave')}>
                All Leave
              </Button>
            </>
          )
        }
        flush
      >
        {/* Data-entry form for one class: every student on one screen. */}
        <DataTable
          rowKey="student_id"
          columns={columns}
          dataSource={students}
          loading={rosterQuery.isFetching}
          pagination={false}
          emptyText="No students enrolled in this class"
        />
      </ContentCard>
    </PageContainer>
  );
}
