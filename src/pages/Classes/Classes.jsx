import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, notification } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useClasses, useDeleteClass } from '../../hooks/useClasses';
import { useStudents } from '../../hooks/useStudents';
import { useTheme } from '../../theme';
import ClassSummaryCards from './components/ClassSummaryCards';
import ClassTable from './components/ClassTable';
import ClassFormModal from './components/ClassFormModal';
import ExportCsvButton from '../../components/ExportCsvButton';

/**
 * Classes management — list, create, edit, delete; student counts are derived
 * from the (tenant-scoped) student list.
 */
export default function Classes() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { user, hasPermission } = useAuth();
  const isSuper = user?.is_superuser === true;
  const canCreate = isSuper || hasPermission('class:create');
  const canUpdate = isSuper || hasPermission('class:update');
  const canDelete = isSuper || hasPermission('class:delete');

  const [modalOpen, setModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState(null);

  const classesQuery = useClasses();
  const studentsQuery = useStudents({ limit: 1000 });
  const deleteMutation = useDeleteClass();

  const classes = classesQuery.data ?? [];
  const students = studentsQuery.data ?? [];

  const studentCountByClass = useMemo(() => {
    const map = new Map();
    for (const s of students) {
      if (s.class_id != null) {
        map.set(s.class_id, (map.get(s.class_id) ?? 0) + 1);
      }
    }
    return map;
  }, [students]);

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
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Class Management
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Organise classes and sections, and review enrolment per class.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ExportCsvButton
            filename="classes"
            columns={[
              { header: 'Class Name', key: 'class_name' },
              { header: 'Section', key: 'section' },
              {
                header: 'Students',
                accessor: (c) => studentCountByClass.get(c.id) ?? 0,
              },
            ]}
            rows={classes}
          />
          {canCreate && (
            <Button type="primary" onClick={handleAdd} className="btn-primary border-0">
              + Add Class
            </Button>
          )}
          <button
            onClick={toggleTheme}
            className="hidden sm:block border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-4 py-2 flex-shrink-0 rounded-md text-sm font-medium cursor-pointer hover:bg-[var(--muted)] transition-colors shadow-sm"
          >
            Switch Theme
          </button>
        </div>
      </div>

      {classesQuery.isError ? (
        <div className="px-2">
          <Alert
            type="error"
            showIcon
            message="Failed to load classes."
            action={
              <Button size="small" danger onClick={() => classesQuery.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <ClassSummaryCards
            classCount={classes.length}
            studentTotal={students.length}
          />

          <div className="px-2">
            <ClassTable
              classes={classes}
              loading={classesQuery.isLoading}
              studentCountByClass={studentCountByClass}
              onView={(cls) => navigate(`/classes/${cls.id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canUpdate={canUpdate}
              canDelete={canDelete}
              deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
            />
          </div>
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
    </div>
  );
}
