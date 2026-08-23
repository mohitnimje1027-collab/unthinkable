import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Filter, X, RotateCcw } from 'lucide-react';
import { getAllComplaints } from '../api/complaints';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['', 'Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other'];
const STATUSES = ['', 'Open', 'In Progress', 'Resolved'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const loadComplaints = useCallback(async (params) => {
    setLoading(true);
    try {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '')
      );
      const res = await getAllComplaints(cleanParams);
      setComplaints(res.data.complaints || res.data || []);
    } catch (err) {
      toast.error('Failed to load complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints(filters);
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadComplaints(filters);
  };

  const handleReset = () => {
    const cleared = { category: '', status: '', date_from: '', date_to: '' };
    setFilters(cleared);
    loadComplaints(cleared);
  };

  const overdue = complaints.filter((c) => c.is_overdue);
  const nonOverdue = complaints.filter((c) => !c.is_overdue);

  const hasFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Complaints</h1>
        <p className="text-slate-500 mt-1">Manage and respond to resident complaints</p>
      </div>

      {/* Filter bar */}
      <div className="card p-5 mb-6">
        <form onSubmit={handleFilter}>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Filters</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="input-field py-2 text-sm"
              >
                <option value="">All categories</option>
                {CATEGORIES.filter(Boolean).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field py-2 text-sm"
              >
                <option value="">All statuses</option>
                {STATUSES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="input-field py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="input-field py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button type="submit" className="btn-primary py-2 text-sm">
              <Filter className="w-3.5 h-3.5" />
              Apply Filters
            </button>
            {hasFilters && (
              <button type="button" onClick={handleReset} className="btn-secondary py-2 text-sm text-slate-500">
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading complaints..." />
        </div>
      ) : complaints.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-700 font-semibold mb-1">No complaints found</h3>
          <p className="text-slate-400 text-sm">
            {hasFilters ? 'Try adjusting or resetting your filters.' : 'No complaints have been submitted yet.'}
          </p>
          {hasFilters && (
            <button onClick={handleReset} className="btn-secondary mt-4 mx-auto">
              <RotateCcw className="w-4 h-4" />
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overdue section */}
          {overdue.length > 0 && (
            <div>
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <span className="text-red-700 font-bold text-sm">
                    {overdue.length} Overdue Complaint{overdue.length !== 1 ? 's' : ''}
                  </span>
                  <p className="text-red-500 text-xs">These complaints require immediate attention</p>
                </div>
              </div>
              <div className="space-y-3">
                {overdue.map((c) => (
                  <ComplaintCard key={c.id} complaint={c} adminLink />
                ))}
              </div>
            </div>
          )}

          {/* All / non-overdue complaints */}
          <div>
            {overdue.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                  {nonOverdue.length > 0 ? 'Other Complaints' : 'All Complaints'}
                </span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {nonOverdue.length}
                </span>
              </div>
            )}
            {!overdue.length && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-700">{complaints.length}</span> complaint{complaints.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {(overdue.length > 0 ? nonOverdue : complaints).length > 0 ? (
              <div className="space-y-3">
                {(overdue.length > 0 ? nonOverdue : complaints).map((c) => (
                  <ComplaintCard key={c.id} complaint={c} adminLink />
                ))}
              </div>
            ) : (
              overdue.length > 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No other complaints</p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
