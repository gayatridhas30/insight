import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Sliders,
  BarChart3,
  Bot,
  Plus,
  ExternalLink,
  Users,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  FileText,
} from 'lucide-react';
import { eventService } from '../../api/services';
import { getCategoryBadge } from '../../config/eventCategories';

export const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);

  // New session modal
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    speakerName: '',
    roomOrLink: '',
    description: '',
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await eventService.getEventById(id);
      if (res.data?.success) {
        setEvent(res.data.event);
        setSessions(res.data.sessions || []);
        setQr(res.data.qr);
      }
    } catch (err) {
      console.warn('Event detail fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const res = await eventService.createSession(id, sessionForm);
      if (res.data?.success) {
        setSessions([...sessions, res.data.session]);
        setIsAddSessionOpen(false);
        setSessionForm({ title: '', speakerName: '', roomOrLink: '', description: '' });
      }
    } catch (err) {
      alert('Failed to add session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm font-semibold text-navy">
        <RefreshCw size={20} className="animate-spin text-coral mr-2" />
        <span>Loading event details...</span>
      </div>
    );
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  const categoryMeta = getCategoryBadge(event.category);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Event Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral bg-coral/10 px-2.5 py-1 rounded-lg">
              {event.code}
            </span>
            <span
              className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${categoryMeta.badgeColor}`}
            >
              {event.category}
            </span>
            {event.subcategory && (
              <span className="text-[10px] font-semibold text-charcoal/70 bg-ivory px-2 py-0.5 rounded-full border border-charcoal/10">
                {event.subcategory}
              </span>
            )}
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                event.status === 'completed'
                  ? 'bg-sage/20 text-sage'
                  : event.status === 'ongoing'
                  ? 'bg-coral/20 text-coral'
                  : 'bg-lavender/50 text-navy'
              }`}
            >
              {event.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal/60">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-coral" />
              <span>{new Date(event.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-coral" />
              <span>{event.location || 'Online'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-sage" />
              <span>Target: {event.targetResponses || 50} attendees</span>
            </div>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/events/${id}/builder`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory hover:bg-coral hover:text-white text-xs font-bold transition-all"
          >
            <Sliders size={14} />
            <span>Form Builder</span>
          </Link>
          <Link
            to={`/events/${id}/responses`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory hover:bg-navy hover:text-white text-xs font-bold transition-all"
          >
            <span>Responses</span>
          </Link>
          <Link
            to={`/events/${id}/ai`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all"
          >
            <Sparkles size={14} />
            <span>AI Insights</span>
          </Link>
          <Link
            to={`/events/${id}/qr`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy hover:bg-navy-900 text-white text-xs font-bold transition-all"
          >
            <QrCode size={14} />
            <span>QR Flyer</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Sessions List & QR Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions & Agenda Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-subtle space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-navy">Event Sessions & Agenda</h3>
                <p className="text-xs text-charcoal/60">
                  Attach feedback specifically to individual waves, speakers, or matches
                </p>
              </div>
              <button
                onClick={() => setIsAddSessionOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-coral/10 hover:bg-coral hover:text-white text-coral text-xs font-bold transition-all"
              >
                <Plus size={14} />
                <span>Add Session / Wave</span>
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="p-8 text-center bg-ivory rounded-2xl border border-charcoal/10 space-y-2">
                <Clock size={28} className="text-charcoal/40 mx-auto" />
                <p className="text-xs text-charcoal/60">No sessions added yet for this event.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((sess, idx) => (
                  <div
                    key={sess._id}
                    className="p-4 rounded-2xl bg-ivory border border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-navy text-white px-2 py-0.5 rounded-md">
                          Session {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-navy">{sess.title}</h4>
                      </div>
                      <p className="text-xs text-charcoal/60">
                        Lead: <span className="font-semibold text-charcoal">{sess.speakerName || 'TBA'}</span> • Stage / Zone: {sess.roomOrLink || 'Main Area'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick QR & Link Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-card text-center space-y-4">
            <h3 className="text-sm font-heading font-bold text-navy">Feedback Access QR</h3>
            {qr?.dataUrl && (
              <div className="p-4 bg-ivory rounded-2xl border border-charcoal/10 inline-block">
                <img
                  src={qr.dataUrl}
                  alt={`QR code for ${event.title}`}
                  className="w-48 h-48 rounded-xl mx-auto"
                />
              </div>
            )}
            <p className="text-xs font-mono font-bold text-coral">{event.code}</p>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to={`/events/${id}/qr`}
                className="w-full py-2.5 rounded-xl bg-navy hover:bg-navy-900 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <QrCode size={14} />
                <span>Open Full Flyer & Print</span>
              </Link>
              <a
                href={`/feedback/${event.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-ivory hover:bg-coral/10 text-charcoal hover:text-coral border border-charcoal/15 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Test Feedback Form</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
