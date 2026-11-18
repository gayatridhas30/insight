import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  TrendingUp,
  CheckSquare,
  PlusCircle,
  QrCode,
  Sparkles,
  Bot,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Smile,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { eventService, improvementTaskService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getCategoryBadge } from '../../config/eventCategories';
import { useTranslation } from 'react-i18next';

export const HostDashboard = () => {
  const { t } = useTranslation();
  const { user, activeOrganization } = useAuth();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [eventsRes, tasksRes] = await Promise.all([
          eventService.getEvents({ limit: 6 }),
          improvementTaskService.getTasks({ status: 'todo' }),
        ]);

        if (eventsRes.data?.success) setEvents(eventsRes.data.events || []);
        if (tasksRes.data?.success) setTasks(tasksRes.data.tasks || []);
      } catch (err) {
        console.warn('Dashboard fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeOrganization]);

  // Aggregate summary stats
  const totalEvents = events.length;
  const totalResponses = events.reduce((acc, curr) => acc + (curr.responsesCount || 0), 0);
  const pendingTasksCount = tasks.length;

  const sentimentData = [
    { name: t('dashboard.positive'), value: 65, color: '#10B981' }, // Vibrant Emerald
    { name: t('dashboard.neutral'), value: 25, color: '#6366F1' },  // Tech Indigo
    { name: t('dashboard.negative'), value: 10, color: '#F43F5E' }, // Rose Red
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>{t('dashboard.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy">
            {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || t('dashboard.organizerFallback')}!
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/60 mt-1">
            {activeOrganization?.name || 'InsightLoop Event Intelligence'} — {t('dashboard.universalFeedbackHub')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/events/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all active:scale-95"
          >
            <PlusCircle size={16} />
            <span>{t('dashboard.createEvent')}</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy hover:bg-navy-700 text-white text-xs font-bold transition-all"
          >
            <Bot size={16} className="text-coral" />
            <span>{t('dashboard.ragAiAssistant')}</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal/60">{t('dashboard.managedEvents')}</span>
            <p className="text-3xl font-heading font-extrabold text-navy">{totalEvents}</p>
            <span className="text-[10px] text-sage-dark font-bold">{t('dashboard.managedEventsSub')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory flex items-center justify-center text-navy shadow-sm">
            <Calendar size={22} className="text-coral" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal/60">{t('dashboard.totalResponses')}</span>
            <p className="text-3xl font-heading font-extrabold text-navy">{totalResponses}</p>
            <span className="text-[10px] text-sage-dark font-bold">{t('dashboard.responsesSub')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory flex items-center justify-center text-navy shadow-sm">
            <MessageSquare size={22} className="text-sage-dark" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal/60">{t('dashboard.overallSentiment')}</span>
            <p className="text-3xl font-heading font-extrabold text-sage-dark">+0.47</p>
            <span className="text-[10px] text-charcoal/50">{t('dashboard.sentimentSub')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory flex items-center justify-center text-navy shadow-sm">
            <TrendingUp size={22} className="text-coral" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-charcoal/60">{t('dashboard.pendingImprovements')}</span>
            <p className="text-3xl font-heading font-extrabold text-coral">{pendingTasksCount}</p>
            <span className="text-[10px] text-charcoal/50">{t('dashboard.pendingImprovementsSub')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-ivory flex items-center justify-center text-navy shadow-sm">
            <CheckSquare size={22} className="text-coral" />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Events Table & Sentiment Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Events Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-heading font-bold text-navy">{t('dashboard.recentEventsResponses')}</h3>
              <p className="text-xs text-charcoal/60">{t('dashboard.recentEventsSub')}</p>
            </div>
            <Link to="/events" className="text-xs font-bold text-coral hover:underline flex items-center gap-1">
              <span>{t('dashboard.viewAll')}</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-charcoal/5">
            {events.map((evt) => {
              const catBadge = getCategoryBadge(evt.category);
              return (
                <div key={evt.id || evt._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-coral font-mono">
                        {evt.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          evt.status === 'completed'
                            ? 'bg-sage/30 text-sage-dark'
                            : evt.status === 'ongoing'
                            ? 'bg-coral/20 text-coral'
                            : 'bg-lavender/50 text-navy'
                        }`}
                      >
                        {t(`dashboard.status.${evt.status}`, evt.status)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${catBadge.bg} ${catBadge.text}`}>
                        {catBadge.label}
                      </span>
                      {evt.subcategory && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-ivory border border-charcoal/10 text-charcoal/70">
                          {evt.subcategory}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-navy hover:text-coral transition-colors">
                      <Link to={`/events/${evt.id || evt._id}`}>{evt.title}</Link>
                    </h4>
                    <p className="text-xs text-charcoal/50">
                      {evt.location || t('dashboard.online')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-navy">
                        {evt.responsesCount || 0} / {evt.targetResponses || 50}
                      </span>
                      <div className="w-24 bg-ivory rounded-full h-2 mt-1 overflow-hidden border border-charcoal/10">
                        <div
                          className="bg-coral h-full rounded-full"
                          style={{ width: `${Math.min(evt.responseRate || 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/events/${evt.id || evt._id}/qr`}
                        className="p-2 rounded-xl bg-ivory text-charcoal/70 hover:text-coral hover:bg-coral/10 transition-colors"
                        title={t('dashboard.viewQrCode')}
                      >
                        <QrCode size={16} />
                      </Link>
                      <Link
                        to={`/feedback/${evt.code}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-ivory text-charcoal/70 hover:text-navy hover:bg-navy/10 transition-colors"
                        title={t('dashboard.publicLink')}
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment Distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-subtle flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-lg font-heading font-bold text-navy">{t('dashboard.sentimentDistribution')}</h3>
            <p className="text-xs text-charcoal/60">{t('dashboard.sentimentDistributionSub')}</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-charcoal/10">
            <div>
              <span className="block text-[11px] font-bold text-sage-dark">{t('dashboard.positive')}</span>
              <span className="text-base font-extrabold text-navy">65%</span>
            </div>
            <div>
              <span className="block text-[11px] font-bold text-lavender-dark">{t('dashboard.neutral')}</span>
              <span className="text-base font-extrabold text-navy">25%</span>
            </div>
            <div>
              <span className="block text-[11px] font-bold text-coral">{t('dashboard.negative')}</span>
              <span className="text-base font-extrabold text-navy">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
