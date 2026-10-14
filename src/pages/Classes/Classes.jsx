import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Input, notification } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useClassesPage, useDeleteClass } from '../../hooks/useClasses';
import { useStudentCount } from '../../hooks/useStudents';
import { usePagination } from '../../hooks/usePagination';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { listAllClasses } from '../../api/classes';
import { PageContainer, PageHeader, ContentCard } from '../../components/ui';
import ClassSummaryCards from './components/ClassSummaryCards';
import ClassTable from './components/ClassTable';
import ClassFormModal from './components/ClassFormModal';
import ExportCsvButton from '../../components/ExportCsvButton';

const CLASS_CSV_COLUMNS = [
  { header: 'Class Name', key: 'class_name' },
  { header: 'Section', key: 'section' },
  { header: 'Class Teacher', key: 'class_teacher_name' },
  { header: 'Students', key: 'student_count' },
  { header: 'Male', key: 'male_count' },
  { header: 'Female', key: 'female_count' },
];

/**
 * Classes management — server-paginated list with class teacher and
 * student / gender counts computed by the API.
 */
export default function Classes() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('class:create');
  const canUpdate = hasPermission('class:update');
  const canDelete = hasPermission('class:delete');

  const [modalOpen, setModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState(null);
  const [searchText, setSearchText] = useState('');
  const search = useDebouncedValue(searchText.trim(), 300) || undefined;

  const paging = usePagination({ resetKeys: [search] });
  const classesQuery = useClassesPage({ ...paging.params, search });
  // Unfiltered class total for the KPI card (one-row count query).
  const classTotalQuery = useClassesPage({ page: 1, page_size: 1 });
  // Total enrolment (incl. students without a class) — a one-row count query.
  const studentTotalQuery = useStudentCount();
  const deleteMutation = useDeleteClass();

  const classes = classesQuery.data?.items ?? [];
  const totalClasses = classesQuery.data?.meta.total ?? 0;

  const handleAdd = () => {
    setClassToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (cls) => {
    setClassToEdit(cls);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({ message: 'Class deleted successfully.' });
    } catch (err) {
      notification.error({
        message: 'Failed to delete class',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Class Management"
        subtitle="Organise classes and sections, assign class teachers and review enrolment."
        actions={
          <>
            <ExportCsvButton
              filename="classes"
              columns={CLASS_CSV_COLUMNS}
              rows={classes}
              fetchRows={() => listAllClasses({ search })}
            />
            {canCreate && (
              <Button type="primary" onClick={handleAdd}>
                + Add Class
              </Button>
            )}
          </>
        }
      />

      {classesQuery.isError ? (
        <Alert
          type="error"
          showIcon
          title="Failed to load classes."
          action={
            <Button size="small" danger onClick={() => classesQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <>
          <ClassSummaryCards
            classCount={classTotalQuery.data?.meta.total ?? 0}
            studentTotal={studentTotalQuery.data ?? 0}
            loading={classTotalQuery.isLoading}
          />

          <ContentCard
            title="All Classes"
            subtitle={`${totalClasses} class${totalClasses === 1 ? '' : 'es'}`}
            flush
            extra={
              <Input.Search
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search class or section"
                aria-label="Search classes"
                className="w-full sm:w-[260px]"
              />
            }
          >
            <ClassTable
              classes={classes}
              loading={classesQuery.isFetching}
              pagination={paging.tableProps(classesQuery.data?.meta)}
              onView={(cls) => navigate(`/classes/${cls.id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canUpdate={canUpdate}
              canDelete={canDelete}
              deletingId={
                deleteMutation.isPending ? deleteMutation.variables : null
              }
            />
          </ContentCard>
        </>
      )}

      <ClassFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setClassToEdit(null);
        }}
        editData={classToEdit}
      />
    </PageContainer>
  );
}
