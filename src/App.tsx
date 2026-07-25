import { Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute'
import { RequireRole } from './components/routing/RequireRole'
import { AdminPage } from './pages/AdminPage'
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
            <AdminPage />
          </RequireRole>
        </ProtectedRoute>
      }
    />
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
