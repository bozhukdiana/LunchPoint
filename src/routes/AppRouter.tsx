import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { ClassesPage } from '@/features/admin/pages/ClassesPage';
import { LogsPage } from '@/features/admin/pages/LogsPage';
import { SchoolYearsPage } from '@/features/admin/pages/SchoolYearsPage';
import { SettingsPage } from '@/features/admin/pages/SettingsPage';
import { UsersPage } from '@/features/admin/pages/UsersPage';
import { LoadingScreen } from '@/features/auth/components/LoadingScreen';
import { AuthErrorPage } from '@/features/auth/pages/AuthErrorPage';
import { SignInPage } from '@/features/auth/pages/SignInPage';
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { StudentDashboardPage } from '@/features/student/pages/StudentDashboardPage';
import { TeacherDashboardPage } from '@/features/teacher/pages/TeacherDashboardPage';
import { PublicOnlyRoute } from '@/routes/guards/PublicOnlyRoute';
import { RequireAuthenticated } from '@/routes/guards/RequireAuthenticated';
import { RequireRole } from '@/routes/guards/RequireRole';
import { RoleRedirect } from '@/routes/RoleRedirect';

const router = createBrowserRouter([
  { path: '/', element: <RoleRedirect /> },
  {
    path: '/sign-in',
    element: (
      <PublicOnlyRoute>
        <SignInPage />
      </PublicOnlyRoute>
    ),
  },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '/access-error', element: <AuthErrorPage /> },
  {
    path: '/student',
    element: (
      <RequireAuthenticated>
        <RequireRole allowedRoles={['student']}>
          <StudentDashboardPage />
        </RequireRole>
      </RequireAuthenticated>
    ),
  },
  {
    path: '/teacher',
    element: (
      <RequireAuthenticated>
        <RequireRole allowedRoles={['teacher']}>
          <TeacherDashboardPage />
        </RequireRole>
      </RequireAuthenticated>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAuthenticated>
        <RequireRole allowedRoles={['admin']}>
          <AdminLayout />
        </RequireRole>
      </RequireAuthenticated>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'classes', element: <ClassesPage /> },
      { path: 'school-years', element: <SchoolYearsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'logs', element: <LogsPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
]);

export function AppRouter() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return <RouterProvider router={router} />;
}
