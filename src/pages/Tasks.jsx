import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiCheckSquare, FiPlusSquare, FiEdit2, FiTrash2 } from 'react-icons/fi';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function Badge({ value, type = 'status' }) {
  const cls = value?.replace(' ', '-') || '';
  return <span className={`badge badge-${cls}`}>{value}</span>;
}

function TaskModal({ task, projects, users, onClose, onSave }) {
  const [form, setForm] = useState(
    task || { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', project: '', assignedTo: '', tags: '' }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [] };
      if (!payload.project) delete payload.project;
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;

      if (task?._id) {
        await api.put(`/tasks/${task._id}`, payload);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
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
              {task?._id ? <FiEdit2 /> : <FiPlusSquare />}
            </span>
            {task?._id ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} id="task-modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input id="task-title" className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Task title..." />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea id="task-desc" className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the task..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="task-status" className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select id="task-priority" className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project</label>
                <select id="task-project" className="form-select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                  <option value="">No project</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select id="task-assign" className="form-select" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input id="task-due" type="date" className="form-input" value={form.dueDate ? form.dueDate.slice(0, 10) : ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input id="task-tags" className="form-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="design, frontend..." />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="task-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : task?._id ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | task object
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [taskRes, projRes, userRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users'),
      ]);
      setTasks(taskRes.data.tasks);
      setProjects(projRes.data.projects);
      setUsers(userRes.data.users);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    const matchPriority = filterPriority ? t.priority === filterPriority : true;
    return matchSearch && matchStatus && matchPriority;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Tasks <FiCheckSquare />
          </h1>
          <p className="page-subtitle">Manage and track all tasks</p>
        </div>
        <button id="create-task-btn" className="btn btn-primary" onClick={() => setModal('create')}>
          + New Task
        </button>
      </div>

      <div className="filters-row">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input id="task-search" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select id="filter-status" className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select id="filter-priority" className="filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priority</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon" style={{ fontSize: '2rem' }}><FiCheckSquare /></div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task._id}>
                  <td>
                    <div style={{ fontWeight: 600, maxWidth: 200 }} className="truncate">{task.title}</div>
                    {task.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        {task.tags.map((tag) => (
                          <span key={tag} style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)', padding: '1px 6px', borderRadius: 4 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td><Badge value={task.status} /></td>
                  <td><Badge value={task.priority} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{task.project?.name || '—'}</td>
                  <td>
                    {task.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.65rem' }}>
                          {task.assignedTo.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>{task.assignedTo.name}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(task.dueDate)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setModal(task)}><FiEdit2 /></button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteTask(task._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          projects={projects}
          users={users}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
