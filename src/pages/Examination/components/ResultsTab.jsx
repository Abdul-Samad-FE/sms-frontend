import React, { useMemo, useState } from 'react';
import { Alert, Button, Input, Popconfirm, Select, notification } from 'antd';
import { useTheme } from '../../../theme';
import { useAllClasses } from '../../../hooks/useClasses';
import { useAllExams } from '../../../hooks/useExams';
import {
  useClassPerformance,
  useProcessResults,
  usePublishResults,
  useResults,
  useUnpublishResults,
} from '../../../hooks/useResults';
import { usePagination } from '../../../hooks/usePagination';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { MAX_PAGE_SIZE } from '../../../api/pagination';
import { getDMC, listResults } from '../../../api/results';
import PermissionGuard from '../../../components/PermissionGuard';
import ExportCsvButton from '../../../components/ExportCsvButton';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  ActivityIcon,
  UsersIcon,
} from '../../../components/Icons';
import {
  ActionButton,
  ContentCard,
  DataTable,
  MonoCell,
  StatCard,
  StatGrid,
  StatusTag,
  TableActions,
  TableEmpty,
  renderMono,
  renderPrimary,
} from '../../../components/ui';
import { EXAM_TYPE_LABELS, classLabel, gradeTone } from '../examConstants';

export default function ResultsTab() {
  const { palette } = useTheme();
  const [examId, setExamId] = useState(null);
  const [classId, setClassId] = useState(null);
  const [dmcLoading, setDmcLoading] = useState(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const { data: exams = [] } = useAllExams();
  const { data: classes = [] } = useAllClasses();
  const paging = usePagination({
    resetKeys: [examId, classId, debouncedSearch],
  });
  const resultsQuery = useResults({
    exam_id: examId,
    class_id: classId,
    search: debouncedSearch || undefined,
    ...paging.params,
  });
  // KPIs come from the server so they cover the whole class, not one page.
  const perfQuery = useClassPerformance(examId, classId);
  const publishedProbe = useResults({
    exam_id: examId,
    class_id: classId,
    published_only: true,
    page: 1,
    page_size: 1,
  });
  const processMutation = useProcessResults();
  const publishMutation = usePublishResults();
  const unpublishMutation = useUnpublishResults();

  const results = resultsQuery.data?.items ?? [];
  const totalResults = resultsQuery.data?.meta?.total ?? 0;
  const stats = useMemo(() => {
    const perf = perfQuery.data;
    return {
      total: perf?.total_students ?? 0,
      passed: perf?.passed ?? 0,
      failed: perf?.failed ?? 0,
      passPct: perf ? Math.round(perf.pass_percentage * 10) / 10 : 0,
      anyPublished: (publishedProbe.data?.meta?.total ?? 0) > 0,
    };
  }, [perfQuery.data, publishedProbe.data]);

  const ready = examId != null && classId != null;

  const handleProcess = async () => {
    try {
      const res = await processMutation.mutateAsync({ examId, classId });
      notification.success({
        message: `Processed ${res.processed} students — ${res.passed} passed, ${res.failed} failed.`,
      });
    } catch (err) {
      notification.error({
        message: 'Processing failed',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const handlePublish = async (publish) => {
    const mut = publish ? publishMutation : unpublishMutation;
    try {
      const res = await mut.mutateAsync({ examId, classId });
      notification.success({
        message: `${publish ? 'Published' : 'Unpublished'} ${res.affected} result(s).`,
      });
    } catch (err) {
      notification.error({
        message: 'Operation failed',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  const handleDmc = async (studentId, name) => {
    setDmcLoading(studentId);
    try {
      // Loaded on demand so @react-pdf stays out of the main bundle.
      const [dmc, { pdf }, { default: DmcDocument }] = await Promise.all([
        getDMC(examId, studentId),
        import('@react-pdf/renderer'),
        import('./DmcDocument'),
      ]);
      const blob = await pdf(
        <DmcDocument dmc={dmc} palette={palette} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DMC_${name.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      notification.success({ message: 'DMC downloaded.' });
    } catch (err) {
      notification.error({
        message: 'Failed to generate DMC',
        description: err?.response?.data?.detail || err?.message,
      });
    } finally {
      setDmcLoading(null);
    }
  };

  const columns = [
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
      title: 'Admission No',
      dataIndex: 'admission_number',
      key: 'admission_number',
      render: renderMono,
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
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      align: 'right',
      render: (v) => <MonoCell>{v == null ? null : `${v}%`}</MonoCell>,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (g) => <StatusTag tone={gradeTone(g)}>{g || '—'}</StatusTag>,
    },
    {
      title: 'Result',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <StatusTag tone={s === 'pass' ? 'success' : 'danger'}>
          {s === 'pass' ? 'Pass' : 'Fail'}
        </StatusTag>
      ),
    },
    {
      title: 'Published',
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
      key: 'dmc',
      align: 'right',
      render: (_, r) => (
        <PermissionGuard permission="result:export">
          <TableActions>
            <ActionButton
              loading={dmcLoading === r.student_id}
              onClick={() => handleDmc(r.student_id, r.student_name)}
            >
              Download DMC
            </ActionButton>
          </TableActions>
        </PermissionGuard>
      ),
    },
  ];

  const actions = ready && (
    <>
      <ExportCsvButton
        filename="results"
        columns={[
          { header: 'Position', key: 'position' },
          { header: 'Student', key: 'student_name' },
          { header: 'Admission', key: 'admission_number' },
          { header: 'Obtained', key: 'obtained_marks' },
          { header: 'Total', key: 'total_marks' },
          { header: 'Percentage', key: 'percentage' },
          { header: 'Grade', key: 'grade' },
          { header: 'Status', key: 'status' },
        ]}
        rows={results}
        fetchRows={async () =>
          (
            await listResults({
              exam_id: examId,
              class_id: classId,
              page: 1,
              page_size: MAX_PAGE_SIZE,
            })
          ).items
        }
      />
      <PermissionGuard permission="result:publish">
        {stats.anyPublished ? (
          <Popconfirm
            title="Unpublish results for this class?"
            okText="Unpublish"
            cancelText="Cancel"
            onConfirm={() => handlePublish(false)}
          >
            <Button loading={unpublishMutation.isPending}>Unpublish</Button>
          </Popconfirm>
        ) : (
          <Button
            loading={publishMutation.isPending}
            disabled={results.length === 0}
            onClick={() => handlePublish(true)}
          >
            Publish
          </Button>
        )}
      </PermissionGuard>
      <PermissionGuard permission="result:create">
        <Button
          type="primary"
          loading={processMutation.isPending}
          onClick={handleProcess}
        >
          Process Results
        </Button>
      </PermissionGuard>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <ContentCard
        title="Results"
        subtitle="Process marks into results, publish them, and download DMCs."
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
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
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      </ContentCard>

      {!ready ? (
        <ContentCard>
          <TableEmpty text="Select an exam and class to view results." />
        </ContentCard>
      ) : (
        <>
          <StatGrid columns={4}>
            <StatCard
              label="Students"
              value={stats.total}
              icon={<UsersIcon />}
              tone="primary"
            />
            <StatCard
              label="Passed"
              value={stats.passed}
              icon={<CheckCircleIcon />}
              tone="success"
            />
            <StatCard
              label="Failed"
              value={stats.failed}
              icon={<AlertCircleIcon />}
              tone="danger"
            />
            <StatCard
              label="Pass Rate"
              value={`${stats.passPct}%`}
              icon={<ActivityIcon />}
              tone="info"
            />
          </StatGrid>

          {resultsQuery.isError ? (
            <Alert type="error" showIcon title="Failed to load results." />
          ) : (
            <ContentCard
              title="Class Results"
              subtitle={`${totalResults} student(s)`}
              extra={
                <Input.Search
                  allowClear
                  placeholder="Search student"
                  aria-label="Search results by student"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="!w-[220px]"
                />
              }
              flush
            >
              <DataTable
                columns={columns}
                dataSource={results}
                loading={resultsQuery.isFetching}
                pagination={paging.tableProps(resultsQuery.data?.meta)}
                emptyText={
                  debouncedSearch
                    ? 'No matching students.'
                    : 'No results yet — enter marks, then Process Results.'
                }
              />
            </ContentCard>
          )}
        </>
      )}
    </div>
  );
}
