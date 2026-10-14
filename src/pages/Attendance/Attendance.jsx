import React, { useState } from 'react';
import { Alert, Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  useAttendanceOverview,
  useClassAttendanceList,
} from '../../hooks/useAttendance';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { usePagination } from '../../hooks/usePagination';
import {
  ActionButton,
  ContentCard,
  DataTable,
  MutedCell,
  PageContainer,
  PageHeader,
  PrimaryCell,
  TableActions,
  TextCell,
} from '../../components/ui';
import AttendanceDatePicker from './components/AttendanceDatePicker';
import { MarkingStatusTag } from './components/AttendanceStatusTag';
import { OverviewStats } from './components/AttendanceStats';
import useAttendanceDate from './useAttendanceDate';

const classLabel = (row) =>
  row.section ? `${row.class_name} - ${row.section}` : row.class_name;

/**
 * Attendance landing page — one row per class for the chosen day, showing
 * whether it has been marked and its present / absent / leave counts. From a
 * row the user opens the class's detail ("View") or marks the whole class.
 */
export default function Attendance() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canMark = hasPermission('attendance:create');

  const { date, dateStr, setDate } = useAttendanceDate();
  const [searchText, setSearchText] = useState('');
  const search = useDebouncedValue(searchText.trim(), 300);

  const paging = usePagination({ resetKeys: [dateStr, search] });
  const listQuery = useClassAttendanceList({
    ...paging.params,
    date: dateStr,
    search: search || undefined,
  });
  const overviewQuery = useAttendanceOverview({ date: dateStr });

  const rows = listQuery.data?.items ?? [];
  const dateQuery = `?date=${dateStr}`;

  const columns = [
    {
      title: 'Class',
      key: 'class',
      render: (_, row) => <PrimaryCell>{classLabel(row)}</PrimaryCell>,
    },
    {
      title: 'Class Teacher',
      dataIndex: 'class_teacher_name',
      key: 'class_teacher_name',
      render: (name) => <MutedCell>{name || 'Not assigned'}</MutedCell>,
    },
    {
      title: 'Students',
      dataIndex: 'total_students',
      key: 'total_students',
      align: 'right',
      render: (v) => <TextCell>{v}</TextCell>,
    },
    {
      title: 'Present',
      dataIndex: 'present',
      key: 'present',
      align: 'right',
      render: (v) => <TextCell>{v}</TextCell>,
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      key: 'absent',
      align: 'right',
      render: (v) => <TextCell>{v}</TextCell>,
    },
    {
      title: 'Leave',
      dataIndex: 'leave',
      key: 'leave',
      align: 'right',
      render: (v) => <TextCell>{v}</TextCell>,
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance_percentage',
      key: 'attendance_percentage',
      align: 'right',
      render: (v) => <TextCell>{v == null ? null : `${v}%`}</TextCell>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <span className="inline-flex items-center gap-2">
          <MarkingStatusTag status={status} />
          {status === 'Partial' && (
            <span className="ds-caption">{row.not_marked} left</span>
          )}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      fixed: 'right',
      render: (_, row) => (
        <TableActions>
          <ActionButton
            onClick={() => navigate(`/attendance/${row.class_id}${dateQuery}`)}
          >
            View
          </ActionButton>
          {canMark && (
            <ActionButton
              primary
              disabled={row.total_students === 0}
              tooltip={
                row.total_students === 0
                  ? 'This class has no enrolled students'
                  : undefined
              }
              onClick={() =>
                navigate(`/attendance/${row.class_id}/mark${dateQuery}`)
              }
            >
              {row.status === 'Not marked'
                ? 'Mark Attendance'
                : 'Edit Attendance'}
            </ActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Attendance"
        subtitle="Class-wise daily attendance. Open a class to view details or mark the whole class at once."
        actions={<AttendanceDatePicker value={date} onChange={setDate} />}
      />

      {overviewQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title="Failed to load the attendance overview."
        />
      ) : (
        <OverviewStats
          overview={overviewQuery.data}
          loading={overviewQuery.isLoading}
        />
      )}

      <ContentCard
        title="Classes"
        subtitle={`Attendance for ${date.format('dddd, D MMMM YYYY')}`}
        extra={
          <Input.Search
            allowClear
            placeholder="Search class or section"
            aria-label="Search classes"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
        }
        flush
      >
        {listQuery.isError ? (
          <div className="p-5">
            <Alert
              type="error"
              showIcon
              title="Failed to load classes."
              description={listQuery.error?.response?.data?.detail}
              action={
                <Button size="small" danger onClick={() => listQuery.refetch()}>
                  Retry
                </Button>
              }
            />
          </div>
        ) : (
          <DataTable
            rowKey="class_id"
            columns={columns}
            dataSource={rows}
            loading={listQuery.isFetching}
            pagination={paging.tableProps(listQuery.data?.meta)}
            emptyText={
              search ? 'No classes match your search' : 'No classes yet'
            }
          />
        )}
      </ContentCard>
    </PageContainer>
  );
}
