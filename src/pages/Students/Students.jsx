import React, { useState } from 'react';
import { Select, Button, Input, notification } from 'antd';
import { listStudents } from '../../api/students';
import { MAX_PAGE_SIZE } from '../../api/pagination';
import { usePagination } from '../../hooks/usePagination';
import { useAllClasses } from '../../hooks/useClasses';
import { useDeleteStudent, useStudents } from '../../hooks/useStudents';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import StudentCards from './components/StudentCards';
import StudentTable from './components/StudentTable';
import AddStudentModal from './components/AddStudentModal';
import StudentViewModal from './components/StudentViewModal';
import StudentCardModal from './components/StudentCardModal';
import PermissionGuard from '../../components/PermissionGuard';
import ExportCsvButton from '../../components/ExportCsvButton';
import { PageContainer, PageHeader, ContentCard } from '../../components/ui';

const STUDENT_CSV_COLUMNS = [
  { header: 'Admission No', key: 'admission_number' },
  { header: 'Enroll No', key: 'enroll_no' },
  { header: 'Name', key: 'name' },
  { header: 'Gender', key: 'gender' },
  { header: 'Class', key: 'class_name' },
  { header: 'Section', key: 'section' },
  { header: 'Father Name', key: 'father_name' },
  { header: 'Contact', key: 'father_contact' },
  { header: 'Status', key: 'status' },
  { header: 'DOB', accessor: (s) => (s.dob ? String(s.dob).slice(0, 10) : '') },
  {
    header: 'Admission Date',
    accessor: (s) =>
      s.admission_date ? String(s.admission_date).slice(0, 10) : '',
  },
  { header: 'Address', key: 'address' },
];

export default function Students() {
  const [selectedClass, setSelectedClass] = useState('All'); // class_id (number) or 'All'
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentToView, setStudentToView] = useState(null);
  const [studentToCard, setStudentToCard] = useState(null);

  const search = useDebouncedValue(searchText.trim(), 300);
  const classId = selectedClass === 'All' ? undefined : selectedClass;

  // Filters shared by the table, the KPI cards and the CSV export.
  const filters = { class_id: classId, search: search || undefined };

  const { data: classes = [] } = useAllClasses();
  const paging = usePagination({ resetKeys: [classId, search] });
  const studentsQuery = useStudents({ ...filters, ...paging.params });
  const deleteMutation = useDeleteStudent();

  const changeClass = (value) => setSelectedClass(value);

  const changeSearch = (e) => setSearchText(e.target.value);

  const handleAddClick = () => {
    setStudentToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student) => {
    setStudentToEdit(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({ message: 'Student deleted successfully!' });
    } catch (err) {
      notification.error({
        message: 'Failed to delete student',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  // Export every row matching the current filters, not just this page.
  const fetchAllForExport = async () => {
    const all = await listStudents({
      ...filters,
      page: 1,
      page_size: MAX_PAGE_SIZE,
    });
    return all.items;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Student Management"
        subtitle="Manage admissions, view profiles, and analyze student distribution."
        actions={
          <>
            <ExportCsvButton
              filename="students"
              columns={STUDENT_CSV_COLUMNS}
              fetchRows={fetchAllForExport}
            />
            <PermissionGuard permission="student:create">
              <Button type="primary" onClick={handleAddClick}>
                + Add Student
              </Button>
            </PermissionGuard>
          </>
        }
      />

      <StudentCards classId={classId} />

      <ContentCard
        title="Students Directory"
        subtitle={
          studentsQuery.data
            ? `${studentsQuery.data.meta.total} student(s)`
            : undefined
        }
        flush
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <Input.Search
              allowClear
              value={searchText}
              onChange={changeSearch}
              placeholder="Search name, admission no, father…"
              aria-label="Search students"
              className="w-full sm:w-[260px]"
            />
            <span className="ds-label">Class</span>
            <Select
              value={selectedClass}
              onChange={changeClass}
              className="min-w-[160px]"
              aria-label="Filter by class"
              options={[
                { value: 'All', label: 'All Classes' },
                ...classes.map((c) => ({ value: c.id, label: c.class_name })),
              ]}
            />
          </div>
        }
      >
        <StudentTable
          students={studentsQuery.data?.items ?? []}
          loading={studentsQuery.isFetching}
          pagination={paging.tableProps(studentsQuery.data?.meta)}
          deletingId={
            deleteMutation.isPending ? deleteMutation.variables : null
          }
          onEdit={handleEditClick}
          onViewDetail={(s) => setStudentToView(s)}
          onViewCard={(s) => setStudentToCard(s)}
          onDelete={handleDelete}
        />
      </ContentCard>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setStudentToEdit(null);
        }}
        editData={studentToEdit}
        onSuccess={() => {
          setIsModalOpen(false);
          setStudentToEdit(null);
        }}
      />

      {/* Full Details Modal */}
      <StudentViewModal
        isOpen={!!studentToView}
        onClose={() => setStudentToView(null)}
        student={studentToView}
      />

      {/* Identity Card Modal */}
      <StudentCardModal
        isOpen={!!studentToCard}
        onClose={() => setStudentToCard(null)}
        student={studentToCard}
      />
    </PageContainer>
  );
}
