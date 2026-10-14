import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Descriptions, Skeleton } from 'antd';
import { useClass } from '../../hooks/useClasses';
import { useStudents } from '../../hooks/useStudents';
import { usePagination } from '../../hooks/usePagination';
import { LayersIcon, UsersIcon } from '../../components/Icons';
import {
  PageContainer,
  PageHeader,
  ContentCard,
  DataTable,
  StatCard,
  StatusTag,
  renderPrimary,
  renderText,
  renderMuted,
  renderMono,
} from '../../components/ui';

/**
 * Class details — class metadata, class teacher, and the server-paginated
 * roster of enrolled students.
 */
export default function ClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const id = Number(classId);

  const classQuery = useClass(id);
  const paging = usePagination({ resetKeys: [id] });
  const studentsQuery = useStudents({ ...paging.params, class_id: id });

  const cls = classQuery.data;
  const students = studentsQuery.data?.items ?? [];

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: renderPrimary },
    {
      title: 'Admission No',
      dataIndex: 'admission_number',
      key: 'admission_number',
      render: renderMono,
    },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', render: renderText },
    {
      title: 'Father Name',
      dataIndex: 'father_name',
      key: 'father_name',
      render: renderText,
    },
    {
      title: 'Contact',
      dataIndex: 'father_contact',
      key: 'father_contact',
      render: renderMuted,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag>{status}</StatusTag>,
    },
  ];

  const title = cls
    ? cls.section
      ? `${cls.class_name} - ${cls.section}`
      : cls.class_name
    : 'Class Details';

  return (
    <PageContainer>
      <PageHeader
        title={title}
        subtitle="Class information and enrolled students."
        icon={<LayersIcon />}
        actions={<Button onClick={() => navigate('/classes')}>← Back</Button>}
      />

      {classQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title="Class not found or failed to load."
          action={
            <Button size="small" onClick={() => navigate('/classes')}>
              Back to Classes
            </Button>
          }
        />
      ) : classQuery.isLoading ? (
        <ContentCard>
          <Skeleton active paragraph={{ rows: 4 }} />
        </ContentCard>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <ContentCard title="Class Information" className="xl:col-span-2">
              <Descriptions column={{ xs: 1, sm: 2 }} size="small" colon>
                <Descriptions.Item label="Class Name">
                  {cls.class_name}
                </Descriptions.Item>
                <Descriptions.Item label="Section">
                  {cls.section || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Class Teacher">
                  {cls.class_teacher_name || 'Not assigned'}
                </Descriptions.Item>
                <Descriptions.Item label="Male / Female">
                  {cls.male_count ?? 0} / {cls.female_count ?? 0}
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {cls.created_at ? cls.created_at.slice(0, 10) : '—'}
                </Descriptions.Item>
              </Descriptions>
            </ContentCard>

            <StatCard
              label="Enrolled Students"
              value={cls.student_count ?? studentsQuery.data?.meta.total ?? 0}
              icon={<UsersIcon />}
              tone="primary"
              loading={classQuery.isLoading}
            />
          </div>

          <ContentCard title="Student Roster" flush>
            <DataTable
              columns={columns}
              dataSource={students}
              loading={studentsQuery.isFetching}
              pagination={paging.tableProps(studentsQuery.data?.meta)}
              emptyText="No students enrolled in this class."
            />
          </ContentCard>
        </>
      )}
    </PageContainer>
  );
}
