import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  InputNumber,
  Select,
  notification,
} from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { useActiveSchool } from '../../../context/ActiveSchoolContext';
import { useAllClasses } from '../../../hooks/useClasses';
import { useAllStudents } from '../../../hooks/useStudents';
import { useAllExams, useExamSchedule } from '../../../hooks/useExams';
import { useBulkMarks, useMarks } from '../../../hooks/useMarks';
import PermissionGuard from '../../../components/PermissionGuard';
import { EXAM_TYPE_LABELS, classLabel } from '../examConstants';
import {
  ContentCard,
  DataTable,
  PrimaryCell,
  StatusTag,
  TableEmpty,
} from '../../../components/ui';

export default function MarksTab() {
  const { hasPermission } = useAuth();
  const { activeSchoolId } = useActiveSchool();
  const canEnter = hasPermission('result:create');

  const [examId, setExamId] = useState(null);
  const [classId, setClassId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [draft, setDraft] = useState({});

  const { data: exams = [] } = useAllExams();
  const { data: classes = [] } = useAllClasses();
  const { data: schedule = [] } = useExamSchedule(examId, classId, {
    enabled: examId != null && classId != null,
  });
  const studentsQuery = useAllStudents(
    { class_id: classId },
    { enabled: classId != null }
  );
  const marksQuery = useMarks(
    { exam_id: examId, class_id: classId, subject_id: subjectId },
    { enabled: examId != null && classId != null && subjectId != null }
  );
  const bulkMutation = useBulkMarks();

  const students = useMemo(
    () => studentsQuery.data ?? [],
    [studentsQuery.data]
  );
  const selectedSchedule = schedule.find((s) => s.subject_id === subjectId);
  const total = selectedSchedule?.total_marks ?? 100;

  // Reset subject when exam/class changes (schedule changes).
  useEffect(() => {
    setSubjectId(null);
  }, [examId, classId]);

  // Build draft from existing marks for the selected subject.
  useEffect(() => {
    if (subjectId == null) {
      setDraft({});
      return;
    }
    const byStudent = new Map(
      (marksQuery.data ?? []).map((m) => [m.student_id, m])
    );
    const next = {};
    for (const s of students) {
      const m = byStudent.get(s.id);
      next[s.id] = {
        obtained: m && !m.is_absent ? m.obtained_marks : null,
        is_absent: m?.is_absent ?? false,
      };
    }
    setDraft(next);
  }, [subjectId, students, marksQuery.data]);

  const patch = (studentId, key, value) =>
    setDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [key]: value },
    }));

  const handleSave = async () => {
    // Marks belong to the active school (server re-validates access).
    const schoolId = activeSchoolId;
    if (schoolId == null) {
      notification.error({ message: 'Unable to determine the school.' });
      return;
    }
    // Client-side validation
    for (const s of students) {
      const d = draft[s.id] || {};
      if (
        !d.is_absent &&
        d.obtained != null &&
        (d.obtained < 0 || d.obtained > total)
      ) {
        notification.error({
          message: `Invalid marks for ${s.name}: must be between 0 and ${total}.`,
        });
        return;
      }
    }
    const records = students
      .map((s) => {
        const d = draft[s.id] || {};
        if (!d.is_absent && d.obtained == null) return null; // skip un-entered
        return {
          student_id: s.id,
          subject_id: subjectId,
          total_marks: total,
          obtained_marks: d.is_absent ? null : d.obtained,
          is_absent: !!d.is_absent,
        };
      })
      .filter(Boolean);

    if (!records.length) {
      notification.info({
        message: 'Nothing to save — enter some marks first.',
      });
      return;
    }
    try {
      const res = await bulkMutation.mutateAsync({
        school_id: schoolId,
        exam_id: examId,
        class_id: classId,
        records,
      });
      notification.success({
        message: `Saved marks for ${res.processed} student(s).`,
      });
    } catch (err) {
      notification.error({
        message: 'Failed to save marks',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (_, r) => (
        <PrimaryCell secondary={r.admission_number}>{r.name}</PrimaryCell>
      ),
    },
    {
      title: `Obtained (out of ${total})`,
      key: 'obtained',
      width: 200,
      render: (_, r) => (
        <InputNumber
          min={0}
          max={total}
          value={draft[r.id]?.obtained ?? null}
          disabled={!canEnter || draft[r.id]?.is_absent}
          onChange={(v) => patch(r.id, 'obtained', v)}
          placeholder="—"
          aria-label={`Obtained marks for ${r.name}`}
        />
      ),
    },
    {
      title: 'Absent',
      key: 'absent',
      width: 100,
      render: (_, r) => (
        <Checkbox
          checked={draft[r.id]?.is_absent ?? false}
          disabled={!canEnter}
          onChange={(e) => patch(r.id, 'is_absent', e.target.checked)}
          aria-label={`Mark ${r.name} absent`}
        />
      ),
    },
  ];

  const ready = examId != null && classId != null && subjectId != null;

  const selectors = (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="ds-label">Exam</span>
        <Select
          value={examId}
          onChange={setExamId}
          placeholder="Select exam"
          className="min-w-[220px]"
          options={exams.map((e) => ({
            value: e.id,
            label: `${e.name} (${EXAM_TYPE_LABELS[e.exam_type] || e.exam_type})`,
          }))}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="ds-label">Class</span>
        <Select
          value={classId}
          onChange={setClassId}
          placeholder="Select class"
          className="min-w-[200px]"
          options={classes.map((c) => ({ value: c.id, label: classLabel(c) }))}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="ds-label">Subject</span>
        <Select
          value={subjectId}
          onChange={setSubjectId}
          placeholder="Select subject"
          className="min-w-[200px]"
          disabled={examId == null || classId == null}
          options={schedule.map((s) => ({
            value: s.subject_id,
            label: `${s.subject_name} (${s.total_marks})`,
          }))}
        />
      </label>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <ContentCard
        title="Marks Entry"
        subtitle="Pick an exam, class and subject, then enter each student's marks."
      >
        {selectors}
      </ContentCard>

      {!canEnter && (
        <Alert
          type="info"
          showIcon
          title="You don't have permission to enter marks (result:create). View only."
        />
      )}

      {examId == null || classId == null ? (
        <ContentCard>
          <TableEmpty text="Select an exam and class to begin." />
        </ContentCard>
      ) : schedule.length === 0 ? (
        <Alert
          type="warning"
          showIcon
          title="No datesheet for this class. Build the exam datesheet first (Exams tab)."
        />
      ) : subjectId == null ? (
        <ContentCard>
          <TableEmpty text="Select a subject to enter marks." />
        </ContentCard>
      ) : (
        <>
          <ContentCard
            title={selectedSchedule?.subject_name ?? 'Students'}
            subtitle={`${students.length} student(s) · out of ${total}`}
            extra={
              selectedSchedule && (
                <StatusTag tone="info">
                  Pass marks: {selectedSchedule.pass_marks}
                </StatusTag>
              )
            }
            flush
          >
            {/* Data-entry grid: the class roster is loaded in full and saved
                in one bulk request, so paging is client-side by design. */}
            <DataTable
              columns={columns}
              dataSource={students}
              loading={studentsQuery.isFetching || marksQuery.isFetching}
              pagination={{ pageSize: 15 }}
              emptyText="No students in this class."
            />
          </ContentCard>
          <div className="flex justify-end">
            <PermissionGuard permission="result:create">
              <Button
                type="primary"
                disabled={!ready || students.length === 0}
                loading={bulkMutation.isPending}
                onClick={handleSave}
              >
                Save Marks
              </Button>
            </PermissionGuard>
          </div>
        </>
      )}
    </div>
  );
}
