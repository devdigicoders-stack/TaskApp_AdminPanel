import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiDollarSign, FiCheck, FiX, FiInbox, FiBarChart2 } from 'react-icons/fi';

const STATUS_COLORS = {
  pending:  { bg: 'rgba(245,158,11,0.12)',  text: 'var(--accent-orange)', label: 'Pending' },
  approved: { bg: 'rgba(16,185,129,0.12)',  text: 'var(--accent-green)',  label: 'Approved' },
  rejected: { bg: 'rgba(239,68,68,0.12)',   text: 'var(--accent-red)',    label: 'Rejected' },
};

function QRModal({ user, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 360, width: '95vw' }}>
        <div className="modal-header">
          <h2 className="modal-title">💳 Payment Details</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>User</div>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>UPI ID</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-purple)', wordBreak: 'break-all' }}>
              {user.upiId || 'Not set'}
            </div>
          </div>
          {user.upiQrCode ? (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>UPI QR Code</div>
              <img
                src={user.upiQrCode.startsWith('data:') ? user.upiQrCode : `data:image/png;base64,${user.upiQrCode}`}
                alt="UPI QR"
                style={{ width: '100%', maxWidth: 240, borderRadius: 12, border: '2px solid var(--border)', objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No QR code uploaded</div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ResolveModal({ withdrawal, onClose, onDone }) {
  const [status, setStatus] = useState('approved');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/withdrawals/${withdrawal._id}/resolve`, { status, adminNote: note });
      toast.success(status === 'approved' ? 'Withdrawal approved & marked as paid!' : 'Withdrawal rejected, coins refunded.');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440, width: '95vw' }}>
        <div className="modal-header">
          <h2 className="modal-title"><FiDollarSign style={{marginRight: 6}} /> Process Withdrawal</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handle}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{withdrawal.user?.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>UPI: {withdrawal.upiId}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
                <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Coins</span>
                  <div style={{ fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center' }}><FiDollarSign style={{marginRight: 4}}/> {withdrawal.coinsAmount}</div>
                </div>
                <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>INR Amount</span>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>₹ {withdrawal.inrAmount?.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Action *</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setStatus('approved')}
                  className={`btn ${status === 'approved' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                  <FiCheck style={{marginRight: 6}}/> Mark as Paid
                </button>
                <button type="button" onClick={() => setStatus('rejected')}
                  className={`btn ${status === 'rejected' ? 'btn-danger' : 'btn-ghost'}`} style={{ flex: 1 }}>
                  <FiX style={{marginRight: 6}}/> Reject & Refund               </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Note (optional)</label>
              <textarea className="form-textarea" rows={2} value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={status === 'approved' ? 'e.g. Payment sent via GPay' : 'e.g. Invalid UPI ID'} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn ${status === 'approved' ? 'btn-primary' : 'btn-danger'}`} disabled={saving}>
              {saving ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [qrModal, setQrModal] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, sRes] = await Promise.all([
        api.get(`/withdrawals?status=${filterStatus}`),
        api.get('/withdrawals/stats'),
      ]);
      setWithdrawals(wRes.data.withdrawals);
      setStats(sRes.data);
    } catch {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Withdrawals <FiDollarSign />
          </h1>
          <p className="page-subtitle">Manage user coin withdrawal requests</p>
        </div>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Pending', value: stats.pending, icon: <FiInbox />, color: 'var(--accent-orange)' },
            { label: 'Approved', value: stats.approved, icon: <FiCheck />, color: 'var(--accent-green)' },
            { label: 'Rejected', value: stats.rejected, icon: <FiX />, color: 'var(--accent-red)' },
            { label: 'Total Coins Paid', value: stats.totalCoinsPaid ?? 0, icon: <FiDollarSign />, color: 'var(--accent-purple)' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-info">
                <div className="value" style={{ color: s.color }}>{s.value}</div>
                <div className="label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s === '' ? '🔢 All' : STATUS_COLORS[s]?.label || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : withdrawals.length === 0 ? (
        <div className="card"><div className="empty-state">
            <div className="icon" style={{ fontSize: '2rem' }}><FiDollarSign /></div>
          <h3>No withdrawals found</h3>
          <p>No withdrawal requests matching the current filter</p>
        </div></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Amount', 'UPI ID', 'Status', 'Requested', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => {
                const si = STATUS_COLORS[w.status] || STATUS_COLORS.pending;
                return (
                  <tr key={w._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{w.user?.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{w.user?.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center' }}><FiDollarSign style={{marginRight: 4}}/> {w.coinsAmount}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>₹ {w.inrAmount?.toFixed(2)}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{w.upiId}</div>
                      <button className="btn btn-sm btn-ghost" style={{ marginTop: 4, padding: '2px 8px', fontSize: '0.72rem' }}
                        onClick={() => setQrModal(w.user ? { ...w.user, upiId: w.upiId, upiQrCode: w.upiQrCode } : null)}>
                        📷 View QR
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: si.bg, color: si.text, borderRadius: 20, padding: '3px 10px', fontSize: '0.76rem', fontWeight: 600 }}>
                        {si.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {new Date(w.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {w.status === 'pending' ? (
                        <button className="btn btn-sm btn-primary" id={`process-${w._id}`} onClick={() => setResolveTarget(w)}>
                          Process
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{w.adminNote || '—'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {qrModal && <QRModal user={qrModal} onClose={() => setQrModal(null)} />}
      {resolveTarget && (
        <ResolveModal withdrawal={resolveTarget} onClose={() => setResolveTarget(null)}
          onDone={() => { setResolveTarget(null); fetchAll(); }} />
      )}
    </div>
  );
}
