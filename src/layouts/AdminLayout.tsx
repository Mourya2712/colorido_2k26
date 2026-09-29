import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, CalendarDays, Megaphone, Trophy,
  Image, Star, Phone, LogOut, Menu, X, ChevronRight,
  Ticket
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/registrations', icon: Ticket, label: 'Registrations' },
  { to: '/admin/events', icon: CalendarDays, label: 'Events' },
  { to: '/admin/schedule', icon: CalendarDays, label: 'Schedule' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/admin/results', icon: Trophy, label: 'Results' },
  { to: '/admin/gallery', icon: Image, label: 'Gallery' },
  { to: '/admin/sponsors', icon: Star, label: 'Sponsors' },
  { to: '/admin/contact', icon: Phone, label: 'Contact & Config' },
];

const AdminLayout: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d0b15] border-r border-white/10 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white tracking-wider font-['Outfit']">COLORIDO 2K26</h1>
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-0.5">Organizer Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {location.pathname === to && <ChevronRight className="w-3 h-3 ml-auto text-purple-400" />}
          </NavLink>
        ))}
      </nav>

      {/* Admin Info & Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{admin?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex">
      <Sidebar />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0d0b15]/80 backdrop-blur-md border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="hidden sm:block">COLORIDO 2K26</span>
            <span className="hidden sm:block text-slate-600">•</span>
            <span className="font-semibold text-slate-300 capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="hidden sm:block text-xs text-purple-400 font-semibold">{admin?.name}</span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black">
              {admin?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
