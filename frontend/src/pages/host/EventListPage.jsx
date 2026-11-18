import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  Search,
  Filter,
  QrCode,
  ExternalLink,
  BarChart3,
  Brain,
  Sliders,
  CheckCircle,
  MoreVertical,
  RefreshCw,
  Sparkles,
  MapPin,
  Tag,
} from 'lucide-react';
import { eventService } from '../../api/services';
import { EVENT_CATEGORIES, getCategoryBadge } from '../../config/eventCategories';
import { useTranslation } from 'react-i18next';

export const EventListPage = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, categoryFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (search) params.search = search;

      const res = await eventService.getEvents(params);
      if (res.data?.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.warn('Events fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy">
            {t('eventList.title')}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/60 mt-1">
            {t('eventList.subtitle')}
          </p>
        </div>

        <Link
          to="/events/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all active:scale-95 shrink-0"
        >
          <PlusCircle size={16} />
          <span>{t('dashboard.createEvent')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-subtle flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('eventList.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral text-charcoal"
          >
            <option value="all">{t('eventList.filter.allStatuses')}</option>
            <option value="published">{t('eventList.status.published')}</option>
            <option value="ongoing">{t('eventList.status.ongoing')}</option>
            <option value="completed">{t('eventList.status.completed')}</option>
            <option value="draft">{t('eventList.status.draft')}</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral text-charcoal"
          >
            <option value="all">{t('eventList.filter.allCategories')}</option>
            {Object.keys(EVENT_CATEGORIES).map((key) => (
              <option key={key} value={key}>
                {EVENT_CATEGORIES[key].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral mr-2" />
          <span>{t('eventList.loading')}</span>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-charcoal/10 space-y-4">
          <Calendar size={36} className="text-coral mx-auto" />
          <h3 className="text-lg font-heading font-bold text-navy">{t('eventList.emptyTitle')}</h3>
          <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
            {t('eventList.emptyDescription')}
          </p>
          <Link
            to="/events/create"
            className="inline-block px-5 py-2.5 rounded-xl bg-coral text-white text-xs font-bold"
          >
            {t('eventList.createEvent')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const eventId = evt.id || evt._id;
            const categoryMeta = getCategoryBadge(evt.category);

            return (
              <div
                key={eventId}
                className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-coral font-mono">
                      {evt.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        evt.status === 'completed'
                          ? 'bg-sage/20 text-sage'
                          : evt.status === 'ongoing'
                          ? 'bg-coral/20 text-coral'
                          : 'bg-lavender/50 text-navy'
                      }`}
                      >
                        {t(`eventList.status.${evt.status}`, evt.status)}
                      </span>
                  </div>

                  <h3 className="text-base font-heading font-bold text-navy line-clamp-1 hover:text-coral transition-colors">
                    <Link to={`/events/${eventId}`}>{evt.title}</Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${categoryMeta.badgeColor}`}
                    >
                      {evt.category}
                    </span>
                    {evt.subcategory && (
                      <span className="text-[10px] font-semibold text-charcoal/70 bg-ivory px-2 py-0.5 rounded-full border border-charcoal/10">
                        {evt.subcategory}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-charcoal/60 line-clamp-2">
                    {evt.description || t('eventList.noDescription')}
                  </p>

                  <div className="pt-1 text-xs text-charcoal/50 flex flex-wrap gap-2">
                    <span>{evt.venueType ? t(`eventList.venueType.${String(evt.venueType).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`, evt.venueType) : ''}</span>
                    <span>•</span>
                    <span className="truncate max-w-[180px]">{evt.location || t('eventList.online')}</span>
                  </div>
                </div>

                {/* Progress & Quick Action Buttons */}
                <div className="pt-4 border-t border-charcoal/10 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-charcoal/60">{t('eventList.responseProgress')}</span>
                      <span className="text-navy font-bold">
                        {evt.responsesCount || 0} / {evt.targetResponses || 50}
                      </span>
                    </div>
                    <div className="w-full bg-ivory rounded-full h-2 overflow-hidden border border-charcoal/10">
                      <div
                        className="bg-coral h-full rounded-full transition-all"
                        style={{ width: `${Math.min(evt.responseRate || 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <Link
                      to={`/events/${eventId}`}
                      className="py-2 rounded-xl bg-ivory hover:bg-navy hover:text-white text-charcoal text-xs font-semibold text-center transition-colors"
                      title={t('eventList.actions.detailsTitle')}
                    >
                      {t('eventList.actions.details')}
                    </Link>
                    <Link
                      to={`/events/${eventId}/builder`}
                      className="py-2 rounded-xl bg-ivory hover:bg-coral hover:text-white text-charcoal text-xs font-semibold text-center transition-colors"
                      title={t('eventList.actions.builderTitle')}
                    >
                      {t('eventList.actions.builder')}
                    </Link>
                    <Link
                      to={`/events/${eventId}/ai`}
                      className="py-2 rounded-xl bg-ivory hover:bg-sage hover:text-white text-charcoal text-xs font-semibold text-center transition-colors"
                      title={t('eventList.actions.aiTitle')}
                    >
                      {t('eventList.actions.ai')}
                    </Link>
                    <Link
                      to={`/events/${eventId}/qr`}
                      className="py-2 rounded-xl bg-ivory hover:bg-navy hover:text-white text-charcoal text-xs font-semibold text-center transition-colors flex items-center justify-center"
                      title={t('eventList.actions.qrFlyerTitle')}
                    >
                      <QrCode size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventListPage;
