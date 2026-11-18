import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Shield, Users, Building2, Calendar, FileText, ArrowLeft, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminNav = [
    { labelKey: 'adminLayout.platformOverview', path: '/admin', icon: Shield, end: true },
    { labelKey: 'adminLayout.userDirectory', path: '/admin/users', icon: Users },
    { labelKey: 'adminLayout.organizations', path: '/admin/organizations', icon: Building2 },
    { labelKey: 'adminLayout.allEvents', path: '/admin/events', icon: Calendar },
    { labelKey: 'adminLayout.auditLogs', path: '/admin/audit-logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-charcoal text-white min-h-screen flex flex-col justify-between p-4 border-r border-charcoal/50 select-none">
        <div>
          <div className="p-3 mb-6 bg-navy rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-coral flex items-center justify-center text-white">
                <Shield size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{t('nav.admin')}</h4>
                <p className="text-[10px] text-white/50">{t('adminLayout.platformGovernance')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-coral text-white font-bold shadow-md'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-white/10">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{t('adminLayout.backToHostPortal')}</span>
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="hover:text-coral transition-colors" title={t('nav.logout')}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
