import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiEdit2, FiTrash2, FiUserPlus, FiUser, FiSearch, FiBell, FiShoppingBag } from 'react-icons/fi';

const ROLES = ['admin', 'manager', 'merchant'];

function Badge({ value }) {
  return <span className={`badge badge-${value}`}>{value}</span>;
}

function MerchantModal({ merchant, onClose, onSave }) {
  const isEdit = !!merchant?._id;
  const [form, setForm] = useState(
    isEdit
      ? { name: merchant.name, email: merchant.email, shopName: merchant.shopName || '', role: merchant.role, isActive: merchant.isActive }
      : { name: '', email: '', password: '', shopName: '', role: 'merchant' }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/merchants/${merchant._id}`, form);
        toast.success('Merchant updated!');
      } else {
        await api.post('/merchants', form);
        toast.success('Merchant created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving merchant');
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
            {isEdit ? 'Edit Merchant' : 'New Merchant'}
          </h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} id="merchant-modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input id="merchant-name" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input id="merchant-email" type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input id="merchant-shop" className="form-input" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="Awesome Store" />
            </div>
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input id="merchant-password" type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 characters" minLength={6} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select id="merchant-role" className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {isEdit && (
              <>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      id="merchant-active"
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
            <button id="merchant-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Merchant' : 'Create Merchant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotificationModal({ targetMerchant, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', message: '', image: '' });
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/notifications', { ...form, merchantId: targetMerchant?._id || null });
      toast.success(targetMerchant ? 'Notification sent to merchant!' : 'Broadcast notification sent!');
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
            {targetMerchant ? `Notify ${targetMerchant.name}` : 'Send Broadcast'}
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
            <div className="form-group">
              <label className="form-label">Image URL (Optional)</label>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })} 
              />
              {form.image && (
                <div style={{ marginTop: '10px' }}>
                  <img src={form.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }} onError={(e) => e.target.style.display='none'} />
                </div>
              )}
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

export default function Merchants() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [notifyModal, setNotifyModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => { fetchMerchants(); }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/merchants');
      setMerchants(data.merchants);
    } catch {
      toast.error('Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const deleteMerchant = async (id) => {
    if (!confirm('Delete this merchant?')) return;
    try {
      await api.delete(`/merchants/${id}`);
      toast.success('Merchant deleted');
      fetchMerchants();
    } catch {
      toast.error('Failed to delete merchant');
    }
  };

  const filtered = merchants.filter((u) => {
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
            Merchants <FiShoppingBag />
          </h1>
          <p className="page-subtitle">Manage team members and roles</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setNotifyModal('broadcast')}>
            <FiBell style={{ marginRight: '6px' }} /> Broadcast
          </button>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <FiUserPlus style={{ marginRight: '6px' }} /> New Merchant
          </button>
        </div>
      </div>

      <div className="filters-row">
        <div className="search-bar">
          <FiSearch />
          <input id="merchant-search" placeholder="Search merchants..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <div className="icon" style={{ fontSize: '2rem' }}><FiShoppingBag /></div>
            <h3>No merchants found</h3>
            <p>Add your first team member</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Coins</th>
                <th>FCM Token</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((merchant) => (
                <tr key={merchant._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar">{merchant.name?.charAt(0)?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{merchant.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{merchant.email}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{merchant.mobileNumber || 'N/A'}</td>
                  <td><Badge value={merchant.role} /></td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{merchant.coins || 0}</td>
                  <td>
                    {merchant.fcmToken ? (
                      <span title={merchant.fcmToken} className="badge badge-active" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {merchant.fcmToken.substring(0, 8)}...
                      </span>
                    ) : (
                      <span className="badge badge-high">None</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${merchant.isActive ? 'badge-active' : 'badge-high'}`}>
                      {merchant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(merchant.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setModal(merchant)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-primary" onClick={() => setNotifyModal(merchant)}><FiBell /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteMerchant(merchant._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <MerchantModal
          merchant={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchMerchants(); }}
        />
      )}

      {notifyModal && (
        <NotificationModal
          targetMerchant={notifyModal === 'broadcast' ? null : notifyModal}
          onClose={() => setNotifyModal(null)}
          onSave={() => setNotifyModal(null)}
        />
      )}
    </div>
  );
}
