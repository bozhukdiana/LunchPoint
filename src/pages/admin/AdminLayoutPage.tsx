import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/', label: 'Панель' },
  { to: '/users', label: 'Користувачі' },
  { to: '/classes', label: 'Класи' },
  { to: '/school-years', label: 'Навчальні роки' },
  { to: '/settings', label: 'Налаштування' },
  { to: '/logs', label: 'Логи' },
]

export const AdminLayoutPage = () => {
  const { firebaseUser, signOutUser } = useAuth()

  return (
    <main className="admin-layout">
      <header className="admin-header">
        <div>
          <h1>LunchPoint Admin</h1>
          <p>{firebaseUser?.email}</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => void signOutUser()}>
          Вийти
        </button>
      </header>
      <nav className="admin-nav" aria-label="Admin navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <section className="admin-content">
        <Outlet />
      </section>
    </main>
  )
}
