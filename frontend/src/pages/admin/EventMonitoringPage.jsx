import React, { useState, useEffect } from 'react';
import { Calendar, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../api/services';

export const EventMonitoringPage = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      const res = await adminService.getAllEvents(params);
      if (res.data?.success) setEvents(res.data.events || []);
    } catch (err) {
      console.warn('Admin events fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-navy">
          {t('admin.events.title')}
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          {t('admin.events.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-subtle flex items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchEvents();
          }}
          className="relative w-full sm:w-80"
        >
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.events.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
          />
        </form>

        <span className="text-xs text-charcoal/60 font-medium">
          {t('admin.events.eventsLogged', { count: events.length })}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral mr-2" />
          <span>{t('admin.events.loading')}</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory border-b border-charcoal/10 text-charcoal/70 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">{t('admin.events.headers.eventCode')}</th>
                <th className="py-3.5 px-4">{t('admin.events.headers.title')}</th>
                <th className="py-3.5 px-4">{t('admin.events.headers.organization')}</th>
                <th className="py-3.5 px-4">{t('admin.events.headers.category')}</th>
                <th className="py-3.5 px-4">{t('admin.events.headers.status')}</th>
                <th className="py-3.5 px-4">{t('admin.events.headers.createdDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {events.map((evt) => (
                <tr key={evt._id} className="hover:bg-ivory/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-coral">{evt.code}</td>
                  <td className="py-3.5 px-4 font-bold text-navy">{evt.title}</td>
                  <td className="py-3.5 px-4 font-medium text-charcoal/80">
                    {evt.organizationId?.name || t('admin.events.orgFallback')}
                  </td>
                  <td className="py-3.5 px-4">{evt.category}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        evt.status === 'completed'
                          ? 'bg-sage/30 text-sage-dark'
                          : evt.status === 'ongoing'
                          ? 'bg-coral/20 text-coral'
                          : 'bg-lavender/50 text-navy'
                      }`}
                    >
                      {t(`admin.events.statuses.${evt.status}`, { defaultValue: evt.status || '' })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal/50">
                    {new Date(evt.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventMonitoringPage;
