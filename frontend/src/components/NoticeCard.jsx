import { Pin, Trash2, Calendar } from 'lucide-react';

const NoticeCard = ({ notice, isAdmin, onDelete }) => {
  const date = new Date(notice.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className={`card p-5 relative ${notice.is_important ? 'border-amber-300 bg-amber-50/50' : ''}`}>
      {notice.is_important && (
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded-full">
            <Pin className="w-3 h-3" /> Pinned · Important
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-base">{notice.title}</h3>
          <p className="text-slate-600 text-sm mt-1 leading-relaxed">{notice.content}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
            {notice.admin_name && <span>By {notice.admin_name}</span>}
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(notice.id)}
            className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
            title="Delete notice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
export default NoticeCard;
