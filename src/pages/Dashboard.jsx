import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { FiCheckSquare, FiFolder, FiTarget, FiDollarSign, FiBarChart2 } from 'react-icons/fi';

const STATUS_COLORS = {
  todo: '#64748b',
  'in-progress': '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
};

const PRIORITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  urgent: '#ec4899',
};

export default function Dashboard() {
  const [stats, setStats] = useState({ tasks: null, projects: null, users: null, campaigns: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [taskRes, projRes, userRes, campRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/projects/stats'),
        api.get('/users/stats'),
        api.get('/campaigns/stats').catch(() => ({ data: null })),
      ]);
      setStats({
        tasks: taskRes.data,
        projects: projRes.data,
        users: userRes.data,
        campaigns: campRes?.data || null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const taskStatusData = (stats.tasks?.byStatus || []).map((s) => ({
    name: s._id,
    value: s.count,
    color: STATUS_COLORS[s._id] || '#8b5cf6',
  }));

  const taskPriorityData = (stats.tasks?.byPriority || []).map((p) => ({
    name: p._id,
    count: p.count,
  }));

  const projectStatusData = (stats.projects?.byStatus || []).map((s) => ({
    name: s._id,
    value: s.count,
    color: '#8b5cf6',
  }));

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
            <div className="value" style={{ color: 'var(--accent-purple)' }}>{stats.tasks?.total ?? 0}</div>
            <div className="label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue"><FiFolder /></div>
          <div className="stat-info">
            <div className="value" style={{ color: 'var(--accent-blue)' }}>{stats.projects?.total ?? 0}</div>
            <div className="label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiTarget /></div>
          <div className="stat-info">
            <div className="value" style={{ color: 'var(--accent-green)' }}>{stats.campaigns?.total ?? 0}</div>
            <div className="label">Total Campaigns</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><FiDollarSign /></div>
          <div className="stat-info">
            <div className="value" style={{ color: 'var(--accent-orange)' }}>{stats.campaigns?.totalCoinsDistributed ?? 0}</div>
            <div className="label">Coins Distributed</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        <div className="card">
          <h3 className="chart-title">Tasks by Status</h3>
          {taskStatusData.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="icon" style={{ fontSize: '2rem' }}><FiBarChart2 /></div>
              <p>No task data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {taskStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="chart-title">Tasks by Priority</h3>
          {taskPriorityData.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="icon" style={{ fontSize: '2rem' }}><FiBarChart2 /></div>
              <p>No task data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskPriorityData} barSize={36}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {taskPriorityData.map((entry, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[entry.name] || '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Project Status */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 className="chart-title">Projects by Status</h3>
        {projectStatusData.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="icon" style={{ fontSize: '2rem' }}><FiFolder /></div>
            <p>No projects yet. Create your first project!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectStatusData} barSize={50}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              <Bar dataKey="value" fill="url(#gradient)" radius={[6, 6, 0, 0]}>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
