import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiDollarSign, FiSearch } from 'react-icons/fi';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.transactions);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    const searchLower = search.toLowerCase();
    const userName = t.user?.name || '';
    const userEmail = t.user?.email || '';
    const userMobile = t.user?.mobileNumber || '';
    return userName.toLowerCase().includes(searchLower) ||
           userEmail.toLowerCase().includes(searchLower) ||
           userMobile.toLowerCase().includes(searchLower) ||
           (t.description || '').toLowerCase().includes(searchLower);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Transactions <FiDollarSign />
          </h1>
          <p className="page-subtitle">View all coin adjustments and transaction history</p>
        </div>
      </div>

      <div className="card">
        <div className="table-header">
          <div className="search-bar">
            <FiSearch />
            <input 
              placeholder="Search by user or description..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {t.user?.email || t.user?.mobileNumber || ''}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-pending" style={{ padding: '4px 8px' }}>
                        {t.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {t.description || '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: t.amount > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {t.amount > 0 ? '+' : ''}{t.amount}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
