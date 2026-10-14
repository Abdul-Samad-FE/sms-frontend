import React, { useState } from 'react';
import { Alert, Button, Form, Input, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { ContentCard, PageContainer, PageHeader } from '../../components/ui';

const MIN_LENGTH = 8;

/**
 * Change the signed-in user's password. Accounts created by an administrator
 * land here on first sign-in and cannot use the rest of the app until done.
 */
export default function ChangePassword() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mustChangePassword, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const onFinish = async ({ oldPassword, newPassword }) => {
    setSaving(true);
    try {
      await changePassword({ oldPassword, newPassword });
      await refreshUser();
      notification.success({ message: 'Password updated successfully.' });
      form.resetFields();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      notification.error({
        message: 'Failed to change password',
        description: err?.response?.data?.detail || err?.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Change Password"
        subtitle="Choose a new password for your account."
      />

      {mustChangePassword && (
        <Alert
          type="info"
          showIcon
          title="Set your own password to continue"
          description="Your account was created by an administrator. For your security, replace the temporary password before using the system."
        />
      )}

      <ContentCard title="Password" className="max-w-xl">
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
        >
          <Form.Item
            name="oldPassword"
            label="Current password"
            rules={[
              { required: true, message: 'Please enter your current password' },
            ]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              {
                min: MIN_LENGTH,
                message: `Use at least ${MIN_LENGTH} characters`,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value !== getFieldValue('oldPassword')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Must differ from your current password')
                  );
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm new password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm the new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value === getFieldValue('newPassword')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <div className="flex justify-end">
            <Button type="primary" htmlType="submit" loading={saving}>
              Update password
            </Button>
          </div>
        </Form>
      </ContentCard>
    </PageContainer>
  );
}
