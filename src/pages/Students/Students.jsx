import React, { useEffect, useMemo, useState } from 'react';
import { Select, Button, notification } from 'antd';
import { listStudents, deleteStudent } from '../../api/students';
import { listClasses } from '../../api/classes';
import StudentCards from './components/StudentCards';
import StudentTable from './components/StudentTable';
import AddStudentModal from './components/AddStudentModal';
import StudentViewModal from './components/StudentViewModal';
import StudentCardModal from './components/StudentCardModal';
import { useTheme } from '../../theme';

export default function Students() {
  const { toggleTheme } = useTheme();
  const [selectedClass, setSelectedClass] = useState('All'); // Will store class_id (number) or 'All'
  const [studentsArray, setStudentsArray] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentToView, setStudentToView] = useState(null);
  const [studentToCard, setStudentToCard] = useState(null);

  const fetchClasses = async () => {
    try {
      const data = await listClasses();
      setClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await listStudents();
      setStudentsArray(data);
    } catch (err) {
      console.error(err);
      notification.error({ message: 'Failed to load live student data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setStudentToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student) => {
    setStudentToEdit(student);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteStudent(id);
      notification.success({ message: 'Student deleted successfully!' });
      fetchStudents(); // Refresh table
    } catch (err) {
      console.error("Delete Error:", err.response || err);
      notification.error({ message: 'Failed to delete student. Please check if the ID is valid.' });
    }
  };

  // Derived state
  const filteredStudents = useMemo(() => {
    if (selectedClass === 'All') return studentsArray;
    return studentsArray.filter(student => student.class_id === selectedClass);
  }, [selectedClass, studentsArray]);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-[var(--foreground)]">
            Student Management
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Manage admissions, view profiles, and analyze student distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-[var(--muted)] px-3 py-2 rounded-lg border border-[var(--border)]">
            <span className="text-sm text-[var(--muted-foreground)] font-medium">Filter by Class:</span>
            <Select
              value={selectedClass}
              onChange={(val) => setSelectedClass(val)}
              className="dashboard-time-select min-w-[120px]"
              dropdownClassName="dashboard-select-dropdown"
              bordered={false}
              options={[
                { value: 'All', label: 'All Classes' },
                ...classes.map(c => ({ value: c.id, label: c.class_name }))
              ]}
            />
          </div>

          <Button
            type="primary"
            onClick={handleAddClick}
            className="btn-primary border-0"
          >
            + Add Student
          </Button>

          <button
            onClick={toggleTheme}
            className="hidden sm:block border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] px-4 py-2 flex-shrink-0 rounded-md text-sm font-medium cursor-pointer hover:bg-[var(--muted)] transition-colors shadow-sm"
          >
            Switch Theme
          </button>
        </div>
      </div>

      <StudentCards students={filteredStudents} />

      <div className="px-2">
        <StudentTable
          students={filteredStudents}
          loading={loading}
          onEdit={handleEditClick}
          onViewDetail={(s) => setStudentToView(s)}
          onViewCard={(s) => setStudentToCard(s)}
          onDelete={handleDelete}
        />
      </div>

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
          fetchStudents(); // Refresh table!
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
    </div>
  );
}
