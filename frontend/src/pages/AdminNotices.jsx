import { useState, useEffect } from 'react';
import { Plus, X, Megaphone, Pin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getNotices, createNotice, deleteNotice } from '../api/notices';
import NoticeCard from '../components/NoticeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const EMPTY_FORM = { title: '', content: '', is_important: false };

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadNotices = async () => {
    try {
      const res = await getNotices();
      setNotices(res.data.notices || res.data || []);
    } catch {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }

    setSubmitting(true);
    try {
      await createNotice({
        title: form.title.trim(),
        content: form.content.trim(),
        is_important: form.is_important,
      });
      toast.success('Notice posted successfully!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteNotice(id);
      toast.success('Notice deleted');
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notice Management</h1>
          <p className="text-slate-500 mt-1">Post and manage society announcements</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); }}
          className={showForm ? 'btn-secondary' : 'btn-primary'}
        >
          {showForm ? (
            <><X className="w-4 h-4" /> Cancel</>
          ) : (
            <><Plus className="w-4 h-4" /> Post Notice</>
          )}
        </button>
      </div>

      {/* Post form */}
      {showForm && (
        <div className="card p-6 mb-6 border-primary-200 bg-primary-50/30">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">New Notice</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Water supply interruption on Sunday"
                className="input-field"
                maxLength={100}
              />
            </div>

            <div>
              <label className="label">Content <span className="text-red-500">*</span></label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                placeholder="Write your notice content here..."
                className="input-field resize-none"
              />
            </div>

            {/* Important toggle */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_important: !form.is_important })}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                  form.is_important ? 'bg-amber-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.is_important ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Pin className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-sm font-semibold text-slate-700">Mark as Important</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Important notices will be pinned at the top of the board</p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Notice
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notices list */}
      {loading ? (
        <div className="card p-16 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading notices..." />
        </div>
      ) : notices.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-slate-700 font-semibold text-lg mb-1">No notices posted</h3>
          <p className="text-slate-400 text-sm mb-5">Post your first notice to inform residents</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">
            <Plus className="w-4 h-4" />
            Post First Notice
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-600">
              {notices.length} notice{notices.length !== 1 ? 's' : ''} posted
            </span>
          </div>
          <div className="space-y-3">
            {/* Important first */}
            {[...notices]
              .sort((a, b) => (b.is_important ? 1 : 0) - (a.is_important ? 1 : 0))
              .map((n) => (
                <NoticeCard
                  key={n.id}
                  notice={n}
                  isAdmin
                  onDelete={handleDelete}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
