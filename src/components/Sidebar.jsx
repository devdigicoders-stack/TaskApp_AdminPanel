import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: 'Dashboard', id: 'nav-dashboard' },
  { to: '/tasks', icon: '📋', label: 'Tasks', id: 'nav-tasks' },
  { to: '/projects', icon: '🗂️', label: 'Projects', id: 'nav-projects' },
  { to: '/campaigns', icon: '🎯', label: 'Campaigns', id: 'nav-campaigns' },
  { to: '/submissions', icon: '📥', label: 'Task Approvals', id: 'nav-submissions', badge: 'pending' },
  { to: '/withdrawals', icon: '💸', label: 'Withdrawals', id: 'nav-withdrawals' },
  { to: '/users', icon: '👥', label: 'Users', id: 'nav-users' },
  { to: '/settings', icon: '⚙️', label: 'Settings', id: 'nav-settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1><span>✅</span> TaskFlow</h1>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Admin Panel</p>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-label">Main Menu</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            id={item.id}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="user-info">
            <div className="name">{user?.name || 'Admin'}</div>
            <div className="role">{user?.role}</div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: 4, transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--accent-red)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}
