import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

/**
 * 403 screen shown when an authenticated user lacks access to a route.
 */
export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to access this page."
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
}
