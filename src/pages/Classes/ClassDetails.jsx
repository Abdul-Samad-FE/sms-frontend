import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Descriptions, Empty, Skeleton, Table, Tag } from 'antd';
import { useClass } from '../../hooks/useClasses';
import { useStudents } from '../../hooks/useStudents';
import { LayersIcon, UsersIcon } from '../../components/Icons';

const STATUS_COLORS = { Active: 'green', 'Struck-off': 'red' };

/**
 * Class details — class metadata plus the roster of enrolled students.
 */
export default function ClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const id = Number(classId);

  const classQuery = useClass(id);
  const studentsQuery = useStudents({ class_id: id, limit: 1000 });

  const cls = classQuery.data;
  const students = studentsQuery.data ?? [];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Admission No',
      dataIndex: 'admission_number',
      key: 'admission_number',
      render: (v) => <span className="font-mono text-sm">{v}</span>,
    },
    { title: 'Gender', dataIndex: 'gender', key: 'gender' },
    { title: 'Father Name', dataIndex: 'father_name', key: 'father_name' },
    { title: 'Contact', dataIndex: 'father_contact', key: 'father_contact' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || 'default'} className="border-0">
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/classes')}>← Back</Button>
          <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <LayersIcon className="w-6 h-6 text-[var(--primary)]" />
            {cls
              ? cls.section
                ? `${cls.class_name} - ${cls.section}`
                : cls.class_name
              : 'Class Details'}
          </h1>
        </div>
      </div>

      {classQuery.isError ? (
        <div className="px-2">
          <Alert
            type="error"
            showIcon
            message="Class not found or failed to load."
            action={
              <Button size="small" onClick={() => navigate('/classes')}>
                Back to Classes
              </Button>
            }
          />
        </div>
      ) : classQuery.isLoading ? (
        <div className="px-2">
          <div className="card-glass">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        </div>
      ) : (
        <>
          {/* Info + count */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 px-2">
            <div className="xl:col-span-2 card-glass">
              <Descriptions column={{ xs: 1, sm: 2 }} size="small" colon>
                <Descriptions.Item label="Class Name">
                  {cls.class_name}
                </Descriptions.Item>
                <Descriptions.Item label="Section">
                  {cls.section || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Class ID">{cls.id}</Descriptions.Item>
                <Descriptions.Item label="Created">
                  {cls.created_at ? cls.created_at.slice(0, 10) : '—'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="card-glass flex items-center justify-between">
              <div>
                <p className="text-[var(--muted-foreground)] text-sm font-medium">
                  Enrolled Students
                </p>
                <h3 className="text-2xl font-bold mt-1 text-[var(--foreground)]">
                  {students.length}
                </h3>
              </div>
              <div
                className="p-3 rounded-full bg-[var(--muted)]"
                style={{ color: 'var(--primary)' }}
              >
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Roster */}
          <div className="px-2">
            <div className="card-glass p-0 overflow-hidden border-[var(--card-border)] shadow-sm">
              <div className="p-4 border-b border-[var(--border)] header-glass">
                <h3 className="text-lg font-semibold m-0 text-[var(--foreground)]">
                  Student Roster
                </h3>
              </div>
              <Table
                columns={columns}
                dataSource={students}
                rowKey="id"
                loading={studentsQuery.isFetching}
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: (
                    <Empty description="No students enrolled in this class." />
                  ),
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
