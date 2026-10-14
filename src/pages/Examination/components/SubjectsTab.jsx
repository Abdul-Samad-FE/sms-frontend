import React, { useState } from 'react';
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  notification,
} from 'antd';
import { useActiveSchool } from '../../../context/ActiveSchoolContext';
import { useAllClasses } from '../../../hooks/useClasses';
import {
  useAllSubjects,
  useAssignSubject,
  useAssignments,
  useAssignmentsPage,
  useCreateSubject,
  useDeleteSubject,
  useSubjectsPage,
  useUnassignSubject,
  useUpdateSubject,
} from '../../../hooks/useSubjects';
import { usePagination } from '../../../hooks/usePagination';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { listAllSubjects } from '../../../api/subjects';
import PermissionGuard from '../../../components/PermissionGuard';
import ExportCsvButton from '../../../components/ExportCsvButton';
import {
  ActionButton,
  ContentCard,
  DataTable,
  DeleteAction,
  TableActions,
  TableEmpty,
  renderMono,
  renderPrimary,
} from '../../../components/ui';
import { classLabel } from '../examConstants';

function SubjectFormModal({ open, onClose, editData, schoolId }) {
  const [form] = Form.useForm();
  const isEdit = !!editData;
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();

  React.useEffect(() => {
    if (!open) return;
    if (editData)
      form.setFieldsValue({ name: editData.name, code: editData.code });
    else form.resetFields();
  }, [open, editData, form]);

  const handleOk = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: editData.id,
          payload: { name: values.name.trim(), code: values.code.trim() },
        });
        notification.success({ message: 'Subject updated.' });
      } else {
        if (schoolId == null) {
          notification.error({
            message: 'A school context is required to create subjects.',
          });
          return;
        }
        await createMutation.mutateAsync({
          school_id: schoolId,
          name: values.name.trim(),
          code: values.code.trim(),
        });
        notification.success({ message: 'Subject created.' });
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
      title={isEdit ? 'Edit Subject' : 'Add Subject'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Subject Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. Mathematics" maxLength={150} />
        </Form.Item>
        <Form.Item
          name="code"
          label="Subject Code"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. MATH" maxLength={50} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function AssignmentPanel({ schoolId }) {
  const [classId, setClassId] = useState(null);
  const [form] = Form.useForm();
  const { data: classes = [] } = useAllClasses();
  const { data: subjects = [] } = useAllSubjects();
  // Full list: decides which subjects are still available to assign.
  const { data: assignments = [] } = useAssignments(classId);
  // Paged list: what the table shows.
  const paging = usePagination({ resetKeys: [classId] });
  const assignmentsPage = useAssignmentsPage({
    ...paging.params,
    class_id: classId ?? undefined,
  });
  const assignMutation = useAssignSubject();
  const unassignMutation = useUnassignSubject();

  const assignedIds = new Set(assignments.map((a) => a.subject_id));
  const available = subjects.filter((s) => !assignedIds.has(s.id));

  const handleAssign = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      await assignMutation.mutateAsync({
        school_id: schoolId,
        class_id: classId,
        subject_id: values.subject_id,
        default_total_marks: values.default_total_marks,
        default_pass_marks: values.default_pass_marks,
      });
      notification.success({ message: 'Subject assigned to class.' });
      form.resetFields(['subject_id']);
    } catch (err) {
      notification.error({
        message: 'Assign failed',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject_name',
      key: 'subject_name',
      render: renderPrimary,
    },
    {
      title: 'Code',
      dataIndex: 'subject_code',
      key: 'subject_code',
      render: renderMono,
    },
    {
      title: 'Total',
      dataIndex: 'default_total_marks',
      key: 'total',
      align: 'right',
      render: renderMono,
    },
    {
      title: 'Pass',
      dataIndex: 'default_pass_marks',
      key: 'pass',
      align: 'right',
      render: renderMono,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <PermissionGuard permission="exam:update">
          <TableActions>
            <DeleteAction
              label="Unassign"
              okText="Unassign"
              title="Remove this subject from the class?"
              description="Marks already entered are not affected."
              loading={
                unassignMutation.isPending &&
                unassignMutation.variables === record.id
              }
              onConfirm={() => unassignMutation.mutate(record.id)}
            />
          </TableActions>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <ContentCard
      title="Subject Assignment"
      subtitle="Choose which subjects each class studies, with default marks."
      flush
    >
      <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] px-5 py-4">
        <label className="flex flex-col gap-1.5">
          <span className="ds-label">Class</span>
          <Select
            value={classId}
            onChange={setClassId}
            placeholder="Select a class"
            className="w-full sm:w-[240px]"
            options={classes.map((c) => ({
              value: c.id,
              label: classLabel(c),
            }))}
          />
        </label>

        {classId != null && (
          <PermissionGuard permission="exam:update">
            <Form form={form} layout="vertical" requiredMark={false}>
              <div className="flex flex-wrap items-end gap-3">
                <Form.Item
                  name="subject_id"
                  label="Subject"
                  className="!mb-0"
                  rules={[{ required: true, message: 'Pick a subject' }]}
                >
                  <Select
                    placeholder="Select a subject"
                    className="min-w-[200px]"
                    options={available.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.code})`,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="default_total_marks"
                  label="Total marks"
                  initialValue={100}
                  className="!mb-0"
                >
                  <InputNumber min={1} className="!w-[120px]" />
                </Form.Item>
                <Form.Item
                  name="default_pass_marks"
                  label="Pass marks"
                  initialValue={33}
                  className="!mb-0"
                >
                  <InputNumber min={0} className="!w-[120px]" />
                </Form.Item>
                <Button
                  type="primary"
                  loading={assignMutation.isPending}
                  onClick={handleAssign}
                >
                  Assign
                </Button>
              </div>
            </Form>
          </PermissionGuard>
        )}
      </div>

      {classId == null ? (
        <TableEmpty text="Select a class to manage its subjects." />
      ) : (
        <DataTable
          columns={columns}
          dataSource={assignmentsPage.data?.items ?? []}
          loading={assignmentsPage.isFetching}
          pagination={paging.tableProps(assignmentsPage.data?.meta)}
          emptyText="No subjects assigned yet."
        />
      )}
    </ContentCard>
  );
}

export default function SubjectsTab() {
  // Writes go to the active school (top-bar switcher).
  const { activeSchoolId: schoolId } = useActiveSchool();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const paging = usePagination({ resetKeys: [debouncedSearch] });
  const subjectsQuery = useSubjectsPage({
    ...paging.params,
    search: debouncedSearch || undefined,
  });
  const deleteMutation = useDeleteSubject();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const subjects = subjectsQuery.data?.items ?? [];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: renderPrimary },
    { title: 'Code', dataIndex: 'code', key: 'code', render: renderMono },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <TableActions>
          <PermissionGuard permission="exam:update">
            <ActionButton
              onClick={() => {
                setEditing(record);
                setModalOpen(true);
              }}
            >
              Edit
            </ActionButton>
          </PermissionGuard>
          <PermissionGuard permission="exam:delete">
            <DeleteAction
              title="Delete this subject?"
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
  ];

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
      <ContentCard
        title="Subjects"
        subtitle="The school's subject catalogue."
        extra={
          <>
            <Input.Search
              allowClear
              placeholder="Search name or code"
              aria-label="Search subjects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!w-[200px]"
            />
            <ExportCsvButton
              filename="subjects"
              columns={[
                { header: 'Name', key: 'name' },
                { header: 'Code', key: 'code' },
              ]}
              rows={subjects}
              fetchRows={() =>
                listAllSubjects({ search: debouncedSearch || undefined })
              }
            />
            <PermissionGuard permission="exam:create">
              <Button
                type="primary"
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                + Add Subject
              </Button>
            </PermissionGuard>
          </>
        }
        flush
      >
        {subjectsQuery.isError ? (
          <div className="p-5">
            <Alert type="error" showIcon title="Failed to load subjects." />
          </div>
        ) : (
          <DataTable
            columns={columns}
            dataSource={subjects}
            loading={subjectsQuery.isFetching}
            pagination={paging.tableProps(subjectsQuery.data?.meta)}
            emptyText={
              debouncedSearch ? 'No matching subjects.' : 'No subjects yet.'
            }
          />
        )}
      </ContentCard>

      <AssignmentPanel schoolId={schoolId} />

      <SubjectFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        editData={editing}
        schoolId={schoolId}
      />
    </div>
  );
}
