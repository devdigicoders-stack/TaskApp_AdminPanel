import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

function Badge({ value }) {
  return <span className={`badge badge-${value}`}>{value}</span>;
}

export default function Redemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/redemptions');
      setRedemptions(data.redemptions);
    } catch {
      toast.error('Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    const note = window.prompt(status === 'rejected' ? 'Enter rejection reason (optional):' : 'Enter approval note (optional):');
    if (note === null) return; // User cancelled prompt

    try {
      await api.put(`/redemptions/${id}`, { status, adminNote: note });
      toast.success(`Redemption ${status}`);
      fetchRedemptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gift Redemptions</h1>
          <p className="page-subtitle">Review and approve gift redemption requests</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : redemptions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3 style={{ color: 'var(--text-primary)' }}>No redemption requests</h3>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Gift Requested</th>
                <th>Assigned Merchant</th>
                <th>Coins Spent</th>
                <th>Requested At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.user?.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.user?.email}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.user?.mobileNumber || 'No Mobile'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {r.gift?.image && <img src={r.gift.image} alt="gift" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />}
                      <span style={{ color: 'var(--text-primary)' }}>{r.gift?.name || 'Unknown Gift'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.merchant?.shopName || r.gift?.merchant?.shopName || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {r.merchant?.name || r.gift?.merchant?.name || 'Unassigned'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{r.gift?.requiredCoins || 0}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{formatDate(r.createdAt)}</td>
                  <td><Badge value={r.status} /></td>
                  <td>
                    {r.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="icon-btn" style={{ color: 'var(--accent-green)' }} onClick={() => handleAction(r._id, 'approved')} title="Approve">
                          <FiCheckCircle size={20} />
                        </button>
                        <button className="icon-btn" style={{ color: 'var(--accent-red)' }} onClick={() => handleAction(r._id, 'rejected')} title="Reject">
                          <FiXCircle size={20} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
