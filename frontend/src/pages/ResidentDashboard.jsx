import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, CheckCircle2, Clock, AlertCircle, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyComplaints } from '../api/complaints';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  </div>
);

export default function ResidentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyComplaints();
        setComplaints(res.data.complaints || res.data || []);
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === 'Open').length,
    inProgress: complaints.filter((c) => c.status === 'In Progress').length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-primary-600 text-sm font-medium">Flat {user?.flat_no}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good day, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's an overview of your maintenance complaints</p>
        </div>
        <Link to="/complaints/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} icon={ClipboardList} color="text-slate-600" bg="bg-slate-100" />
        <StatCard label="Open" value={stats.open} icon={AlertCircle} color="text-red-600" bg="bg-red-100" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} color="text-green-600" bg="bg-green-100" />
      </div>

      {/* Complaints list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">My Complaints</h2>
          {complaints.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {complaints.length} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="card p-16 flex items-center justify-center">
            <LoadingSpinner size="lg" text="Loading complaints..." />
          </div>
        ) : complaints.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-slate-700 font-semibold text-lg mb-1">No complaints yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
              Haven't faced any issues? Great! If you do, submit a complaint and we'll take care of it.
            </p>
            <Link to="/complaints/new" className="btn-primary mx-auto">
              <Plus className="w-4 h-4" />
              Submit First Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
