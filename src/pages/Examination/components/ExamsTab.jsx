import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  notification,
} from 'antd';
import { useActiveSchool } from '../../../context/ActiveSchoolContext';
import dayjs from 'dayjs';
import { useAllClasses } from '../../../hooks/useClasses';
import { useAssignments } from '../../../hooks/useSubjects';
import {
  useCreateExam,
  useDeleteExam,
  useExamSchedule,
  useExamsPage,
  useSetExamSchedule,
  useUpdateExam,
} from '../../../hooks/useExams';
import { usePagination } from '../../../hooks/usePagination';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import PermissionGuard from '../../../components/PermissionGuard';
import {
  ActionButton,
  ContentCard,
  DataTable,
  DeleteAction,
  MutedCell,
  PrimaryCell,
  StatusTag,
  TableActions,
  TableEmpty,
  renderPrimary,
  renderText,
} from '../../../components/ui';
import {
  EXAM_TYPE_LABELS,
  EXAM_TYPE_OPTIONS,
  classLabel,
} from '../examConstants';

const toDate = (v) => (v ? dayjs(v) : null);
const fmt = (d) => (d ? d.format('YYYY-MM-DD') : null);

function ExamFormModal({ open, onClose, editData, schoolId }) {
  const [form] = Form.useForm();
  const isEdit = !!editData;
  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();

  useEffect(() => {
    if (!open) return;
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        exam_type: editData.exam_type,
        academic_year: editData.academic_year ?? '',
        dates:
          editData.start_date || editData.end_date
            ? [toDate(editData.start_date), toDate(editData.end_date)]
            : null,
      });
    } else {
      form.resetFields();
    }
  }, [open, editData, form]);

  const handleOk = async () => {
    let v;
    try {
      v = await form.validateFields();
    } catch {
      return;
    }
    const [start, end] = v.dates || [];
    const base = {
      name: v.name.trim(),
      exam_type: v.exam_type,
      academic_year: v.academic_year?.trim() || null,
      start_date: fmt(start),
      end_date: fmt(end),
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editData.id, payload: base });
        notification.success({ message: 'Exam updated.' });
      } else {
        if (schoolId == null) {
          notification.error({
            message: 'A school context is required to create exams.',
          });
          return;
        }
        await createMutation.mutateAsync({ school_id: schoolId, ...base });
        notification.success({ message: 'Exam created.' });
      }
      onClose();
    } catch (err) {
      notification.error({
        message: 'Save failed',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Exam' : 'Add Exam'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Exam Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Mid Term 2026" maxLength={150} />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="exam_type"
              label="Exam Type"
              rules={[{ required: true }]}
            >
              <Select options={EXAM_TYPE_OPTIONS} placeholder="Select type" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="academic_year" label="Academic Year">
              <Input placeholder="e.g. 2026" maxLength={20} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="dates" label="Schedule (start – end)">
          <DatePicker.RangePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function ScheduleModal({ open, onClose, exam, schoolId }) {
  const [classId, setClassId] = useState(null);
  const [rows, setRows] = useState([]);
  const { data: classes = [] } = useAllClasses();
  const { data: assignments = [] } = useAssignments(classId);
  const { data: existing = [], isFetching } = useExamSchedule(
    exam?.id,
    classId,
    { enabled: open && exam?.id != null && classId != null }
  );
  const setScheduleMutation = useSetExamSchedule();

  // Build editable rows from assignments, pre-filled from any existing schedule.
  useEffect(() => {
    if (classId == null) {
      setRows([]);
      return;
    }
    const bySubject = new Map(existing.map((e) => [e.subject_id, e]));
    const next = assignments.map((a) => {
      const e = bySubject.get(a.subject_id);
      return {
        subject_id: a.subject_id,
        subject_name: a.subject_name,
        subject_code: a.subject_code,
        exam_date: e?.exam_date ? dayjs(e.exam_date) : null,
        total_marks: e?.total_marks ?? a.default_total_marks,
        pass_marks: e?.pass_marks ?? a.default_pass_marks,
      };
    });
    setRows(next);
  }, [classId, assignments, existing]);

  const patchRow = (subjectId, key, value) =>
    setRows((prev) =>
      prev.map((r) => (r.subject_id === subjectId ? { ...r, [key]: value } : r))
    );

  const handleSave = async () => {
    try {
      await setScheduleMutation.mutateAsync({
        examId: exam.id,
        payload: {
          class_id: classId,
          items: rows.map((r) => ({
            subject_id: r.subject_id,
            exam_date: fmt(r.exam_date),
            total_marks: r.total_marks,
            pass_marks: r.pass_marks,
          })),
        },
      });
      notification.success({ message: 'Datesheet saved.' });
    } catch (err) {
      notification.error({
        message: 'Save failed',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const columns = [
    {
      title: 'Subject',
      key: 'subject',
      render: (_, r) => (
        <PrimaryCell secondary={r.subject_code}>{r.subject_name}</PrimaryCell>
      ),
    },
    {
      title: 'Exam Date',
      key: 'date',
      render: (_, r) => (
        <DatePicker
          value={r.exam_date}
          onChange={(d) => patchRow(r.subject_id, 'exam_date', d)}
          format="YYYY-MM-DD"
        />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, r) => (
        <InputNumber
          min={1}
          value={r.total_marks}
          onChange={(v) => patchRow(r.subject_id, 'total_marks', v)}
        />
      ),
    },
    {
      title: 'Pass',
      key: 'pass',
      render: (_, r) => (
        <InputNumber
          min={0}
          value={r.pass_marks}
          onChange={(v) => patchRow(r.subject_id, 'pass_marks', v)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={`Datesheet — ${exam?.name ?? ''}`}
      open={open}
      onCancel={onClose}
      width={720}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <PermissionGuard key="save" permission="exam:update">
          <Button
            type="primary"
            disabled={classId == null || rows.length === 0}
            loading={setScheduleMutation.isPending}
            onClick={handleSave}
          >
            Save Datesheet
          </Button>
        </PermissionGuard>,
      ]}
      destroyOnHidden
    >
      <label className="mb-5 flex flex-col gap-1.5">
        <span className="ds-label">Class</span>
        <Select
          value={classId}
          onChange={setClassId}
          placeholder="Select a class"
          className="w-full sm:w-[240px]"
          options={classes.map((c) => ({ value: c.id, label: classLabel(c) }))}
        />
      </label>
      {classId == null ? (
        <TableEmpty text="Select a class to build its datesheet." />
      ) : rows.length === 0 ? (
        <Alert
          type="info"
          showIcon
          title="No subjects assigned to this class. Assign subjects in the Subjects tab first."
        />
      ) : (
        // Data-entry grid (one row per assigned subject) — intentionally not
        // paginated: the whole date sheet is edited and saved in one go.
        <DataTable
          framed
          columns={columns}
          dataSource={rows}
          rowKey="subject_id"
          loading={isFetching}
          pagination={false}
          size="middle"
        />
      )}
    </Modal>
  );
}

export default function ExamsTab() {
  // Writes go to the active school (top-bar switcher).
  const { activeSchoolId: schoolId } = useActiveSchool();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const paging = usePagination({ resetKeys: [debouncedSearch] });
  const examsQuery = useExamsPage({
    ...paging.params,
    search: debouncedSearch || undefined,
  });
  const deleteMutation = useDeleteExam();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [scheduleExam, setScheduleExam] = useState(null);

  const exams = examsQuery.data?.items ?? [];

  const columns = useMemo(
    () => [
      { title: 'Name', dataIndex: 'name', key: 'name', render: renderPrimary },
      {
        title: 'Type',
        dataIndex: 'exam_type',
        key: 'exam_type',
        render: (t) => (
          <StatusTag tone="primary">{EXAM_TYPE_LABELS[t] || t}</StatusTag>
        ),
      },
      {
        title: 'Year',
        dataIndex: 'academic_year',
        key: 'year',
        render: renderText,
      },
      {
        title: 'Dates',
        key: 'dates',
        render: (_, r) => (
          <MutedCell>
            {r.start_date
              ? `${r.start_date}${r.end_date ? ` → ${r.end_date}` : ''}`
              : null}
          </MutedCell>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'is_published',
        key: 'is_published',
        render: (p) =>
          p ? (
            <StatusTag tone="success">Published</StatusTag>
          ) : (
            <StatusTag tone="neutral">Draft</StatusTag>
          ),
      },
      {
        title: 'Actions',
        key: 'actions',
        align: 'right',
        render: (_, record) => (
          <TableActions>
            <ActionButton onClick={() => setScheduleExam(record)}>
              Date Sheet
            </ActionButton>
            <PermissionGuard permission="exam:update">
              <ActionButton
                onClick={() => {
                  setEditing(record);
                  setFormOpen(true);
                }}
              >
                Edit
              </ActionButton>
            </PermissionGuard>
            <PermissionGuard permission="exam:delete">
              <DeleteAction
                title="Delete this exam?"
                description="Marks and results for this exam will also be removed."
                loading={
                  deleteMutation.isPending &&
                  deleteMutation.variables === record.id
                }
                onConfirm={() => deleteMutation.mutate(record.id)}
              />
            </PermissionGuard>
          </TableActions>
        ),
      },
    ],
    [deleteMutation]
  );

  return (
    <div className="flex flex-col gap-6">
      <ContentCard
        title="Exams"
        subtitle="Create exams and build a date sheet for each class."
        extra={
          <>
            <Input.Search
              allowClear
              placeholder="Search exams"
              aria-label="Search exams"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!w-[220px]"
            />
            <PermissionGuard permission="exam:create">
              <Button
                type="primary"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                + Add Exam
              </Button>
            </PermissionGuard>
          </>
        }
        flush
      >
        {examsQuery.isError ? (
          <div className="p-5">
            <Alert type="error" showIcon title="Failed to load exams." />
          </div>
        ) : (
          <DataTable
            columns={columns}
            dataSource={exams}
            loading={examsQuery.isFetching}
            pagination={paging.tableProps(examsQuery.data?.meta)}
            emptyText={debouncedSearch ? 'No matching exams.' : 'No exams yet.'}
          />
        )}
      </ContentCard>

      <ExamFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editData={editing}
        schoolId={schoolId}
      />
      <ScheduleModal
        open={!!scheduleExam}
        onClose={() => setScheduleExam(null)}
        exam={scheduleExam}
        schoolId={schoolId}
      />
    </div>
  );
}
