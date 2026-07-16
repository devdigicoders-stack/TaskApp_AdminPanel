import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiInbox, FiCheck, FiX, FiDollarSign, FiBarChart2 } from 'react-icons/fi';

const STATUS_COLORS = {
  started:   { bg: 'rgba(99,102,241,0.12)', text: 'var(--accent-purple)', label: 'Started' },
  submitted: { bg: 'rgba(245,158,11,0.12)',  text: 'var(--accent-orange)', label: 'Pending Review' },
  approved:  { bg: 'rgba(16,185,129,0.12)',  text: 'var(--accent-green)',  label: 'Approved' },
  rejected:  { bg: 'rgba(239,68,68,0.12)',   text: 'var(--accent-red)',    label: 'Rejected' },
};

function ResolveModal({ submission, onClose, onDone }) {
  const [status, setStatus] = useState('approved');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/submissions/${submission._id}/resolve`, { status, adminNote: note });
      toast.success(status === 'approved' ? `Approved! Coins credited.` : 'Submission rejected.');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460, width: '95vw' }}>
        <div className="modal-header">
          <h2 className="modal-title">Review Submission</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{submission.campaign?.title}</div>
              <div style={{ color: 'var(--text-secondary)' }}>By: {submission.user?.name} ({submission.user?.email})</div>
              {submission.note && <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontStyle: 'italic' }}>User note: "{submission.note}"</div>}
              <div style={{ marginTop: 8, fontWeight: 600, color: 'var(--accent-purple)' }}>
                <FiDollarSign style={{marginRight: 4}}/> Reward: {submission.campaign?.coinsReward} coins
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Decision *</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStatus('approved')}
                  className={`btn ${status === 'approved' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                  <FiCheck style={{marginRight: 6}}/> Approve
                </button>
                <button type="button" onClick={() => setStatus('rejected')}
                  className={`btn ${status === 'rejected' ? 'btn-danger' : 'btn-ghost'}`} style={{ flex: 1 }}>
                  <FiX style={{marginRight: 6}}/> Reject
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Note (optional)</label>
              <textarea className="form-textarea" rows={2} value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Screenshot not matching, proof verified, etc." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn ${status === 'approved' ? 'btn-primary' : 'btn-danger'}`} disabled={saving}>
              {saving ? 'Saving...' : `Confirm ${status === 'approved' ? 'Approval' : 'Rejection'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('submitted');
  const [resolveTarget, setResolveTarget] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, statsRes] = await Promise.all([
        api.get(`/submissions?status=${filterStatus}`),
        api.get('/submissions/stats'),
      ]);
      setSubmissions(subRes.data.submissions);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const statusInfo = (s) => STATUS_COLORS[s] || STATUS_COLORS.started;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Task Approvals <FiInbox />
          </h1>
          <p className="page-subtitle">Review and approve user task submissions</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Pending', value: stats.pending, icon: <FiInbox />, color: 'var(--accent-orange)' },
            { label: 'Approved', value: stats.approved, icon: <FiCheck />, color: 'var(--accent-green)' },
            { label: 'Rejected', value: stats.rejected, icon: <FiX />, color: 'var(--accent-red)' },
            { label: 'Total', value: stats.total, icon: <FiBarChart2 />, color: 'var(--accent-purple)' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-info">
                <div className="value" style={{ color: s.color }}>{s.value ?? 0}</div>
                <div className="label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['submitted', 'approved', 'rejected', 'started', ''].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s === '' ? 'All' : statusInfo(s).label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : submissions.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="icon" style={{ fontSize: '2rem' }}><FiInbox /></div>
          <h3>No submissions found</h3>
          <p>No task submissions matching the current filter</p>
        </div></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Campaign', 'Coins', 'Status', 'Submitted At', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const si = statusInfo(sub.status);
                return (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{sub.user?.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{sub.user?.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{sub.campaign?.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{sub.campaign?.taskType}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="coin-badge"><FiDollarSign style={{marginRight: 2}}/> {sub.coinsAwarded || sub.campaign?.coinsReward}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: si.bg, color: si.text, borderRadius: 20, padding: '3px 10px', fontSize: '0.76rem', fontWeight: 600 }}>
                        {si.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {sub.status === 'submitted' ? (
                        <button className="btn btn-sm btn-primary" id={`review-${sub._id}`}
                          onClick={() => setResolveTarget(sub)}>
                          Review
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {sub.adminNote || '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {resolveTarget && (
        <ResolveModal
          submission={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onDone={() => { setResolveTarget(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
