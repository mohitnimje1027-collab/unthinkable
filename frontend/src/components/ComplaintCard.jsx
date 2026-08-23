import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityChip from './PriorityChip';

const CATEGORY_ICONS = {
  Plumbing: '🔧',
  Electrical: '⚡',
  Cleaning: '🧹',
  Security: '🔒',
  Other: '📋',
};

const ComplaintCard = ({ complaint, adminLink }) => {
  const date = new Date(complaint.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const href = adminLink
    ? `/admin/complaints/${complaint.id}`
    : `/complaints/${complaint.id}`;

  return (
    <Link
      to={href}
      className="card p-5 block hover:shadow-md transition-all hover:border-primary-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {CATEGORY_ICONS[complaint.category] || '📋'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-slate-800 font-semibold">{complaint.category}</span>
              {complaint.is_overdue && (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  <AlertTriangle className="w-3 h-3" /> Overdue
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm line-clamp-2">{complaint.description}</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <StatusBadge status={complaint.status} />
              <PriorityChip priority={complaint.priority} />
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> {date}
              </span>
              {complaint.flat_no && (
                <span className="text-slate-400 text-xs">Flat {complaint.flat_no}</span>
              )}
              {complaint.resident_name && (
                <span className="text-slate-400 text-xs">{complaint.resident_name}</span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
};
export default ComplaintCard;
