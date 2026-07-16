import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiFolder, FiFolderPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const STATUSES = ['planning', 'active', 'on-hold', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

function Badge({ value }) {
  const cls = value?.replace(' ', '-') || '';
  return <span className={`badge badge-${cls}`}>{value}</span>;
}

function ProjectModal({ project, users, onClose, onSave }) {
  const [form, setForm] = useState(
    project || { name: '', description: '', status: 'planning', priority: 'medium', startDate: '', endDate: '', members: [] }
  );
  const [saving, setSaving] = useState(false);

  const toggleMember = (id) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      if (project?._id) {
        await api.put(`/projects/${project._id}`, payload);
        toast.success('Project updated!');
      } else {
        await api.post('/projects', payload);
        toast.success('Project created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving project');
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
              {project?._id ? <FiEdit2 /> : <FiFolderPlus />}
            </span>
            {project?._id ? 'Edit Project' : 'New Project'}
          </h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} id="proj-modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input id="proj-name" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Project name..." />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea id="proj-desc" className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="proj-status" className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select id="proj-priority" className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input id="proj-start" type="date" className="form-input" value={form.startDate ? form.startDate.slice(0, 10) : ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input id="proj-end" type="date" className="form-input" value={form.endDate ? form.endDate.slice(0, 10) : ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Team Members</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto', padding: '4px 0' }}>
                {users.map((u) => (
                  <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: form.members.includes(u._id) ? 'rgba(139,92,246,0.1)' : 'transparent', border: form.members.includes(u._id) ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent', transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} style={{ accentColor: 'var(--accent-purple)' }} />
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{u.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.role}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="proj-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : project?._id ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, userRes] = await Promise.all([api.get('/projects'), api.get('/users')]);
      setProjects(projRes.data.projects);
      setUsers(userRes.data.users);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Projects <FiFolder />
          </h1>
          <p className="page-subtitle">Manage all your projects</p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={() => setModal('create')}>
          <FiFolderPlus style={{ marginRight: '6px' }} /> New Project
        </button>
      </div>

      <div className="filters-row">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input id="project-search" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select id="filter-proj-status" className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon" style={{ fontSize: '2rem' }}><FiFolder /></div>
            <h3>No projects found</h3>
            <p>Create your first project to get started</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((proj) => (
            <div key={proj._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }} className="truncate">{proj.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{proj.description || 'No description'}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => setModal(proj)}><FiEdit2 /></button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteProject(proj._id)}><FiTrash2 /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge value={proj.status} />
                <Badge value={proj.priority} />
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>📅 {formatDate(proj.startDate)} → {formatDate(proj.endDate)}</span>
              </div>

              {proj.members?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ display: 'flex' }}>
                    {proj.members.slice(0, 4).map((m, i) => (
                      <div key={m._id} className="avatar" title={m.name} style={{ width: 28, height: 28, fontSize: '0.7rem', marginLeft: i > 0 ? -8 : 0, border: '2px solid var(--bg-card)', zIndex: proj.members.length - i }}>
                        {m.name?.charAt(0)}
                      </div>
                    ))}
                  </div>
                  {proj.members.length > 4 && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{proj.members.length - 4}</span>}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>{proj.members.length} member{proj.members.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProjectModal
          project={modal === 'create' ? null : modal}
          users={users}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
