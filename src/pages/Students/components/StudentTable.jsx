import React from 'react';
import { Table, Tag, Button, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { EyeIcon, EditIcon, Trash2Icon, InfoIcon, CreditCardIcon } from '../../../components/Icons';

export default function StudentTable({ students, loading, onEdit, onViewDetail, onViewCard, onDelete }) {
  const columns = [
    {
      title: 'Admission No',
      dataIndex: 'admission_number',
      key: 'admission_number',
      render: (text) => <span className="font-mono text-sm font-semibold text-[var(--primary)]">{text}</span>,
      fixed: 'left',
    },
    {
      title: 'Enroll No',
      dataIndex: 'enroll_no',
      key: 'enroll_no',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold text-base">{text}</span>,
      width: 200,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Class',
      dataIndex: 'class_name',
      key: 'class_name',
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
    },
    {
      title: "Father's Name",
      dataIndex: 'father_name',
      key: 'father_name',
      width: 150,
    },
    {
      title: 'Contact',
      dataIndex: 'father_contact',
      key: 'father_contact',
      render: (text) => <span className="text-[var(--muted-foreground)]">{text}</span>,
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dob',
      key: 'dob',
      render: (date) => date ? <span className="text-sm">{dayjs(date).format('MMM DD, YYYY')}</span> : '-',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Admission Date',
      dataIndex: 'admission_date',
      key: 'admission_date',
      render: (date) => date ? <span className="text-sm">{dayjs(date).format('MMM DD, YYYY')}</span> : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'Active' ? 'success' : 'error';
        return <Tag color={color} className="border-0 font-medium">{status}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      width: 140,
      onHeaderCell: () => ({ className: 'ai-fixed-action-cell' }),
      onCell: () => ({ className: 'ai-fixed-action-cell' }),
      render: (_, record) => (
        <div className="flex gap-2">
          <button 
            className="action-icon-btn" 
            title="View Full Details"
            onClick={() => onViewDetail(record)}
          >
            <InfoIcon className="w-4 h-4" />
          </button>
          <button 
            className="action-icon-btn" 
            title="Identity Card View"
            onClick={() => onViewCard(record)}
          >
            <CreditCardIcon className="w-4 h-4" />
          </button>
          <button 
            className="action-icon-btn" 
            title="Edit Student"
            onClick={() => onEdit(record)}
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Are you sure you want to delete this student?"
            description="This action cannot be undone."
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <button className="action-icon-btn action-icon-btn-danger" title="Delete Student">
              <Trash2Icon className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="card-glass p-0 overflow-hidden outline-none border-[var(--card-border)] shadow-sm mt-2">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--header-bg)]">
        <h3 className="text-lg font-semibold m-0 text-[var(--foreground)]">Students Directory</h3>
      </div>
      <div className="ai-reports-table">
        <Table 
          columns={columns} 
          dataSource={students} 
          rowKey="id" 
          pagination={{ pageSize: 10 }} 
          scroll={{ x: 'max-content' }}
          loading={loading}
        />
      </div>
    </div>
  );
}
