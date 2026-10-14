import React, { useState } from 'react';
import { Alert, Button, Input, Select } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClassAttendance } from '../../hooks/useAttendance';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { usePagination } from '../../hooks/usePagination';
import { CalendarIcon } from '../../components/Icons';
import {
  ContentCard,
  DataTable,
  MonoCell,
  MutedCell,
  PageContainer,
  PageHeader,
  PrimaryCell,
  TextCell,
} from '../../components/ui';
import AttendanceDatePicker from './components/AttendanceDatePicker';
import AttendanceStatusTag, {
  MarkingStatusTag,
} from './components/AttendanceStatusTag';
import { ClassStats } from './components/AttendanceStats';
import useAttendanceDate from './useAttendanceDate';

const STATUS_FILTERS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'leave', label: 'Leave' },
  { value: 'not_marked', label: 'Not marked' },
];

/**
 * One class's attendance for a day: summary cards plus a server-paginated
 * list of its students and their status (students without a record show
 * "Not marked"). Read-only — marking happens on the class marking page.
 */
export default function ClassAttendanceView() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canMark = hasPermission('attendance:create');

  const { date, dateStr, setDate } = useAttendanceDate();
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState(undefined);
  const search = useDebouncedValue(searchText.trim(), 300);

  const paging = usePagination({ resetKeys: [dateStr, search, status] });
  const query = useClassAttendance(classId, {
    ...paging.params,
    date: dateStr,
    search: search || undefined,
    status,
  });

  const summary = query.data?.summary;
  const students = query.data?.students;
  const title = summary
    ? summary.section
      ? `${summary.class_name} - ${summary.section}`
      : summary.class_name
    : 'Class Attendance';

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
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (v) => <TextCell>{v}</TextCell>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <AttendanceStatusTag status={v} />,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (v) => <MutedCell>{v}</MutedCell>,
    },
  ];

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader
          title="Class Attendance"
          actions={
            <Button onClick={() => navigate(`/attendance?date=${dateStr}`)}>
              ← Back
            </Button>
          }
        />
        <Alert
          type="error"
          showIcon
          title={
            query.error?.response?.status === 404
              ? 'Class not found.'
              : 'Failed to load class attendance.'
          }
          description={query.error?.response?.data?.detail}
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
            ? `Class teacher: ${summary.class_teacher_name || 'Not assigned'} · ${date.format('dddd, D MMMM YYYY')}`
            : date.format('dddd, D MMMM YYYY')
        }
        actions={
          <>
            <AttendanceDatePicker value={date} onChange={setDate} />
            <Button onClick={() => navigate(`/attendance?date=${dateStr}`)}>
              ← Back
            </Button>
            {canMark && summary && summary.total_students > 0 && (
              <Button
                type="primary"
                onClick={() =>
                  navigate(`/attendance/${classId}/mark?date=${dateStr}`)
                }
              >
                {summary.status === 'Not marked'
                  ? 'Mark Attendance'
                  : 'Edit Attendance'}
              </Button>
            )}
          </>
        }
      />

      <ClassStats summary={summary} loading={query.isLoading} />

      <ContentCard
        title={
          <span className="inline-flex items-center gap-3">
            Students
            {summary && <MarkingStatusTag status={summary.status} />}
          </span>
        }
        subtitle={
          students ? `${students.meta.total} student(s)` : 'Loading students…'
        }
        extra={
          <>
            <Select
              allowClear
              placeholder="All statuses"
              aria-label="Filter by status"
              options={STATUS_FILTERS}
              value={status}
              onChange={setStatus}
              className="w-40"
            />
            <Input.Search
              allowClear
              placeholder="Search name or admission no"
              aria-label="Search students"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
          </>
        }
        flush
      >
        <DataTable
          rowKey="student_id"
          columns={columns}
          dataSource={students?.items ?? []}
          loading={query.isFetching}
          pagination={paging.tableProps(students?.meta)}
          emptyText={
            search || status
              ? 'No students match these filters'
              : 'No students enrolled in this class'
          }
        />
      </ContentCard>
    </PageContainer>
  );
}
