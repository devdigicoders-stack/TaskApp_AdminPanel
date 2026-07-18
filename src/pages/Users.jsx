import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiEdit2, FiTrash2, FiUserPlus, FiUser, FiSearch, FiBell } from 'react-icons/fi';

const ROLES = ['admin', 'manager', 'user'];

function Badge({ value }) {
  return <span className={`badge badge-${value}`}>{value}</span>;
}

function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user?._id;
  const [form, setForm] = useState(
    isEdit
      ? { name: user.name, email: user.email, role: user.role, isActive: user.isActive, coins: user.coins || 0 }
      : { name: '', email: '', password: '', role: 'user' }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/users/${user._id}`, form);
        toast.success('User updated!');
      } else {
        await api.post('/auth/register', form);
        toast.success('User created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <span style={{ marginRight: 8, verticalAlign: 'middle' }}>
              {isEdit ? <FiEdit2 /> : <FiUserPlus />}
            </span>
            {isEdit ? 'Edit User' : 'New User'}
          </h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} id="user-modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input id="user-name" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input id="user-email" type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="john@example.com" />
            </div>
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input id="user-password" type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 characters" minLength={6} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select id="user-role" className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {isEdit && (
              <>
                <div className="form-group">
                  <label className="form-label">Coins</label>
                  <input id="user-coins" type="number" className="form-input" value={form.coins} onChange={(e) => setForm({ ...form, coins: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      id="user-active"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      style={{ accentColor: 'var(--accent-purple)', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Active Account</span>
                  </label>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="user-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotificationModal({ targetUser, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', message: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/notifications', { ...form, userId: targetUser?._id || null });
      toast.success(targetUser ? 'Notification sent to user!' : 'Broadcast notification sent!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending notification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <span style={{ marginRight: 8, verticalAlign: 'middle' }}>
              <FiBell />
            </span>
            {targetUser ? `Notify ${targetUser.name}` : 'Send Broadcast'}
          </h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Special Offer!" />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="Notification content..." rows={4} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [notifyModal, setNotifyModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Users <FiUsers />
          </h1>
          <p className="page-subtitle">Manage team members and roles</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setNotifyModal('broadcast')}>
            <FiBell style={{ marginRight: '6px' }} /> Broadcast
          </button>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <FiUserPlus style={{ marginRight: '6px' }} /> New User
          </button>
        </div>
      </div>

      <div className="filters-row">
        <div className="search-bar">
          <FiSearch />
          <input id="user-search" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select id="filter-role" className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon" style={{ fontSize: '2rem' }}><FiUsers /></div>
            <h3>No users found</h3>
            <p>Add your first team member</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Coins</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.email}</td>
                  <td><Badge value={user.role} /></td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{user.coins || 0}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-active' : 'badge-high'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(user.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setModal(user)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-primary" onClick={() => setNotifyModal(user)}><FiBell /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteUser(user._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <UserModal
          user={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchUsers(); }}
        />
      )}

      {notifyModal && (
        <NotificationModal
          targetUser={notifyModal === 'broadcast' ? null : notifyModal}
          onClose={() => setNotifyModal(null)}
          onSave={() => setNotifyModal(null)}
        />
      )}
    </div>
  );
}
