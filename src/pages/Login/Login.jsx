import React, { useState } from 'react';
import { Form, Input, Button, notification } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values);
      notification.success({ message: 'Signed in successfully' });
      navigate(from, { replace: true });
    } catch (err) {
      notification.error({
        message: 'Sign in failed',
        description:
          err.response?.data?.detail || 'Check your credentials and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            School Management System
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Sign in to your account
          </p>
        </div>

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
            className="btn-primary border-0 mt-2"
          >
            Sign In
          </Button>
        </Form>
      </div>
    </div>
  );
}
