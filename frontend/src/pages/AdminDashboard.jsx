import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../api/dashboard';
import { detectOverdue } from '../api/complaints';
import { Shield, AlertCircle, Clock, CheckCircle2, ClipboardList, AlertTriangle, Zap } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import PriorityChip from '../components/PriorityChip';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
  <div className={`card p-5 border-l-4 ${border}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value ?? 0}</p>
      </div>
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

const PIE_COLORS = { Open: '#ef4444', 'In Progress': '#f59e0b', Resolved: '#22c55e' };
const BAR_COLOR = '#6366f1';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-slate-600">Count: <span className="font-bold">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detectingOverdue, setDetectingOverdue] = useState(false);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const handleDetectOverdue = async () => {
    setDetectingOverdue(true);
    try {
      const res = await detectOverdue();
      toast.success(res.data?.message || 'Overdue detection complete');
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Detection failed');
    } finally {
      setDetectingOverdue(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statusData = [
    { name: 'Open', value: stats?.open || 0 },
    { name: 'In Progress', value: stats?.in_progress || 0 },
    { name: 'Resolved', value: stats?.resolved || 0 },
  ].filter((d) => d.value > 0);

  const categoryData = Object.entries(stats?.by_category || {}).map(([name, value]) => ({ name, value }));

  const recentComplaints = stats?.recent || stats?.recent_complaints || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-amber-600 text-sm font-medium">Admin Panel</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's your society maintenance overview</p>
        </div>
        <button
          onClick={handleDetectOverdue}
          disabled={detectingOverdue}
          className="btn-secondary border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          {detectingOverdue ? (
            <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Run Overdue Detection
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" value={stats?.total} icon={ClipboardList} color="text-slate-600" bg="bg-slate-100" border="border-slate-300" />
        <StatCard label="Open" value={stats?.open} icon={AlertCircle} color="text-red-600" bg="bg-red-100" border="border-red-400" />
        <StatCard label="In Progress" value={stats?.in_progress} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" border="border-yellow-400" />
        <StatCard label="Resolved" value={stats?.resolved} icon={CheckCircle2} color="text-green-600" bg="bg-green-100" border="border-green-400" />
        <StatCard label="Overdue" value={stats?.overdue} icon={AlertTriangle} color="text-red-700" bg="bg-red-50" border="border-red-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie chart */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4">Complaints by Status</h3>
          {statusData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-slate-600 text-xs font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4">Complaints by Category</h3>
          {categoryData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={BAR_COLOR} radius={[6, 6, 0, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent complaints table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Recent Complaints</h3>
          <Link to="/admin/complaints" className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors">
            View all →
          </Link>
        </div>
        {recentComplaints.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No complaints yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Resident</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Priority</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Flat</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <Link to={`/admin/complaints/${c.id}`} className="font-medium text-slate-800 hover:text-primary-600 text-sm transition-colors">
                        {c.resident_name || '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><PriorityChip priority={c.priority} /></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{c.flat_no || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
