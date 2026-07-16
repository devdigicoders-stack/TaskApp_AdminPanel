import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { FiCheckSquare, FiUsers, FiDollarSign, FiBarChart2, FiInbox } from 'react-icons/fi';

const STATUS_COLORS = {
  started: '#3b82f6',
  submitted: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

export default function Dashboard() {
  const [stats, setStats] = useState({ campaigns: null, users: null, submissions: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [campRes, userRes, subRes] = await Promise.all([
        api.get('/campaigns/stats').catch(() => ({ data: null })),
        api.get('/users/stats').catch(() => ({ data: null })),
        api.get('/submissions/stats').catch(() => ({ data: null })),
      ]);
      setStats({
        campaigns: campRes?.data || null,
        users: userRes?.data || null,
        submissions: subRes?.data || null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const subData = stats.submissions ? [
    { name: 'Started', value: stats.submissions.started, color: STATUS_COLORS.started },
    { name: 'Pending Approval', value: stats.submissions.pending, color: STATUS_COLORS.submitted },
    { name: 'Approved', value: stats.submissions.approved, color: STATUS_COLORS.approved },
    { name: 'Rejected', value: stats.submissions.rejected, color: STATUS_COLORS.rejected },
  ].filter(d => d.value > 0) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon purple"><FiCheckSquare /></div>
          <div className="stat-info">
            <div className="value" style={{ color: 'var(--accent-purple)' }}>{stats.campaigns?.total ?? 0}</div>
            <div className="label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue"><FiUsers /></div>
          <div className="stat-info">
            <div className="value" style={{ color: 'var(--accent-blue)' }}>{stats.users?.total ?? 0}</div>
            <div className="label">Total Users</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><FiInbox /></div>
          <div className="stat-info">
            <div className="value" style={{ color: 'var(--accent-orange)' }}>{stats.submissions?.pending ?? 0}</div>
            <div className="label">Pending Approvals</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiDollarSign /></div>
          <div className="stat-info">
            <div className="value" style={{ color: 'var(--accent-green)' }}>{stats.campaigns?.totalCoinsDistributed ?? 0}</div>
            <div className="label">Coins Distributed</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <h3 className="chart-title">Submissions Status</h3>
          {subData.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="icon" style={{ fontSize: '2rem' }}><FiBarChart2 /></div>
              <p>No submission data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={subData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {subData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
