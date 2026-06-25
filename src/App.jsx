import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import Students from './pages/Students/Students';
import Attendance from './pages/Attendance/Attendance';
import Classes from './pages/Classes/Classes';
import ClassDetails from './pages/Classes/ClassDetails';
import Users from './pages/Users/Users';
import Roles from './pages/Roles/Roles';
import Login from './pages/Login/Login';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute module="dashboard">
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute permission="student:read">
            <DashboardLayout>
              <Students />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute permission="attendance:read">
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute permission="class:read">
            <DashboardLayout>
              <Classes />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/:classId"
        element={
          <ProtectedRoute permission="class:read">
            <DashboardLayout>
              <ClassDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute permission="user:read">
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute module="admin">
            <DashboardLayout>
              <Roles />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
