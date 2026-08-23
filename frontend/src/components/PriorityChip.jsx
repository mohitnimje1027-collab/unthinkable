const PRIORITY_CONFIG = {
  'High': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  'Medium': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  'Low': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
};

const PriorityChip = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {priority}
    </span>
  );
};
export default PriorityChip;
