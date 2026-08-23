import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ImageIcon, CheckCircle2, Clock, Circle, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getComplaint, updateComplaint } from '../api/complaints';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityChip from '../components/PriorityChip';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORY_ICONS = {
  Plumbing: '🔧', Electrical: '⚡', Cleaning: '🧹', Security: '🔒', Other: '📋',
};

const STATUSES = ['Open', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const timelineIconStyle = {
  Open: { icon: Circle, color: 'text-red-500', bg: 'bg-red-100' },
  'In Progress': { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  Resolved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' },
};

export default function ComplaintDetail({ isAdmin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', priority: '', note: '' });

  const isAdminView = isAdmin || user?.role === 'admin';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getComplaint(id);
        const data = res.data.complaint || res.data;
        setComplaint(data);
        setUpdateForm({
          status: data.status,
          priority: data.priority,
          note: '',
        });
      } catch {
        toast.error('Failed to load complaint');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateComplaint(id, updateForm);
      const updated = res.data.complaint || res.data;
      setComplaint(updated);
      setUpdateForm({ status: updated.status, priority: updated.priority, note: '' });
      toast.success('Complaint updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const backPath = isAdminView ? '/admin/complaints' : '/dashboard';

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading complaint..." />
      </div>
    );
  }

  if (!complaint) return null;

  const photoUrl = complaint.photo_url
    ? (complaint.photo_url.startsWith('http') ? complaint.photo_url : `/uploads/${complaint.photo_url}`)
    : null;

  const history = complaint.status_history || complaint.history || [];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to {isAdminView ? 'All Complaints' : 'Dashboard'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Complaint info */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {CATEGORY_ICONS[complaint.category] || '📋'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-xl font-bold text-slate-900">{complaint.category}</h1>
                  {complaint.is_overdue && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                      <AlertTriangle className="w-3 h-3" /> Overdue
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={complaint.status} />
                  <PriorityChip priority={complaint.priority} />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-slate-700 leading-relaxed">{complaint.description}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Submitted by</p>
                <p className="text-slate-700 font-medium">{complaint.resident_name || 'You'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Flat</p>
                <p className="text-slate-700 font-medium">{complaint.flat_no || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Submitted on</p>
                <p className="text-slate-700 font-medium">
                  {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Complaint ID</p>
                <p className="text-slate-700 font-medium font-mono">#{complaint.id}</p>
              </div>
            </div>
          </div>

          {/* Photo */}
          {photoUrl && (
            <div className="card overflow-hidden">
              <div className="px-6 pt-5 pb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Attached Photo</span>
              </div>
              <img src={photoUrl} alt="Complaint" className="w-full max-h-80 object-cover" />
            </div>
          )}

          {/* Status timeline */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-5">Status History</h3>
            {history.length === 0 ? (
              <p className="text-slate-400 text-sm">No status changes yet.</p>
            ) : (
              <div className="space-y-0">
                {history.map((entry, i) => {
                  const style = timelineIconStyle[entry.status] || timelineIconStyle['Open'];
                  const Icon = style.icon;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 ${style.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${style.color}`} />
                        </div>
                        {i < history.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-100 mt-1 mb-1 min-h-6" />
                        )}
                      </div>
                      <div className="pb-6 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm">{entry.status}</span>
                          {entry.changed_by && (
                            <span className="text-xs text-slate-400">by {entry.changed_by}</span>
                          )}
                        </div>
                        {entry.note && (
                          <p className="text-slate-500 text-sm mt-1 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                            {entry.note}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(entry.changed_at || entry.created_at).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — admin actions */}
        {isAdminView && (
          <div className="space-y-5">
            <div className="card p-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-5">Update Complaint</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="input-field"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Priority</label>
                  <select
                    value={updateForm.priority}
                    onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                    className="input-field"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Note (optional)</label>
                  <textarea
                    value={updateForm.note}
                    onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                    rows={3}
                    placeholder="Add a note for this update..."
                    className="input-field resize-none text-sm"
                  />
                </div>

                <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
