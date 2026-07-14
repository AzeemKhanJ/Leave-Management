import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { DashboardShell } from './components/DashboardShell';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Departments } from './pages/admin/Departments';
import Classes from './pages/admin/Classes';
import { Teachers } from './pages/admin/Teachers';
import { Students } from './pages/admin/Students';
import { Leaves as AdminLeaves } from './pages/admin/Leaves';
import { Holidays as AdminHolidays } from './pages/admin/Holidays';
import { Reports as AdminReports } from './pages/admin/Reports';
import { AuditLogs } from './pages/admin/AuditLogs';
import { Settings } from './pages/admin/Settings';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TakeAttendance } from './pages/teacher/TakeAttendance';
import { MyClasses } from './pages/teacher/MyClasses';
import { Students as TeacherStudents } from './pages/teacher/Students';
import { Leaves as TeacherLeaves } from './pages/teacher/Leaves';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { Leaves as StudentLeaves } from './pages/student/Leaves';
import { Holidays as StudentHolidays } from './pages/student/Holidays';

// Route Guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-bold">ERP Authentication Syncing...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// Root selector redirects user based on role
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-bold">ERP Authentication Syncing...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <DashboardShell>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/departments" element={<Departments />} />
                      <Route path="/classes" element={<Classes />} />
                      <Route path="/teachers" element={<Teachers />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/leaves" element={<AdminLeaves />} />
                      <Route path="/holidays" element={<AdminHolidays />} />
                      <Route path="/reports" element={<AdminReports />} />
                      <Route path="/audit" element={<AuditLogs />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </DashboardShell>
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute roles={['TEACHER']}>
                  <DashboardShell>
                    <Routes>
                      <Route path="/" element={<TeacherDashboard />} />
                      <Route path="/attendance" element={<TakeAttendance />} />
                      <Route path="/classes" element={<MyClasses />} />
                      <Route path="/students" element={<TeacherStudents />} />
                      <Route path="/leaves" element={<TeacherLeaves />} />
                    </Routes>
                  </DashboardShell>
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute roles={['STUDENT']}>
                  <DashboardShell>
                    <Routes>
                      <Route path="/" element={<StudentDashboard />} />
                      <Route path="/leaves" element={<StudentLeaves />} />
                      <Route path="/holidays" element={<StudentHolidays />} />
                    </Routes>
                  </DashboardShell>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};
