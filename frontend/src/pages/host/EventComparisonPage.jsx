import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  BarChart3,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { eventService } from '../../api/services';

export const EventComparisonPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchEventsList();
  }, []);

  const fetchEventsList = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({ limit: 20 });
      if (res.data?.success) {
        const evts = res.data.events || [];
        setEvents(evts);
        // Pre-select first 2 events if available
        if (evts.length >= 2) {
          const defaultIds = [evts[0]._id || evts[0].id, evts[1]._id || evts[1].id];
          setSelectedEventIds(defaultIds);
          runComparison(defaultIds);
        }
      }
    } catch (err) {
      console.warn('Events list error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async (idsToCompare) => {
    const ids = idsToCompare || selectedEventIds;
    if (ids.length < 2) return;

    try {
      setComparing(true);
      const res = await eventService.compareEvents(ids);
      if (res.data?.success) {
        setComparison(res.data.comparison);
      }
    } catch (err) {
      alert('Failed to compare events: ' + err.message);
    } finally {
      setComparing(false);
    }
  };

  const toggleEventSelection = (id) => {
    let updated;
    if (selectedEventIds.includes(id)) {
      if (selectedEventIds.length <= 2) return; // keep at least 2
      updated = selectedEventIds.filter((item) => item !== id);
    } else {
      if (selectedEventIds.length >= 3) {
        updated = [selectedEventIds[1], selectedEventIds[2], id];
      } else {
        updated = [...selectedEventIds, id];
      }
    }
    setSelectedEventIds(updated);
    runComparison(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>Loading event comparison engine...</span>
      </div>
    );
  }

  const chartData = comparison?.map((item) => ({
    name: item.event.code,
    Rating: item.metrics.averageRating,
    'Sentiment Index': (item.metrics.sentimentScore + 1) * 2.5, // Scaled 0 to 5 for visual comparison
    'Response Rate %': item.metrics.responseRate,
  })) || [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            Cross-Event Benchmarking & Comparison
          </h1>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-coral/10 text-coral">
            Historical Intelligence
          </span>
        </div>
        <p className="text-xs text-charcoal/60 mt-1">
          Select 2 or 3 events to compare participant satisfaction, sentiment shifts, and recurring bottlenecks
        </p>
      </div>

      {/* Event Selection Pills */}
      <div className="bg-white rounded-3xl p-5 border border-charcoal/10 shadow-subtle space-y-3">
        <span className="text-xs font-bold text-navy block">Select Events to Compare (2 - 3):</span>
        <div className="flex flex-wrap gap-2.5">
          {events.map((evt) => {
            const eId = evt._id || evt.id;
            const isSelected = selectedEventIds.includes(eId);
            return (
              <button
                key={eId}
                type="button"
                onClick={() => toggleEventSelection(eId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-navy text-white border-navy shadow-sm scale-102'
                    : 'bg-ivory border-charcoal/15 text-charcoal hover:border-charcoal/30'
                }`}
              >
                <span>{evt.title} ({evt.code})</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-coral animate-ping" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {comparison && (
        <div className="space-y-8">
          {/* Side by side metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparison.map((item, idx) => (
              <div
                key={item.event.id}
                className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-coral bg-coral/10 px-2 py-0.5 rounded">
                      {item.event.code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-charcoal/50">
                      {item.event.category}
                    </span>
                  </div>
                  <h3 className="text-base font-heading font-bold text-navy">{item.event.title}</h3>
                </div>

                <div className="divide-y divide-charcoal/5 text-xs pt-2">
                  <div className="py-2 flex justify-between">
                    <span className="text-charcoal/60">Average Rating:</span>
                    <span className="font-bold text-navy">{item.metrics.averageRating} / 5.0 ★</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-charcoal/60">Sentiment Index:</span>
                    <span className="font-bold text-sage-dark">
                      {item.metrics.sentimentScore >= 0 ? '+' : ''}{item.metrics.sentimentScore}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-charcoal/60">Response Rate:</span>
                    <span className="font-bold text-navy">{item.metrics.responseRate}%</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-charcoal/60">Recurring Issues Flagged:</span>
                    <span className="font-bold text-coral">{item.recurringIssuesCount}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-charcoal/60">Positive Highlights:</span>
                    <span className="font-bold text-sage-dark">{item.positiveHighlightsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparative Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-subtle space-y-4">
            <h3 className="text-base font-heading font-bold text-navy">Comparative Performance Metrics</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#17243A' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Rating" fill="#FF7058" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Sentiment Index" fill="#A9B9A0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventComparisonPage;
