import React, { useEffect, useState } from 'react';
import { Alert, Input, Modal, notification } from 'antd';
import { usePurgeSchool } from '../../../hooks/useSchools';

/**
 * Typed confirmation for the only irreversible action in the system. The
 * server enforces the same rules (must be archived, name must match) — this
 * modal exists so an operator sees exactly what they are about to destroy.
 *
 * @param {{
 *   open: boolean,
 *   school?: import('../../../api/schools').SchoolRecord | null,
 *   onClose: () => void,
 * }} props
 */
export default function PurgeSchoolModal({ open, school, onClose }) {
  const [confirmText, setConfirmText] = useState('');
  const purgeMutation = usePurgeSchool();

  useEffect(() => {
    if (open) setConfirmText('');
  }, [open, school?.id]);

  if (!school) return null;

  const matches = confirmText.trim() === school.name;

  const handleOk = async () => {
    if (!matches) return;
    try {
      await purgeMutation.mutateAsync({
        id: school.id,
        confirm: confirmText.trim(),
      });
      notification.success({
        message: `"${school.name}" was permanently deleted.`,
      });
      onClose();
    } catch (err) {
      notification.error({
        message: 'Failed to delete school',
        description: err?.response?.data?.detail || err?.message,
      });
    }
  };

  return (
    <Modal
      title="Permanently delete school"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Delete forever"
      okButtonProps={{ danger: true, disabled: !matches }}
      confirmLoading={purgeMutation.isPending}
      destroyOnHidden
    >
      <div className="flex flex-col gap-5">
        <Alert
          type="error"
          showIcon
          title="This cannot be undone."
          description={
            <span>
              Deleting <strong>{school.name}</strong> also deletes{' '}
              <strong>{school.student_count ?? 0}</strong> students,{' '}
              <strong>{school.user_count ?? 0}</strong> user accounts,{' '}
              <strong>{school.class_count ?? 0}</strong> classes and every
              attendance, exam and result record belonging to them.
            </span>
          }
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="purge-confirm" className="ds-label">
            Type{' '}
            <strong className="text-[var(--foreground)]">{school.name}</strong>{' '}
            to confirm
          </label>
          <Input
            id="purge-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={school.name}
            onPressEnter={handleOk}
            status={confirmText && !matches ? 'error' : undefined}
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
}
