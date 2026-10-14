import React from 'react';
import { Tabs } from 'antd';
import { PageContainer, PageHeader } from '../../components/ui';
import SubjectsTab from './components/SubjectsTab';
import ExamsTab from './components/ExamsTab';
import MarksTab from './components/MarksTab';
import ResultsTab from './components/ResultsTab';
import ReportsTab from './components/ReportsTab';

/**
 * Examination & Result management — one route, five workflows:
 * Subjects, Exams, Marks Entry, Results, and Reports.
 */
export default function Examination() {
  const tabs = [
    { key: 'subjects', label: 'Subjects', children: <SubjectsTab /> },
    { key: 'exams', label: 'Exams', children: <ExamsTab /> },
    { key: 'marks', label: 'Marks Entry', children: <MarksTab /> },
    { key: 'results', label: 'Results', children: <ResultsTab /> },
    { key: 'reports', label: 'Reports', children: <ReportsTab /> },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Examination & Results"
        subtitle="Manage subjects, exams, marks, results, DMCs, and analytics."
      />
      <Tabs defaultActiveKey="subjects" items={tabs} destroyOnHidden={false} />
    </PageContainer>
  );
}
