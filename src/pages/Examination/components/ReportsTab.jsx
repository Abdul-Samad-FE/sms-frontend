import React, { useState } from 'react';
import { Select } from 'antd';
import { useAllClasses } from '../../../hooks/useClasses';
import { useAllExams } from '../../../hooks/useExams';
import {
  useClassPerformance,
  useFailedStudents,
  useSubjectPerformance,
  useTopPerformers,
} from '../../../hooks/useResults';
import ExportCsvButton from '../../../components/ExportCsvButton';
import { usePagination } from '../../../hooks/usePagination';
import { MAX_PAGE_SIZE } from '../../../api/pagination';
import { getFailedStudents } from '../../../api/results';
import {
  ActivityIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  UsersIcon,
} from '../../../components/Icons';
import {
  ContentCard,
  DataTable,
  MonoCell,
  StatCard,
  StatGrid,
  StatusTag,
  TableEmpty,
  renderMono,
  renderPrimary,
} from '../../../components/ui';
import { EXAM_TYPE_LABELS, classLabel, gradeTone } from '../examConstants';

const renderPct = (v) => <MonoCell>{v == null ? null : `${v}%`}</MonoCell>;

export default function ReportsTab() {
  const [examId, setExamId] = useState(null);
  const [classId, setClassId] = useState(null);

  const { data: exams = [] } = useAllExams();
  const { data: classes = [] } = useAllClasses();

  const cp = useClassPerformance(examId, classId);
  const sp = useSubjectPerformance(examId, classId);
  const tp = useTopPerformers(examId, classId);
  const failedPaging = usePagination({ resetKeys: [examId, classId] });
  const fs = useFailedStudents(examId, classId, failedPaging.params);

  const ready = examId != null && classId != null;
  const perf = cp.data;

  return (
    <div className="flex flex-col gap-6">
      <ContentCard
        title="Reports"
        subtitle="Class and subject analytics for a processed exam."
      >
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
              options={classes.map((c) => ({
                value: c.id,
                label: classLabel(c),
              }))}
            />
          </label>
        </div>
      </ContentCard>

      {!ready ? (
        <ContentCard>
          <TableEmpty text="Select an exam and class to view analytics." />
        </ContentCard>
      ) : (
        <>
          {/* Class performance */}
          <StatGrid columns={4}>
            <StatCard
              label="Students"
              value={perf?.total_students ?? 0}
              icon={<UsersIcon />}
              tone="primary"
              loading={cp.isLoading}
            />
            <StatCard
              label="Passed"
              value={perf?.passed ?? 0}
              icon={<CheckCircleIcon />}
              tone="success"
              loading={cp.isLoading}
            />
            <StatCard
              label="Failed"
              value={perf?.failed ?? 0}
              icon={<AlertCircleIcon />}
              tone="danger"
              loading={cp.isLoading}
            />
            <StatCard
              label="Pass Rate"
              value={`${perf?.pass_percentage ?? 0}%`}
              icon={<ActivityIcon />}
              tone="info"
              loading={cp.isLoading}
            />
          </StatGrid>
          <StatGrid columns={3}>
            <StatCard
              label="Average"
              value={`${perf?.average_percentage ?? 0}%`}
              loading={cp.isLoading}
            />
            <StatCard
              label="Highest"
              value={`${perf?.highest_percentage ?? 0}%`}
              loading={cp.isLoading}
            />
            <StatCard
              label="Lowest"
              value={`${perf?.lowest_percentage ?? 0}%`}
              loading={cp.isLoading}
            />
          </StatGrid>

          {/* Subject performance */}
          <ContentCard
            title="Subject Performance"
            flush
            extra={
              <ExportCsvButton
                filename="subject-performance"
                columns={[
                  { header: 'Subject', key: 'subject_name' },
                  { header: 'Avg %', key: 'average_percentage' },
                  { header: 'Pass', key: 'pass_count' },
                  { header: 'Fail', key: 'fail_count' },
                  { header: 'Pass %', key: 'pass_percentage' },
                ]}
                rows={sp.data ?? []}
              />
            }
          >
            {/* One row per subject (an aggregate) — bounded by the class's
                subject count, so it is not paginated. */}
            <DataTable
              rowKey="subject_id"
              loading={sp.isFetching}
              dataSource={sp.data ?? []}
              pagination={false}
              emptyText="No data."
              columns={[
                {
                  title: 'Subject',
                  dataIndex: 'subject_name',
                  key: 'subject_name',
                  render: renderPrimary,
                },
                {
                  title: 'Avg Obtained',
                  dataIndex: 'average_obtained',
                  key: 'avg_obt',
                  align: 'right',
                  render: renderMono,
                },
                {
                  title: 'Avg %',
                  dataIndex: 'average_percentage',
                  key: 'avg_pct',
                  align: 'right',
                  render: renderPct,
                },
                {
                  title: 'Pass / Fail',
                  key: 'pf',
                  render: (_, r) => (
                    <div className="flex gap-2">
                      <StatusTag tone="success">{r.pass_count} pass</StatusTag>
                      <StatusTag tone="danger">{r.fail_count} fail</StatusTag>
                    </div>
                  ),
                },
                {
                  title: 'Pass %',
                  dataIndex: 'pass_percentage',
                  key: 'pass_pct',
                  align: 'right',
                  render: renderPct,
                },
              ]}
            />
          </ContentCard>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            {/* Top performers */}
            <ContentCard
              title="Top Performers"
              flush
              extra={
                <ExportCsvButton
                  filename="top-performers"
                  columns={[
                    { header: 'Position', key: 'position' },
                    { header: 'Student', key: 'student_name' },
                    { header: 'Admission', key: 'admission_number' },
                    { header: 'Percentage', key: 'percentage' },
                    { header: 'Grade', key: 'grade' },
                  ]}
                  rows={tp.data ?? []}
                />
              }
            >
              {/* Top-N list (fixed size) — not paginated by design. */}
              <DataTable
                rowKey="student_id"
                loading={tp.isFetching}
                dataSource={tp.data ?? []}
                pagination={false}
                emptyText="No data."
                columns={[
                  {
                    title: 'Pos',
                    dataIndex: 'position',
                    key: 'position',
                    width: 64,
                    align: 'center',
                    render: renderMono,
                  },
                  {
                    title: 'Student',
                    dataIndex: 'student_name',
                    key: 'student_name',
                    render: renderPrimary,
                  },
                  {
                    title: 'Marks',
                    key: 'marks',
                    align: 'right',
                    render: (_, r) => (
                      <MonoCell>
                        {r.obtained_marks}/{r.total_marks}
                      </MonoCell>
                    ),
                  },
                  {
                    title: '%',
                    dataIndex: 'percentage',
                    key: 'percentage',
                    align: 'right',
                    render: renderPct,
                  },
                  {
                    title: 'Grade',
                    dataIndex: 'grade',
                    key: 'grade',
                    render: (g) => (
                      <StatusTag tone={gradeTone(g)}>{g || '—'}</StatusTag>
                    ),
                  },
                ]}
              />
            </ContentCard>

            {/* Failed students */}
            <ContentCard
              title="Failed Students"
              flush
              extra={
                <ExportCsvButton
                  filename="failed-students"
                  columns={[
                    { header: 'Student', key: 'student_name' },
                    { header: 'Admission', key: 'admission_number' },
                    { header: 'Percentage', key: 'percentage' },
                    {
                      header: 'Failed Subjects',
                      accessor: (r) => (r.failed_subjects || []).join('; '),
                    },
                  ]}
                  rows={fs.data?.items ?? []}
                  fetchRows={async () =>
                    (
                      await getFailedStudents(examId, classId, {
                        page: 1,
                        page_size: MAX_PAGE_SIZE,
                      })
                    ).items
                  }
                />
              }
            >
              <DataTable
                rowKey="student_id"
                loading={fs.isFetching}
                dataSource={fs.data?.items ?? []}
                pagination={failedPaging.tableProps(fs.data?.meta)}
                emptyText="No failed students."
                columns={[
                  {
                    title: 'Student',
                    dataIndex: 'student_name',
                    key: 'student_name',
                    render: (v, r) => (
                      <span className="ds-cell-primary">
                        {v}
                        <span className="ds-cell-secondary ds-cell-mono">
                          {r.admission_number}
                        </span>
                      </span>
                    ),
                  },
                  {
                    title: '%',
                    dataIndex: 'percentage',
                    key: 'percentage',
                    align: 'right',
                    render: renderPct,
                  },
                  {
                    title: 'Failed Subjects',
                    dataIndex: 'failed_subjects',
                    key: 'failed_subjects',
                    render: (subs) =>
                      (subs || []).length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {subs.map((s) => (
                            <StatusTag key={s} tone="danger">
                              {s}
                            </StatusTag>
                          ))}
                        </div>
                      ) : (
                        <MonoCell>{null}</MonoCell>
                      ),
                  },
                ]}
              />
            </ContentCard>
          </div>
        </>
      )}
    </div>
  );
}
