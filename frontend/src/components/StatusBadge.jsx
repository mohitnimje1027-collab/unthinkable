const STATUS_CONFIG = {
  'Open': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'Resolved': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};
export default StatusBadge;
