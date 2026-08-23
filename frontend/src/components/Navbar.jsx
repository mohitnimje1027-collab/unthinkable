import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, LogOut, User, LayoutDashboard,
  Megaphone, Plus, Shield, ClipboardList
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const residentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/complaints/new', icon: Plus, label: 'New Complaint' },
    { to: '/notices', icon: Megaphone, label: 'Notices' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/complaints', icon: ClipboardList, label: 'Complaints' },
    { to: '/admin/notices', icon: Megaphone, label: 'Notices' },
  ];

  const links = user?.role === 'admin' ? adminLinks : residentLinks;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Society</p>
            <p className="text-slate-400 text-xs">Maintenance Tracker</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-6 py-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${user?.role === 'admin' ? 'bg-amber-900/30' : 'bg-primary-900/30'}`}>
          {user?.role === 'admin'
            ? <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
            : <User className="w-4 h-4 text-primary-400 flex-shrink-0" />}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className={`text-xs capitalize ${user?.role === 'admin' ? 'text-amber-400' : 'text-primary-400'}`}>{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-slate-700">
        {user?.flat_no && (
          <p className="text-slate-500 text-xs mb-3 px-2">Flat: {user.flat_no}</p>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
export default Navbar;
