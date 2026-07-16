import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlay, FiMonitor, FiEye, FiCamera, FiHeart, FiTwitter, FiThumbsUp, FiSend, FiGlobe, FiBook, FiFileText, FiSmartphone, FiTarget, FiEdit2, FiUsers, FiUser, FiLink, FiCheck, FiDollarSign, FiSearch, FiTrash2, FiPlus } from 'react-icons/fi';

// ─── Constants ────────────────────────────────────────────────
const TASK_TYPES = [
  { value: 'youtube_likes',        icon: <FiPlay />,  label: 'YT Likes' },
  { value: 'youtube_subscribers',  icon: <FiMonitor />,  label: 'YT Subs' },
  { value: 'youtube_views',        icon: <FiEye />,  label: 'YT Views' },
  { value: 'instagram_followers',  icon: <FiCamera />,  label: 'IG Follow' },
  { value: 'instagram_likes',      icon: <FiHeart />,  label: 'IG Likes' },
  { value: 'twitter_followers',    icon: <FiTwitter />,  label: 'X Follow' },
  { value: 'twitter_likes',        icon: <FiThumbsUp />,  label: 'X Likes' },
  { value: 'telegram_join',        icon: <FiSend />,  label: 'Telegram' },
  { value: 'website_visit',        icon: <FiGlobe />,  label: 'Website' },
  { value: 'homework',             icon: <FiBook />,  label: 'Homework' },
  { value: 'survey',               icon: <FiFileText />,  label: 'Survey' },
  { value: 'app_download',         icon: <FiSmartphone />,  label: 'App DL' },
  { value: 'custom',               icon: <FiTarget />,  label: 'Custom' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  taskType: 'youtube_likes',
  customTaskType: '',
  targetUrl: '',
  targetCount: '',
  coinsReward: '',
  isActive: true,
  expiresAt: '',
};

// ─── Helpers ──────────────────────────────────────────────────
function getTaskTypeInfo(value) {
  return TASK_TYPES.find((t) => t.value === value) || { icon: <FiTarget />, label: value };
}

function formatNumber(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_00_00_000) return (n / 1_00_00_000).toFixed(1) + 'Cr';
  if (n >= 1_00_000) return (n / 1_00_000).toFixed(1) + 'L';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Campaign Modal (Create / Edit) ──────────────────────────
function CampaignModal({ campaign, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    if (campaign) {
      const isCustomType = campaign.taskType !== 'custom' && !TASK_TYPES.some(t => t.value === campaign.taskType);
      return {
        ...campaign,
        taskType: isCustomType ? 'custom' : campaign.taskType,
        customTaskType: isCustomType ? campaign.taskType : (campaign.taskType === 'custom' ? 'custom' : ''),
        expiresAt: campaign.expiresAt ? campaign.expiresAt.slice(0, 16) : '',
        tags: '',
      };
    }
    return { ...EMPTY_FORM };
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        taskType: form.taskType === 'custom' && form.customTaskType ? form.customTaskType.trim() : form.taskType,
        targetCount: Number(form.targetCount),
        coinsReward: Number(form.coinsReward),
        expiresAt: form.expiresAt || null,
      };

        if (campaign?._id) {
          await api.put(`/campaigns/${campaign._id}`, payload);
          toast.success('Task updated!');
        } else {
          await api.post('/campaigns', payload);
          toast.success('Task created!');
        }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640, width: '95vw' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span style={{ marginRight: 8, verticalAlign: 'middle' }}>
              {campaign?._id ? <FiEdit2 /> : <FiTarget />}
            </span>
            {campaign?._id ? 'Edit Task' : 'New Task'}
          </h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} id="campaign-modal-close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Task Type Selector */}
            <div className="form-group">
              <label className="form-label">Task Type *</label>
              <div className="task-type-grid">
                {TASK_TYPES.map((t) => (
                  <div
                    key={t.value}
                    className={`task-type-option ${form.taskType === t.value ? 'selected' : ''}`}
                    onClick={() => set('taskType', t.value)}
                    id={`task-type-${t.value}`}
                  >
                    <span className="icon">{t.icon}</span>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {form.taskType === 'custom' && (
              <div className="form-group">
                <label className="form-label">Custom Task Type *</label>
                <input
                  className="form-input"
                  value={form.customTaskType}
                  onChange={(e) => set('customTaskType', e.target.value)}
                  required
                  placeholder="e.g. read_book, physical_workout"
                />
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                id="campaign-title"
                className="form-input"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                required
                placeholder="e.g. Like our latest YouTube video and earn coins!"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                id="campaign-desc"
                className="form-textarea"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe what user needs to do..."
                rows={2}
              />
            </div>

            {/* Target URL */}
            <div className="form-group">
              <label className="form-label">Resource Link / URL (Optional) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Video link, Form link, etc.)</span></label>
              <div className="url-input-wrapper">
                <input
                  id="campaign-url"
                  className="form-input"
                  type="url"
                  value={form.targetUrl}
                  onChange={(e) => set('targetUrl', e.target.value)}
                  placeholder="https://example.com/..."
                />
                <span className="url-icon"><FiLink /></span>
              </div>
            </div>

            {/* Target Count + Coins Reward */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Max Completions * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(target number)</span></label>
                <input
                  id="campaign-target"
                  className="form-input"
                  type="number"
                  min="1"
                  value={form.targetCount}
                  onChange={(e) => set('targetCount', e.target.value)}
                  required
                  placeholder="e.g. 100000"
                />
                {form.targetCount && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', marginTop: 4 }}>
                    = {formatNumber(Number(form.targetCount))}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Coins Reward *</label>
                <div className="coins-input-wrapper">
                  <span className="coins-symbol"><FiDollarSign /></span>
                  <input
                    id="campaign-coins"
                    className="form-input"
                    type="number"
                    min="1"
                    value={form.coinsReward}
                    onChange={(e) => set('coinsReward', e.target.value)}
                    required
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            {/* Expiry Date + Active Toggle */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expiry Date <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="campaign-expires"
                  className="form-input"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => set('expiresAt', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <label className="form-label">Status</label>
                <label className="toggle-switch" style={{ marginTop: 6 }}>
                  <input
                    id="campaign-active"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => set('isActive', e.target.checked)}
                  />
                  <span className="toggle-track" />
                  <span style={{ fontSize: '0.85rem', color: form.isActive ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="campaign-save" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : campaign?._id ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Completions Modal ────────────────────────────────────────
function CompletionsModal({ campaign, onClose }) {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/campaigns/${campaign._id}/completions`)
      .then((r) => setCompletions(r.data.completions))
      .catch(() => toast.error('Failed to load completions'))
      .finally(() => setLoading(false));
  }, [campaign._id]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500, width: '95vw' }}>
        <div className="modal-header">
          <h2 className="modal-title"><FiUsers style={{marginRight: 8}}/> Completions — {campaign.title}</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : completions.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="icon"><FiUser /></div>
              <p>No one has completed this task yet</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                <span className="coin-badge"><FiDollarSign style={{marginRight: 2}}/> {campaign.coinsReward} coins</span> rewarded to each of <strong>{completions.length}</strong> user(s)
              </p>
              <div className="completions-list">
                {completions.map((c, i) => (
                  <div className="completion-item" key={i}>
                    <div className="avatar">
                      {c.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="completion-item-info">
                      <div className="completion-item-name">{c.user?.name || 'Unknown'}</div>
                      <div className="completion-item-date">{c.user?.email}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                      {formatDateTime(c.completedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Campaign Card ────────────────────────────────────────────
function CampaignCard({ campaign, onEdit, onDelete, onViewCompletions, onToggleActive }) {
  const typeInfo = getTaskTypeInfo(campaign.taskType);
  const cardClass = ['campaign-card', !campaign.isActive ? 'inactive' : '', campaign.isExpired ? 'expired' : ''].join(' ').trim();

  let statusEl;
  if (campaign.isExpired)    statusEl = <span className="status-expired">Expired</span>;
  else if (!campaign.isActive) statusEl = <span className="status-inactive">Inactive</span>;
  else                        statusEl = <span className="status-active">Active</span>;

  return (
    <div className={cardClass}>
      {/* Header */}
      <div className="campaign-card-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            <span className={`task-type-badge ${campaign.taskType}`}>
              {typeInfo.icon} {typeInfo.label}
            </span>
            {statusEl}
          </div>
          <div className="campaign-card-title">{campaign.title}</div>
        </div>
        <span className="coin-badge"><FiDollarSign style={{marginRight: 2}}/> {campaign.coinsReward}</span>
      </div>

      {/* Description */}
      {campaign.description && (
        <div className="campaign-card-desc">{campaign.description}</div>
      )}

      {/* Meta info */}
      <div className="campaign-meta">
        <span className="campaign-meta-item">
          <FiTarget style={{marginRight: 4}}/> Target: <strong>{formatNumber(campaign.targetCount)}</strong>
        </span>
        <button
          className="completion-pill"
          onClick={() => onViewCompletions(campaign)}
          title="View who completed"
          id={`completions-${campaign._id}`}
          style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
        >
          <FiCheck style={{marginRight: 4}}/> {campaign.completionsCount} completed
        </button>
        {campaign.expiresAt && (
          <span className="campaign-meta-item">
            ⏰ {campaign.isExpired ? 'Expired' : 'Expires'}: {formatDate(campaign.expiresAt)}
          </span>
        )}
      </div>

      {/* URL */}
      <a
        href={campaign.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '0.75rem',
          color: 'var(--accent-blue)',
          textDecoration: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
        }}
        title={campaign.targetUrl}
      >
        <FiLink style={{marginRight: 4}}/> {campaign.targetUrl}
      </a>

      {/* Actions */}
      <div className="campaign-card-actions">
        <label className="toggle-switch" title={campaign.isActive ? 'Deactivate' : 'Activate'}>
          <input
            type="checkbox"
            checked={campaign.isActive}
            onChange={() => onToggleActive(campaign)}
            id={`toggle-${campaign._id}`}
          />
          <span className="toggle-track" />
        </label>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => onEdit(campaign)}
          id={`edit-campaign-${campaign._id}`}
          title="Edit"
        >
          <FiEdit2 style={{marginRight: 4}}/> Edit
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(campaign._id)}
          id={`delete-campaign-${campaign._id}`}
          title="Delete"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}

// ─── Stats Strip ──────────────────────────────────────────────
function StatsStrip({ stats }) {
  if (!stats) return null;
  return (
    <div className="stats-grid" style={{ marginBottom: 24 }}>
      <div className="stat-card purple">
        <div className="stat-icon purple"><FiTarget /></div>
        <div className="stat-info">
          <div className="value" style={{ color: 'var(--accent-purple)' }}>{stats.total ?? 0}</div>
          <div className="label">Total Tasks</div>
        </div>
      </div>
      <div className="stat-card green">
        <div className="stat-icon green"><FiCheck /></div>
        <div className="stat-info">
          <div className="value" style={{ color: 'var(--accent-green)' }}>{stats.active ?? 0}</div>
          <div className="label">Active</div>
        </div>
      </div>
      <div className="stat-card orange">
        <div className="stat-icon orange"><FiCheck /></div>
        <div className="stat-info">
          <div className="value" style={{ color: 'var(--accent-orange)' }}>{stats.totalCompletions ?? 0}</div>
          <div className="label">Total Completions</div>
        </div>
      </div>
      <div className="stat-card blue">
        <div className="stat-icon blue"><FiDollarSign /></div>
        <div className="stat-info">
          <div className="value" style={{ color: 'var(--accent-blue)' }}>{formatNumber(stats.totalCoinsDistributed ?? 0)}</div>
          <div className="label">Coins Distributed</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);        // null | 'create' | campaign object
  const [completionsModal, setCompletionsModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, statsRes] = await Promise.all([
        api.get('/campaigns'),
        api.get('/campaigns/stats'),
      ]);
      setCampaigns(campRes.data.campaigns);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this task? This will remove all completion records too.')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success('Task deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  const handleToggleActive = async (campaign) => {
    try {
      await api.put(`/campaigns/${campaign._id}`, { isActive: !campaign.isActive });
      toast.success(campaign.isActive ? 'Task deactivated' : 'Task activated ✅');
      fetchAll();
    } catch {
      toast.error('Failed to update campaign');
    }
  };

  // Filter campaigns
  const filtered = campaigns.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                        c.description?.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType   ? c.taskType === filterType   : true;
    const matchStatus = filterStatus === 'active'   ? c.isActive && !c.isExpired
                      : filterStatus === 'inactive' ? !c.isActive
                      : filterStatus === 'expired'  ? c.isExpired
                      : true;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Tasks <FiCheckSquare />
          </h1>
          <p className="page-subtitle">Create & manage tasks for users</p>
        </div>
        <button id="create-campaign-btn" className="btn btn-primary" onClick={() => setModal('create')}>
          <FiPlus style={{marginRight: 4}}/> New Task
        </button>
      </div>

      {/* Stats Strip */}
      <StatsStrip stats={stats} />

      {/* Filters */}
      <div className="filters-row">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <FiSearch />
          </svg>
          <input
            id="campaign-search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="filter-type"
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {TASK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
          ))}
        </select>
        <select
          id="filter-status"
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Campaign Grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="empty-state">
            <div className="icon" style={{ fontSize: '2rem' }}><FiTarget /></div>
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
          </div>
        </div>
      ) : (
        <div className="campaign-cards-grid">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              onEdit={(c) => setModal(c)}
              onDelete={handleDelete}
              onViewCompletions={(c) => setCompletionsModal(c)}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <CampaignModal
          campaign={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchAll(); }}
        />
      )}

      {/* Completions Modal */}
      {completionsModal && (
        <CompletionsModal
          campaign={completionsModal}
          onClose={() => setCompletionsModal(null)}
        />
      )}
    </div>
  );
}
