import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiGift, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function Gifts() {
  const [gifts, setGifts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    requiredCoins: '',
    image: '',
    merchant: '',
    isActive: true,
    maxRedemptionsPerUser: 0,
  });

  useEffect(() => {
    fetchGifts();
    fetchMerchants();
  }, []);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/gifts');
      setGifts(data.gifts);
    } catch {
      toast.error('Failed to load gifts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMerchants = async () => {
    try {
      const { data } = await api.get('/merchants');
      setMerchants(data.merchants || []);
    } catch {
      toast.error('Failed to load merchants');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.merchant) {
      toast.error('Please assign a merchant to this gift');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/gifts/${editingId}`, form);
        toast.success('Gift updated');
      } else {
        await api.post('/gifts', form);
        toast.success('Gift created');
      }
      setModal(false);
      fetchGifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save gift');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (g) => {
    setForm({
      name: g.name,
      description: g.description,
      requiredCoins: g.requiredCoins,
      image: g.image,
      merchant: g.merchant?._id || g.merchant || '',
      isActive: g.isActive,
      maxRedemptionsPerUser: g.maxRedemptionsPerUser ?? 0,
    });
    setEditingId(g._id);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gift?')) return;
    try {
      await api.delete(`/gifts/${id}`);
      toast.success('Gift deleted');
      fetchGifts();
    } catch {
      toast.error('Failed to delete gift');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Gifts <FiGift />
          </h1>
          <p className="page-subtitle">Manage gifts and coupons for users</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingId(null);
          setForm({ name: '', description: '', requiredCoins: '', image: '', merchant: merchants[0]?._id || '', isActive: true, maxRedemptionsPerUser: 0 });
          setModal(true);
        }}>
          <FiPlus /> New Gift
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : gifts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FiGift style={{ fontSize: '2rem', color: 'var(--text-muted)' }} />
            <h3>No gifts found</h3>
            <p>Add a new gift to reward users.</p>
          </div>
        </div>
      ) : (
        <div className="grid">
          {gifts.map((g) => (
            <div key={g._id} className="card">
              <div style={{ display: 'flex', gap: 16 }}>
                {g.image ? (
                  <img src={g.image} alt={g.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 80, height: 80, backgroundColor: 'var(--bg-tertiary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiGift size={32} color="var(--text-muted)" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{g.name}</h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{g.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{g.requiredCoins} Coins</span>
                    <span className={`badge badge-${g.isActive ? 'active' : 'pending'}`}>{g.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-blue, #3b82f6)', marginTop: 6, fontWeight: 500 }}>
                    🏪 Merchant: {g.merchant?.shopName ? `${g.merchant.shopName} (${g.merchant.name})` : (g.merchant?.name || 'Unassigned')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    🔁 Max per user: {g.maxRedemptionsPerUser > 0 ? g.maxRedemptionsPerUser : 'Unlimited'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.875rem' }} onClick={() => handleEdit(g)}><FiEdit2 /> Edit</button>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--accent-red)' }} onClick={() => handleDelete(g._id)}><FiTrash2 /> Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Gift' : 'New Gift'}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amazon ₹100 Voucher" />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Merchant *</label>
                  <select
                    className="form-input"
                    required
                    value={form.merchant}
                    onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                  >
                    <option value="">-- Select Merchant --</option>
                    {merchants.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.shopName ? `${m.shopName} (${m.name})` : m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." rows={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Coins *</label>
                  <input type="number" min="1" className="form-input" required value={form.requiredCoins} onChange={(e) => setForm({ ...form, requiredCoins: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Image (Upload or URL)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" className="form-input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://... or upload" style={{ flex: 1 }} />
                    <input type="file" id="gift-image" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <label htmlFor="gift-image" className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                      Upload
                    </label>
                  </div>
                  {form.image && (
                    <div style={{ marginTop: '8px' }}>
                      <img src={form.image} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Max Redemptions Per User</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.maxRedemptionsPerUser}
                    onChange={(e) => setForm({ ...form, maxRedemptionsPerUser: Number(e.target.value) })}
                    placeholder="0 = Unlimited"
                  />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    0 = Unlimited. Set to 1 to allow only 1 redemption per user.
                  </p>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  <label htmlFor="isActive" className="form-label" style={{ marginBottom: 0 }}>Active (Visible to users)</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
