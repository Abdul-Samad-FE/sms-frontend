import React, { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Empty,
  Input,
  Modal,
  Popconfirm,
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
  useDeleteAttendance,
  useUpdateAttendance,
} from '../../../hooks/useAttendance';
import { EditIcon, Trash2Icon } from '../../../components/Icons';
import ExportCsvButton from '../../../components/ExportCsvButton';
import AttendanceStatusTag, { STATUS_OPTIONS } from './AttendanceStatusTag';
import AttendanceSummaryCards from './AttendanceSummaryCards';

const ATTENDANCE_CSV_COLUMNS = [
  { header: 'Date', key: 'date' },
  { header: 'Student', key: 'student_name' },
  { header: 'Admission No', key: 'admission_number' },
  { header: 'Class', key: 'class_name' },
  { header: 'Status', key: 'status' },
  { header: 'Remarks', key: 'remarks' },
];

/**
 * Attendance history browser: filter by class / date / student, then review,
 * edit, or delete individual records (subject to permissions).
 */
export default function AttendanceHistory() {
  const { user, hasPermission } = useAuth();
  const canUpdate = user?.is_superuser === true || hasPermission('attendance:update');
  const canDelete = user?.is_superuser === true || hasPermission('attendance:delete');

  const [classId, setClassId] = useState(null);
  const [date, setDate] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [editing, setEditing] = useState(null); // record being edited
  const [editStatus, setEditStatus] = useState('present');
  const [editRemarks, setEditRemarks] = useState('');

  const dateStr = date ? date.format('YYYY-MM-DD') : undefined;

  const { data: classes = [] } = useClasses();
  const { data: students = [] } = useStudents({
    class_id: classId ?? undefined,
    limit: 1000,
  });
  const attendanceQuery = useAttendanceList({
    attendance_date: dateStr,
    student_id: studentId ?? undefined,
    limit: 1000,
  });

  const updateMutation = useUpdateAttendance();
  const deleteMutation = useDeleteAttendance();

  const studentMap = useMemo(() => {
    const map = new Map();
    for (const s of students) map.set(s.id, s);
    return map;
  }, [students]);

  // Join records with student info; class filter is applied client-side
  // because the list endpoint filters by student/date only.
  const rows = useMemo(() => {
    const records = attendanceQuery.data ?? [];
    return records
      .map((rec) => {
        const student = studentMap.get(rec.student_id);
        return {
          ...rec,
          student_name: student?.name ?? `#${rec.student_id}`,
          admission_number: student?.admission_number ?? '—',
          class_name: student?.class_name ?? '—',
          class_id: student?.class_id ?? null,
          _known: !!student,
        };
      })
      .filter((row) => (classId == null ? true : row.class_id === classId))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [attendanceQuery.data, studentMap, classId]);

  const openEdit = (record) => {
    setEditing(record);
    setEditStatus(record.status);
    setEditRemarks(record.remarks ?? '');
  };

  const submitEdit = async () => {
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        payload: { status: editStatus, remarks: editRemarks.trim() || null },
      });
      notification.success({ message: 'Attendance updated.' });
      setEditing(null);
    } catch (err) {
      notification.error({
        message: 'Failed to update attendance',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({ message: 'Attendance record deleted.' });
    } catch (err) {
      notification.error({
        message: 'Failed to delete attendance',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const studentOptions = students.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => <span className="font-mono text-sm">{d}</span>,
    },
    { title: 'Student', dataIndex: 'student_name', key: 'student_name' },
    {
      title: 'Admission No',
      dataIndex: 'admission_number',
      key: 'admission_number',
      render: (v) => <span className="font-mono text-sm">{v}</span>,
    },
    { title: 'Class', dataIndex: 'class_name', key: 'class_name' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <AttendanceStatusTag status={status} />,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (v) => v || <span className="text-[var(--muted-foreground)]">—</span>,
    },
  ];

  if (canUpdate || canDelete) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {canUpdate && (
            <Button
              size="small"
              icon={<EditIcon className="w-4 h-4" />}
              onClick={() => openEdit(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Delete this attendance record?"
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button size="small" danger icon={<Trash2Icon className="w-4 h-4" />} />
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        <div className="flex items-center gap-2 bg-[var(--muted)] px-3 py-2 rounded-lg border border-[var(--border)]">
          <span className="text-sm text-[var(--muted-foreground)] font-medium">
            Class:
          </span>
          <Select
            value={classId}
            onChange={(v) => {
              setClassId(v);
              setStudentId(null); // student list narrows to the class
            }}
            allowClear
            placeholder="All classes"
            className="min-w-[150px]"
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
            onChange={setDate}
            format="YYYY-MM-DD"
            placeholder="Any date"
            variant="borderless"
          />
        </div>

        <div className="flex items-center gap-2 bg-[var(--muted)] px-3 py-2 rounded-lg border border-[var(--border)]">
          <span className="text-sm text-[var(--muted-foreground)] font-medium">
            Student:
          </span>
          <Select
            value={studentId}
            onChange={setStudentId}
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="All students"
            className="min-w-[170px]"
            variant="borderless"
            options={studentOptions}
          />
        </div>

        <ExportCsvButton
          filename="attendance-history"
          columns={ATTENDANCE_CSV_COLUMNS}
          rows={rows}
        />
      </div>

      {attendanceQuery.isError ? (
        <div className="px-2">
          <Alert
            type="error"
            showIcon
            message="Failed to load attendance history."
            action={
              <Button size="small" danger onClick={() => attendanceQuery.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <AttendanceSummaryCards records={rows} />

          <div className="px-2">
            <div className="card-glass p-0 overflow-hidden border-[var(--card-border)] shadow-sm">
              <Table
                columns={columns}
                dataSource={rows}
                rowKey="id"
                loading={attendanceQuery.isFetching}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: (
                    <Empty description="No attendance records for the selected filters." />
                  ),
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Edit modal */}
      <Modal
        title="Edit attendance"
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={submitEdit}
        okText="Save"
        confirmLoading={updateMutation.isPending}
        destroyOnHidden
      >
        {editing && (
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <p className="text-[var(--muted-foreground)] text-sm mb-1">
                {editing.student_name} · {editing.date}
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1">Status</label>
              <Segmented
                options={STATUS_OPTIONS}
                value={editStatus}
                onChange={setEditStatus}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Remarks</label>
              <Input.TextArea
                rows={2}
                maxLength={255}
                value={editRemarks}
                onChange={(e) => setEditRemarks(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
