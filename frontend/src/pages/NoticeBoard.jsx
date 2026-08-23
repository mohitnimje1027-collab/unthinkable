import { useState, useEffect } from 'react';
import { Megaphone, Pin } from 'lucide-react';
import { getNotices } from '../api/notices';
import NoticeCard from '../components/NoticeCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNotices();
        setNotices(res.data.notices || res.data || []);
      } catch {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const important = notices.filter((n) => n.is_important);
  const regular = notices.filter((n) => !n.is_important);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
            <p className="text-slate-500 text-sm">Society announcements and important notices</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading notices..." />
        </div>
      ) : notices.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-slate-700 font-semibold text-lg mb-1">No notices yet</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            The admin hasn't posted any notices. Check back later for society announcements.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned / Important notices */}
          {important.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pin className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-700 uppercase tracking-wide">Pinned Notices</span>
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{important.length}</span>
              </div>
              <div className="space-y-3">
                {important.map((n) => (
                  <NoticeCard key={n.id} notice={n} isAdmin={false} />
                ))}
              </div>
            </div>
          )}

          {/* Regular notices */}
          {regular.length > 0 && (
            <div>
              {important.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">All Notices</span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{regular.length}</span>
                </div>
              )}
              <div className="space-y-3">
                {regular.map((n) => (
                  <NoticeCard key={n.id} notice={n} isAdmin={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
