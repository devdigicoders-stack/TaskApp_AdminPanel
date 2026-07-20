import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiImage, FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiEdit2 } from 'react-icons/fi';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({ title: '', image: '', linkUrl: '', isActive: true, order: 0 });

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/banners');
      setBanners(data.banners || []);
    } catch { toast.error('Failed to load banners'); }
    finally   { setLoading(false); }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', image: '', linkUrl: '', isActive: true, order: banners.length });
    setModal(true);
  };

  const openEdit = (b) => {
    setEditingId(b._id);
    setForm({ title: b.title, image: b.image, linkUrl: b.linkUrl, isActive: b.isActive, order: b.order ?? 0 });
    setModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be < 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) { toast.error('Please upload or provide an image'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, form);
        toast.success('Banner updated!');
      } else {
        await api.post('/banners', form);
        toast.success('Banner created!');
      }
      setModal(false);
      fetchBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally { setSaving(false); }
  };

  const handleToggle = async (b) => {
    try {
      await api.put(`/banners/${b._id}`, { isActive: !b.isActive });
      toast.success(b.isActive ? 'Banner hidden' : 'Banner shown');
      fetchBanners();
    } catch { toast.error('Failed to toggle banner'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch { toast.error('Failed to delete'); }
  };

  const isBase64 = (s) => s && s.startsWith('data:');
  const isUrl    = (s) => s && (s.startsWith('http://') || s.startsWith('https://'));

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiImage /> Home Screen Banners
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Upload images to display as a sliding banner on the app home screen.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Add Banner
        </button>
      </div>

      {/* Info Box */}
      <div style={{
        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 12, padding: '14px 18px', marginBottom: 28,
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <FiImage size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong>
          {' '}Images are shown as an auto-sliding banner at the very top of the app's Tasks screen.
          Use <strong>16:9 ratio</strong> images (e.g. 1280×720px) for best results. Toggle the switch to show/hide.
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : banners.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <FiImage size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ color: 'var(--text-muted)', marginBottom: 8 }}>No banners yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click "Add Banner" to create your first slider image.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {banners.map((b, idx) => (
            <div key={b._id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px',
              borderLeft: `3px solid ${b.isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              opacity: b.isActive ? 1 : 0.6,
            }}>
              {/* Order badge */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.85rem', flexShrink: 0,
              }}>
                {idx + 1}
              </div>

              {/* Preview */}
              <div style={{
                width: 160, height: 90, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              }}>
                {(isBase64(b.image) || isUrl(b.image)) ? (
                  <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiImage size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 4 }}>
                  {b.title || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No title</span>}
                </div>
                {b.linkUrl && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🔗 {b.linkUrl}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Order: {b.order ?? idx} &nbsp;•&nbsp;
                  {b.isActive
                    ? <span style={{ color: 'var(--accent-green)' }}>● Visible</span>
                    : <span style={{ color: 'var(--text-muted)' }}>○ Hidden</span>
                  }
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '1.2rem', padding: '6px 10px', color: b.isActive ? 'var(--accent-green)' : 'var(--text-muted)' }}
                  onClick={() => handleToggle(b)}
                  title={b.isActive ? 'Hide banner' : 'Show banner'}
                >
                  {b.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
                <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => openEdit(b)} title="Edit">
                  <FiEdit2 />
                </button>
                <button className="btn btn-ghost" style={{ padding: '6px 10px', color: 'var(--accent-red)' }} onClick={() => handleDelete(b._id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Image Upload */}
                <div className="form-group">
                  <label className="form-label">Banner Image *</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        value={isBase64(form.image) ? '(Uploaded image)' : form.image}
                        onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                        placeholder="https://... or upload file below"
                        readOnly={isBase64(form.image)}
                        style={{ opacity: isBase64(form.image) ? 0.6 : 1 }}
                      />
                    </div>
                    <div>
                      <input type="file" id="banner-img" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      <label htmlFor="banner-img" className="btn btn-secondary" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        📁 Upload
                      </label>
                    </div>
                  </div>
                  {/* Preview */}
                  {form.image && (isBase64(form.image) || isUrl(form.image)) && (
                    <div style={{ marginTop: 12, position: 'relative' }}>
                      <img
                        src={form.image}
                        alt="Preview"
                        style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-color)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, image: '' }))}
                        style={{
                          position: 'absolute', top: 8, right: 8,
                          background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                          borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: 14,
                        }}
                      >✕</button>
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Recommended: 16:9 ratio (e.g. 1280×720px), max 5MB
                  </p>
                </div>

                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Title (Optional)</label>
                  <input
                    className="form-input"
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Special Offer This Week!"
                  />
                </div>

                {/* Link */}
                <div className="form-group">
                  <label className="form-label">Link URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={form.linkUrl}
                    onChange={(e) => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    If set, tapping the banner will open this URL.
                  </p>
                </div>

                {/* Order */}
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.order}
                    onChange={(e) => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                    placeholder="0 = first"
                  />
                </div>

                {/* Active toggle */}
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="checkbox"
                    id="banner-active"
                    checked={form.isActive}
                    onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent-purple)' }}
                  />
                  <label htmlFor="banner-active" className="form-label" style={{ marginBottom: 0 }}>
                    Active (visible in app)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
