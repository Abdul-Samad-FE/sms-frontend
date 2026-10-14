import React, { useState } from 'react';
import { Alert, Form, Input, Button, notification } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  // Lockout / rate-limit / disabled-account messages stay on screen, since
  // the user has to act on them (wait, or contact an administrator).
  const [blockedMessage, setBlockedMessage] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values) => {
    setLoading(true);
    setBlockedMessage(null);
    try {
      const user = await login(values);
      notification.success({ message: 'Signed in successfully' });
      navigate(user?.is_first_login ? '/change-password' : from, {
        replace: true,
      });
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if ((status === 429 || status === 403) && typeof detail === 'string') {
        setBlockedMessage(detail);
      } else {
        notification.error({
          message: 'Sign in failed',
          description: detail || 'Check your credentials and try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="ds-card w-full max-w-md p-8 shadow-[var(--shadow-md)]">
        <div className="text-center mb-8">
          <h1 className="ds-page-title">School Management System</h1>
          <p className="ds-page-subtitle">Sign in to your account</p>
        </div>

        {blockedMessage && (
          <Alert
            type="warning"
            showIcon
            title={blockedMessage}
            className="!mb-6"
          />
        )}

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input placeholder="admin@sms.com" autoComplete="username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            className="mt-2"
          >
            Sign In
          </Button>
        </Form>
      </div>
    </div>
  );
}
