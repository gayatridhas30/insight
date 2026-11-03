import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, PlusCircle, ArrowLeft, Building2, MapPin, Tag, Users, AlertCircle } from 'lucide-react';
import { eventService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export const CreateEventPage = () => {
  const { activeOrganization } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Workshop',
    description: '',
    venueType: 'in-person',
    location: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16),
    targetResponses: 50,
    tagsString: 'Tech, Students, Innovation',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeOrganization) {
      setError('Please select or create an organization first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tags = formData.tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await eventService.createEvent({
        organizationId: activeOrganization.id,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        venueType: formData.venueType,
        location: formData.location || 'Main Campus Auditorium',
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetResponses: Number(formData.targetResponses) || 50,
        tags,
      });

      if (res.data?.success) {
        const createdEventId = res.data.event._id || res.data.event.id;
        navigate(`/events/${createdEventId}/builder`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Top back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-navy transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Events Directory</span>
      </Link>

      <div className="bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card space-y-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-coral">Event Setup</span>
          <h1 className="text-2xl font-heading font-extrabold text-navy mt-1">
            Create a New Feedback Event
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Fill in the details to generate a unique event code, feedback URL, and QR flyer.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-coral/10 border border-coral/30 text-coral text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. State-level Web3 & AI Hackathon 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
              >
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Conference">Conference</option>
                <option value="Seminar">Seminar</option>
                <option value="Cultural">Cultural Fest</option>
                <option value="Corporate">Corporate Meeting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Venue Type
              </label>
              <select
                name="venueType"
                value={formData.venueType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual / Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
              Location / Venue Details
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Central Auditorium, MIT Pune Campus"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the event agenda and objective..."
              className="w-full p-3 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-charcoal/15 text-xs focus:outline-none focus:border-coral bg-ivory-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-charcoal/15 text-xs focus:outline-none focus:border-coral bg-ivory-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Target Response Goal
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="number"
                  min="1"
                  name="targetResponses"
                  value={formData.targetResponses}
                  onChange={handleChange}
                  placeholder="50"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Tags (Comma separated)
              </label>
              <div className="relative">
                <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="text"
                  name="tagsString"
                  value={formData.tagsString}
                  onChange={handleChange}
                  placeholder="AI, Hackathon, Coding"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal/10 flex justify-end gap-3">
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl border border-charcoal/15 text-xs font-bold text-charcoal hover:bg-ivory"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Event...' : 'Create & Configure Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
