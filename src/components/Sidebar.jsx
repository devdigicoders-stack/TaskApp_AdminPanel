import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPieChart, FiCheckSquare, FiFolder, FiTarget, FiInbox, FiDollarSign, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';

const NAV_ITEMS = [
  { to: '/', icon: <FiPieChart />, label: 'Dashboard', id: 'nav-dashboard' },
  { to: '/tasks', icon: <FiCheckSquare />, label: 'Tasks', id: 'nav-tasks' },
  { to: '/projects', icon: <FiFolder />, label: 'Projects', id: 'nav-projects' },
  { to: '/campaigns', icon: <FiTarget />, label: 'Campaigns', id: 'nav-campaigns' },
  { to: '/submissions', icon: <FiInbox />, label: 'Task Approvals', id: 'nav-submissions', badge: 'pending' },
  { to: '/withdrawals', icon: <FiDollarSign />, label: 'Withdrawals', id: 'nav-withdrawals' },
  { to: '/users', icon: <FiUsers />, label: 'Users', id: 'nav-users' },
  { to: '/settings', icon: <FiSettings />, label: 'Settings', id: 'nav-settings' },
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
      <div className="sidebar-logo" style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="TaskApp Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
        <div>
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>TaskApp</h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>Admin Panel</p>
        </div>
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
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
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
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--accent-red)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </aside>
  );
}
