import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Globe, LogIn, UserPlus, LogOut, LayoutDashboard, Shield, ChevronDown, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAdmin, activeOrganization, organizations, switchOrganization, logout } = useAuth();
  const navigate = useNavigate();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('insightloop_lang', lang);
    setIsLangDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-ivory/90 backdrop-blur-md border-b border-charcoal/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow-card group-hover:scale-105 transition-transform">
            <Sparkles size={20} className="text-coral" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-heading font-extrabold text-navy tracking-tight flex items-center gap-1">
              Insight<span className="text-coral">Loop</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal/50 -mt-1">
              {t('navbar.eventIntelligence')}
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Public) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/features" className="text-sm font-medium text-charcoal/80 hover:text-coral transition-colors">
            {t('nav.features')}
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-charcoal/80 hover:text-coral transition-colors">
            {t('nav.howItWorks')}
          </Link>
          <Link to="/feedback/HACK-2026" className="text-sm font-medium text-charcoal/80 hover:text-coral transition-colors flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
            <span>{t('navbar.liveDemo')}</span>
          </Link>
        </nav>

        {/* Right actions: Language Switcher + Auth / Org Switcher */}
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-charcoal/15 bg-white text-charcoal hover:border-coral transition-all"
            >
              <Globe size={14} className="text-coral" />
              <span>{i18n.language === 'mr' ? 'मराठी' : i18n.language === 'hi' ? 'हिन्दी' : 'English'}</span>
              <ChevronDown size={12} className="text-charcoal/50" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-card border border-charcoal/10 py-1 z-50">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-ivory ${
                    i18n.language === 'en' ? 'text-coral font-bold' : 'text-charcoal'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-ivory ${
                    i18n.language === 'hi' ? 'text-coral font-bold' : 'text-charcoal'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => changeLanguage('mr')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-ivory ${
                    i18n.language === 'mr' ? 'text-coral font-bold' : 'text-charcoal'
                  }`}
                >
                  मराठी (Marathi)
                </button>
              </div>
            )}
          </div>

          {/* If Authenticated: Org Switcher & Dashboard shortcut */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Active Org Selector */}
              {organizations?.length > 0 && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-navy text-white hover:bg-navy-700 transition-colors shadow-sm"
                  >
                    <Building2 size={13} className="text-sage" />
                    <span className="truncate max-w-[140px]">{activeOrganization?.name || t('navbar.organization')}</span>
                    <ChevronDown size={12} className="opacity-70" />
                  </button>

                  {isOrgDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-card border border-charcoal/10 py-1.5 z-50">
                      <div className="px-3 py-1 text-[11px] font-semibold text-charcoal/50 uppercase tracking-wider">
                        {t('navbar.yourOrganizations')}
                      </div>
                      {organizations.map((org) => (
                        <button
                          key={org.id}
                          onClick={() => {
                            switchOrganization(org);
                            setIsOrgDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-ivory transition-colors ${
                            activeOrganization?.id === org.id ? 'font-bold text-coral bg-coral/5' : 'text-charcoal'
                          }`}
                        >
                          <span className="truncate">{org.name}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-charcoal/10 text-charcoal/70">
                            {org.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all"
              >
                <LayoutDashboard size={14} />
                <span>{t('nav.dashboard')}</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-charcoal hover:bg-navy-900 text-white text-xs font-bold transition-all"
                  title={t('navbar.adminTooltip')}
                >
                  <Shield size={14} className="text-lavender" />
                  <span className="hidden sm:inline">{t('nav.admin')}</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl border border-charcoal/15 text-charcoal/60 hover:text-coral hover:border-coral transition-colors"
                title={t('nav.logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-charcoal/20 text-navy hover:border-coral hover:text-coral transition-all"
              >
                <LogIn size={14} />
                <span>{t('nav.login')}</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-coral hover:bg-coral-hover text-white shadow-coral-glow transition-all"
              >
                <UserPlus size={14} />
                <span>{t('nav.register')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
