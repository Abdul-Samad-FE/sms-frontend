import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages are code-split: each route's JS loads the first time it is visited,
// so the initial download is only the shell + login.
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Students = lazy(() => import('./pages/Students/Students'));
const Teachers = lazy(() => import('./pages/Teachers/Teachers'));
const Attendance = lazy(() => import('./pages/Attendance/Attendance'));
const ClassAttendanceView = lazy(
  () => import('./pages/Attendance/ClassAttendanceView')
);
const MarkClassAttendance = lazy(
  () => import('./pages/Attendance/MarkClassAttendance')
);
const Classes = lazy(() => import('./pages/Classes/Classes'));
const ClassDetails = lazy(() => import('./pages/Classes/ClassDetails'));
const Schools = lazy(() => import('./pages/Schools/Schools'));
const Organizations = lazy(() => import('./pages/Organizations/Organizations'));
const OrganizationDetails = lazy(
  () => import('./pages/Organizations/OrganizationDetails')
);
const Users = lazy(() => import('./pages/Users/Users'));
const Roles = lazy(() => import('./pages/Roles/Roles'));
const Examination = lazy(() => import('./pages/Examination/Examination'));
const ChangePassword = lazy(
  () => import('./pages/ChangePassword/ChangePassword')
);

/**
 * Authenticated pages share ONE layout instance (sidebar + frame) through a
 * parent route, so navigating between pages no longer remounts the shell.
 * The parent only requires a signed-in user; each child route still applies
 * its own permission / module / level guard.
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute module="dashboard">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute permission="student:read">
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teachers"
          element={
            <ProtectedRoute permission="teacher:read">
              <Teachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute permission="attendance:read">
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/:classId"
          element={
            <ProtectedRoute permission="attendance:read">
              <ClassAttendanceView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/:classId/mark"
          element={
            <ProtectedRoute permission="attendance:read">
              <MarkClassAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/examination"
          element={
            <ProtectedRoute permission="exam:read">
              <Examination />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute permission="class:read">
              <Classes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes/:classId"
          element={
            <ProtectedRoute permission="class:read">
              <ClassDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schools"
          element={
            <ProtectedRoute
              levels={['global', 'super_admin']}
              permission="school:read"
            >
              <Schools />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizations"
          element={
            <ProtectedRoute permission="organization:read">
              <Organizations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizations/:organizationId"
          element={
            <ProtectedRoute permission="organization:read">
              <OrganizationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute permission="user:read">
              <Users />
            </ProtectedRoute>
          }
        />
        {/* Any signed-in user; also where first-login users are sent. */}
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="/roles"
          element={
            <ProtectedRoute module="admin">
              <Roles />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Unknown URLs fall back to the dashboard instead of a blank page. */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
