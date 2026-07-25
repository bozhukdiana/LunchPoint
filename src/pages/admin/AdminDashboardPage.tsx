import { Link } from 'react-router-dom'

const cards = [
  { to: '/users', title: 'Користувачі', description: 'Створення, редагування та активація користувачів' },
  { to: '/classes', title: 'Класи', description: 'Керування класами та призначенням класних керівників' },
  { to: '/school-years', title: 'Навчальні роки', description: 'Активація та архівація навчальних років' },
  { to: '/settings', title: 'Налаштування', description: 'Загальні параметри системи' },
  { to: '/logs', title: 'Логи', description: 'Перегляд журналу дій' },
]

export const AdminDashboardPage = () => (
  <>
    <h2>Панель адміністратора</h2>
    <div className="admin-cards-grid">
      {cards.map((card) => (
        <Link key={card.to} to={card.to} className="admin-card-link">
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </Link>
      ))}
    </div>
  </>
)
