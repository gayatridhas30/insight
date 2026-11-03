import React, { useState, useEffect } from 'react';
import { Calendar, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { adminService } from '../../api/services';

export const EventMonitoringPage = () => {
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
          Platform-Wide Event Feed
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Real-time oversight of all hackathons, workshops, and symposiums hosted on InsightLoop
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
            placeholder="Search events across platform..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
          />
        </form>

        <span className="text-xs text-charcoal/60 font-medium">
          {events.length} Events Logged
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral mr-2" />
          <span>Loading platform events...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory border-b border-charcoal/10 text-charcoal/70 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Event Code</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {events.map((evt) => (
                <tr key={evt._id} className="hover:bg-ivory/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-coral">{evt.code}</td>
                  <td className="py-3.5 px-4 font-bold text-navy">{evt.title}</td>
                  <td className="py-3.5 px-4 font-medium text-charcoal/80">
                    {evt.organizationId?.name || 'Organization'}
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
                      {evt.status}
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
