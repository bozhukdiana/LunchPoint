import { Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute'
import { RequireRole } from './components/routing/RequireRole'
import { AdminClassesPage } from './pages/admin/AdminClassesPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminLayoutPage } from './pages/admin/AdminLayoutPage'
import { AdminLogsPage } from './pages/admin/AdminLogsPage'
import { AdminSchoolYearsPage } from './pages/admin/AdminSchoolYearsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AuthGatePage } from './pages/AuthGatePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SignInPage } from './pages/SignInPage'
import { StudentPage } from './pages/StudentPage'
import { TeacherPage } from './pages/TeacherPage'

const App = () => (
  <Routes>
    <Route
      path="/signin"
      element={
        <PublicOnlyRoute>
          <SignInPage />
        </PublicOnlyRoute>
      }
    />
    <Route path="/auth-gate" element={<AuthGatePage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <RequireRole role="admin">
            <AdminLayoutPage />
          </RequireRole>
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboardPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="classes" element={<AdminClassesPage />} />
      <Route path="school-years" element={<AdminSchoolYearsPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
      <Route path="logs" element={<AdminLogsPage />} />
    </Route>
    <Route
      path="/teacher"
      element={
        <ProtectedRoute>
          <RequireRole role="teacher">
            <TeacherPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route
      path="/student"
      element={
        <ProtectedRoute>
          <RequireRole role="student">
            <StudentPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default App
