import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiSettings, FiDollarSign } from 'react-icons/fi';

const DEFAULT_SETTINGS = [
  {
    key: 'coins_per_inr',
    label: '💰 Coins per ₹1 INR',
    description: 'How many coins equal ₹1. e.g. 100 means 100 coins = ₹1',
    type: 'number',
    defaultValue: 100,
  },
  {
    key: 'min_withdrawal_coins',
    label: 'Minimum Withdrawal (Coins)',
    description: 'Minimum coins required for a user to place a withdrawal request',
    type: 'number',
    defaultValue: 100,
  },
];

export default function Settings() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings')
      .then((r) => {
        const map = {};
        r.data.settings.forEach((s) => { map[s.key] = s.value; });
        setValues(map);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const settings = DEFAULT_SETTINGS.map((s) => ({
        key: s.key,
        value: Number(values[s.key] ?? s.defaultValue),
        description: s.description,
      }));
      await api.put('/settings', { settings });
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  // Calculate example
  const coinsPerInr = Number(values['coins_per_inr'] || 100);
  const minCoins    = Number(values['min_withdrawal_coins'] || 100);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Settings <FiSettings />
          </h1>
          <p className="page-subtitle">Global configuration for the Task Reward system</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Settings Form */}
        <form onSubmit={handleSave}>
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ marginBottom: 24, fontSize: '1rem', fontWeight: 600 }}>💰 Coin & Withdrawal Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {DEFAULT_SETTINGS.map((s) => (
                <div className="form-group" key={s.key}>
                  <label className="form-label">{s.label}</label>
                  <input
                    id={`setting-${s.key}`}
                    className="form-input"
                    type={s.type}
                    min="1"
                    value={values[s.key] ?? s.defaultValue}
                    onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                    required
                  />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>{s.description}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
              <button id="save-settings" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Settings'}
              </button>
            </div>
          </div>
        </form>

        {/* Live Preview */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: '0.95rem', fontWeight: 600 }}>📊 Live Preview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Exchange Rate</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-purple)' }}>
                <FiDollarSign style={{ marginRight: 4 }}/> {coinsPerInr} coins = ₹1
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Min Withdrawal</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-orange)' }}>
                <FiDollarSign style={{ marginRight: 4 }}/> {minCoins} coins
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginTop: 4 }}>
                = ₹{(minCoins / coinsPerInr).toFixed(2)} INR
              </div>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Examples</div>
              {[100, 500, 1000, 5000].map((coins) => (
                <div key={coins} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}><FiDollarSign style={{ marginRight: 4 }}/> {coins} coins</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>₹{(coins / coinsPerInr).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
