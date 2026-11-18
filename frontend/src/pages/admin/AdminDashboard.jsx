import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building2,
  Calendar,
  MessageSquare,
  Activity,
  RefreshCw,
  Globe,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/services';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPlatformStats();
      if (res.data?.success) {
        setStats(res.data.stats);
        setActivity(res.data.recentActivity || []);
      }
    } catch (err) {
      console.warn('Admin stats error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>{t('admin.dashboard.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2">
          <Shield size={24} className="text-coral" />
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            {t('admin.dashboard.title')}
          </h1>
        </div>
        <p className="text-xs text-charcoal/60 mt-1">
          {t('admin.dashboard.subtitle')}
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal/60">{t('admin.dashboard.registeredUsers')}</span>
            <p className="text-3xl font-heading font-extrabold text-navy">{stats?.totalUsers || 0}</p>
            <span className="text-[10px] text-sage-dark font-bold">{t('admin.dashboard.hostsAdmins')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory flex items-center justify-center text-navy shadow-sm">
            <Users size={22} className="text-coral" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal/60">{t('admin.dashboard.organizations')}</span>
            <p className="text-3xl font-heading font-extrabold text-navy">{stats?.totalOrganizations || 0}</p>
            <span className="text-[10px] text-sage-dark font-bold">{t('admin.dashboard.collegesClubs')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory flex items-center justify-center text-navy shadow-sm">
            <Building2 size={22} className="text-sage-dark" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal/60">{t('admin.dashboard.totalEvents')}</span>
            <p className="text-3xl font-heading font-extrabold text-navy">{stats?.totalEvents || 0}</p>
            <span className="text-[10px] text-coral font-bold">{t('admin.dashboard.platformWide')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory flex items-center justify-center text-navy shadow-sm">
            <Calendar size={22} className="text-coral" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal/60">{t('admin.dashboard.feedbackCollected')}</span>
            <p className="text-3xl font-heading font-extrabold text-navy">{stats?.totalResponses || 0}</p>
            <span className="text-[10px] text-lavender-dark font-bold">{t('admin.dashboard.multilingual')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory flex items-center justify-center text-navy shadow-sm">
            <MessageSquare size={22} className="text-lavender-dark" />
          </div>
        </div>
      </div>

      {/* Language & Sentiment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-coral" />
            <h3 className="text-base font-heading font-bold text-navy">{t('admin.dashboard.languageBreakdown')}</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-ivory border border-charcoal/10">
              <span className="text-xs font-bold text-charcoal/60 block">{t('admin.dashboard.languages.english')}</span>
              <p className="text-xl font-extrabold text-navy mt-1">{stats?.languageDistribution?.en || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-ivory border border-charcoal/10">
              <span className="text-xs font-bold text-charcoal/60 block">{t('admin.dashboard.languages.hindi')}</span>
              <p className="text-xl font-extrabold text-coral mt-1">{stats?.languageDistribution?.hi || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-ivory border border-charcoal/10">
              <span className="text-xs font-bold text-charcoal/60 block">{t('admin.dashboard.languages.marathi')}</span>
              <p className="text-xl font-extrabold text-sage-dark mt-1">{stats?.languageDistribution?.mr || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-sage-dark" />
            <h3 className="text-base font-heading font-bold text-navy">{t('admin.dashboard.sentimentTitle')}</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-sage/10 border border-sage-dark/20">
              <span className="text-xs font-bold text-sage-dark block">{t('admin.dashboard.sentiment.positive')}</span>
              <p className="text-xl font-extrabold text-navy mt-1">{stats?.sentimentDistribution?.positive || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-lavender/30 border border-lavender-dark/20">
              <span className="text-xs font-bold text-navy block">{t('admin.dashboard.sentiment.neutral')}</span>
              <p className="text-xl font-extrabold text-navy mt-1">{stats?.sentimentDistribution?.neutral || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-coral/10 border border-coral/20">
              <span className="text-xs font-bold text-coral block">{t('admin.dashboard.sentiment.negative')}</span>
              <p className="text-xl font-extrabold text-navy mt-1">{stats?.sentimentDistribution?.negative || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-subtle space-y-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-coral" />
          <h3 className="text-base font-heading font-bold text-navy">{t('admin.dashboard.recentActivity')}</h3>
        </div>

        <div className="divide-y divide-charcoal/5 text-xs">
          {activity.map((log) => (
            <div key={log._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-navy">{log.action}</span>
                <p className="text-charcoal/60">
                  {t('admin.dashboard.activityLine', {
                    user: log.userId?.name || t('admin.dashboard.systemFallback'),
                    email: log.userId?.email || t('admin.dashboard.naFallback'),
                    resource: log.resourceType,
                  })}
                </p>
              </div>
              <span className="text-[10px] text-charcoal/40 font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
