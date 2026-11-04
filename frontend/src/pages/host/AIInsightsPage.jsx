import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Quote,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Layers,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { aiIntelligenceService, eventService, improvementTaskService } from '../../api/services';

export const AIInsightsPage = () => {
  const { id } = useParams();
  const [eventsList, setEventsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(id || '');
  const [event, setEvent] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [convertingId, setConvertingId] = useState(null);

  useEffect(() => {
    fetchEventsAndInit();
  }, [id]);

  const fetchEventsAndInit = async () => {
    try {
      setLoading(true);
      const evtsRes = await eventService.getEvents({ limit: 50 });
      let currentId = id;

      if (evtsRes.data?.success) {
        const evts = evtsRes.data.events || [];
        setEventsList(evts);
        if (!currentId && evts.length > 0) {
          currentId = evts[0]._id || evts[0].id;
        }
      }

      setSelectedEventId(currentId || '');
      if (currentId) {
        await loadEventIntelligence(currentId);
      }
    } catch (err) {
      console.warn('Init error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEventIntelligence = async (eventId) => {
    try {
      const [evtRes, aiRes] = await Promise.all([
        eventService.getEventById(eventId),
        aiIntelligenceService.getAnalysis(eventId),
      ]);

      if (evtRes.data?.success) setEvent(evtRes.data.event);
      if (aiRes.data?.success) {
        setAnalysis(aiRes.data.analysis);
        setRecommendations(aiRes.data.recommendations || []);
      }
    } catch (err) {
      console.warn('AI intelligence fetch error:', err.message);
    }
  };

  const handleSelectEvent = async (e) => {
    const newId = e.target.value;
    setSelectedEventId(newId);
    setLoading(true);
    await loadEventIntelligence(newId);
    setLoading(false);
  };

  const handleRunAnalysis = async () => {
    if (!selectedEventId) return;
    try {
      setAnalyzing(true);
      const res = await aiIntelligenceService.runAnalysis(selectedEventId);
      if (res.data?.success) {
        setAnalysis(res.data.analysis);
        setRecommendations(res.data.recommendations || []);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to run AI analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConvertToTask = async (rec) => {
    try {
      setConvertingId(rec._id);
      const orgId = typeof event?.organizationId === 'object' ? (event.organizationId._id || event.organizationId.id) : event?.organizationId;
      await improvementTaskService.createTask({
        organizationId: orgId,
        relatedEventId: event?._id || event?.id || selectedEventId,
        recommendationId: rec._id,
        issue: rec.title,
        recommendedAction: rec.suggestedAction,
        priority: rec.priority,
        status: 'todo',
        notes: `Impact: ${rec.impact}`,
      });
      // Refresh recommendations
      if (selectedEventId) {
        loadEventIntelligence(selectedEventId);
      }
    } catch (err) {
      alert('Failed to convert to task: ' + err.message);
    } finally {
      setConvertingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>Synthesizing event intelligence...</span>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positive', count: analysis?.sentimentSummary?.positive || 0, color: '#10B981' },
    { name: 'Neutral', count: analysis?.sentimentSummary?.neutral || 0, color: '#6366F1' },
    { name: 'Negative', count: analysis?.sentimentSummary?.negative || 0, color: '#F43F5E' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {id ? (
            <Link
              to={`/events/${id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-navy transition-colors mb-1"
            >
              <ArrowLeft size={14} />
              <span>Back to Event Details</span>
            </Link>
          ) : (
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-navy transition-colors mb-1"
            >
              <ArrowLeft size={14} />
              <span>All Events Directory</span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-extrabold text-navy">
              AI Feedback Intelligence
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-coral/10 text-coral">
              AI Engine
            </span>
          </div>
          <p className="text-xs text-charcoal/60 mt-0.5">
            {event?.title || 'Selected Event'} ({analysis?.totalResponsesAnalyzed || 0} responses analyzed)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {eventsList.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-charcoal/60">Select Event:</label>
              <select
                value={selectedEventId}
                onChange={handleSelectEvent}
                className="bg-white border border-charcoal/15 rounded-xl px-3 py-2 text-xs font-semibold text-navy shadow-subtle focus:outline-none focus:border-coral"
              >
                {eventsList.map((e) => (
                  <option key={e._id || e.id} value={e._id || e.id}>
                    {e.title} ({e.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing || !selectedEventId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={analyzing ? 'animate-spin' : ''} />
            <span>{analyzing ? 'Processing NLP Pipeline...' : (analysis ? 'Re-run AI Analysis' : 'Run AI Analysis Now')}</span>
          </button>
        </div>
      </div>

      {!analysis && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center space-y-3">
          <Brain size={36} className="text-indigo-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">AI Intelligence Pipeline Ready</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Run our multi-model NLP pipeline to synthesize attendee feedback, cluster recurring complaints, identify positive highlights, and generate priority improvements.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Sparkles size={14} />
            <span>{analyzing ? 'Analyzing Responses...' : 'Generate AI Insights Now'}</span>
          </button>
        </div>
      )}

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-charcoal/10 shadow-subtle">
          <span className="text-xs font-bold text-charcoal/60">Analyzed Feedback</span>
          <p className="text-2xl font-extrabold text-navy mt-1">{analysis?.totalResponsesAnalyzed || 0}</p>
          <span className="text-[10px] text-sage-dark font-semibold">100% of collection</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-charcoal/10 shadow-subtle">
          <span className="text-xs font-bold text-sage-dark">Positive Responses</span>
          <p className="text-2xl font-extrabold text-sage-dark mt-1">{analysis?.sentimentSummary?.positive || 0}</p>
          <span className="text-[10px] text-charcoal/50">Promoters & Enthusiasts</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-charcoal/10 shadow-subtle">
          <span className="text-xs font-bold text-coral">Recurring Issues</span>
          <p className="text-2xl font-extrabold text-coral mt-1">{analysis?.recurringIssues?.length || 0}</p>
          <span className="text-[10px] text-charcoal/50">Bottlenecks flagged</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-charcoal/10 shadow-subtle">
          <span className="text-xs font-bold text-navy">Sentiment Index</span>
          <p className="text-2xl font-extrabold text-navy mt-1">
            {analysis?.sentimentSummary?.averageScore >= 0 ? '+' : ''}{analysis?.sentimentSummary?.averageScore || 0}
          </p>
          <span className="text-[10px] text-charcoal/50">-1.0 (Critical) to +1.0 (Ideal)</span>
        </div>
      </div>

      {/* Main Split: Themes & Sentiment Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Extracted Themes */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-heading font-bold text-navy">Extracted Feedback Themes</h3>
              <p className="text-xs text-charcoal/60">Clustered participant topics & representative citations</p>
            </div>
          </div>

          <div className="space-y-4">
            {analysis?.themes?.map((th, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-ivory border border-charcoal/10 space-y-2 hover:border-charcoal/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy">{th.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-charcoal/70 border border-charcoal/10">
                      {th.responseCount} mentions
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      th.sentiment === 'positive'
                        ? 'bg-sage/30 text-sage-dark'
                        : th.sentiment === 'negative'
                        ? 'bg-coral/20 text-coral'
                        : 'bg-lavender/50 text-navy'
                    }`}
                  >
                    {th.sentiment}
                  </span>
                </div>

                {th.representativeQuotes?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {th.representativeQuotes.map((q, qIdx) => (
                      <p key={qIdx} className="text-xs text-charcoal/70 italic flex items-start gap-1.5">
                        <Quote size={12} className="text-coral shrink-0 mt-0.5" />
                        <span>"{q}"</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Breakdown Chart */}
        <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-lg font-heading font-bold text-navy">Polarity Ratio</h3>
            <p className="text-xs text-charcoal/60">Response counts by sentiment category</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" textAnchor="end" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-2xl bg-ivory text-xs space-y-1.5 border border-charcoal/10">
            <span className="font-bold text-navy block">AI Recommendation Readiness</span>
            <p className="text-charcoal/60">
              InsightLoop has converted friction patterns into actionable improvement tasks below.
            </p>
          </div>
        </div>
      </div>

      {/* Recurring Issues & Positive Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recurring Issues */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-coral" />
            <h3 className="text-base font-heading font-bold text-navy">Recurring Bottlenecks & Friction</h3>
          </div>

          <div className="space-y-3">
            {analysis?.recurringIssues?.map((iss, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-coral/5 border border-coral/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy">{iss.category}</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-coral text-white">
                    {iss.severity}
                  </span>
                </div>
                <p className="text-xs text-charcoal/80 font-medium">{iss.issue}</p>
                {iss.evidence?.length > 0 && (
                  <p className="text-[11px] text-charcoal/60 italic">
                    Evidence: "{iss.evidence[0]}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Positive Highlights */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-sage-dark" />
            <h3 className="text-base font-heading font-bold text-navy">Key Highlights & Strengths</h3>
          </div>

          <div className="space-y-3">
            {analysis?.positiveHighlights?.map((high, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-sage/10 border border-sage-dark/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy">{high.category}</span>
                  <span className="text-[10px] font-bold text-sage-dark">{high.frequency} endorsements</span>
                </div>
                <p className="text-xs text-charcoal/80 font-medium">{high.highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations with Convert-to-Task */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-coral font-mono">
              Continuous Improvement
            </span>
            <h3 className="text-xl font-heading font-extrabold text-navy mt-0.5">
              Actionable AI Recommendations
            </h3>
            <p className="text-xs text-charcoal/60">
              Transform AI findings directly into tracked tasks for team members
            </p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-bold text-coral hover:underline inline-flex items-center gap-1"
          >
            <span>View All Improvement Tasks</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec._id}
              className="p-5 rounded-2xl bg-ivory border border-charcoal/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-navy">{rec.title}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      rec.priority === 'urgent'
                        ? 'bg-coral text-white'
                        : rec.priority === 'high'
                        ? 'bg-coral/20 text-coral'
                        : 'bg-lavender/50 text-navy'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-charcoal/70">{rec.suggestedAction}</p>
                <div className="flex items-center gap-2 text-[11px] text-sage-dark font-medium">
                  <TrendingUp size={13} />
                  <span>Impact: {rec.impact}</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  disabled={rec.isConvertedToTask || convertingId === rec._id}
                  onClick={() => handleConvertToTask(rec)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    rec.isConvertedToTask
                      ? 'bg-sage/20 text-sage-dark border border-sage-dark/30 cursor-default'
                      : 'bg-navy hover:bg-navy-700 text-white shadow-sm'
                  }`}
                >
                  <CheckSquare size={14} />
                  <span>{rec.isConvertedToTask ? 'Task Assigned' : 'Convert to Task'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
