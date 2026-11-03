import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  Bot,
  CheckSquare,
  FileSpreadsheet,
  Settings,
  User,
  Shield,
  LogOut,
  Building2,
  Sparkles,
  GitCompare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, isAdmin, activeOrganization, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Create Event', path: '/events/create', icon: PlusCircle },
    { label: 'Event Comparison', path: '/events/compare', icon: GitCompare },
    { label: 'AI Intelligence', path: '/ai-insights', icon: BarChart3 },
    { label: 'RAG Assistant', path: '/ai-assistant', icon: Bot, badge: 'AI' },
    { label: 'Improvement Tracker', path: '/tasks', icon: CheckSquare },
    { label: 'Reports & Export', path: '/reports', icon: FileSpreadsheet },
    { label: 'Organization', path: '/organization/settings', icon: Building2 },
    { label: 'Profile & Settings', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-navy text-white min-h-screen flex flex-col justify-between p-4 border-r border-navy-700/50 select-none">
      <div>
        {/* Organization Badge Card */}
        <div className="bg-navy-800/90 border border-white/10 rounded-2xl p-3.5 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coral/20 border border-coral/40 flex items-center justify-center text-coral font-bold text-sm shrink-0">
            {activeOrganization?.name ? activeOrganization.name[0].toUpperCase() : 'O'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">
              {activeOrganization?.name || 'Organization'}
            </h4>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-sage">
              {activeOrganization?.category || 'Host Console'}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-coral text-white shadow-coral-glow'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-lavender text-navy">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Admin Navigation (if platform administrator) */}
        {isAdmin && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-lavender">
              Platform Admin
            </div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-lavender text-navy font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Shield size={16} className="text-lavender" />
              <span>Admin Console</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between p-2 rounded-xl bg-navy-800/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-coral text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-white/50 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-white/60 hover:text-coral hover:bg-white/5 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
