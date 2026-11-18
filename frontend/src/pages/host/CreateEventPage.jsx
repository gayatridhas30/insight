import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  ArrowLeft,
  Building2,
  MapPin,
  Tag,
  Users,
  AlertCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { eventService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { EVENT_CATEGORIES } from '../../config/eventCategories';
import { useTranslation } from 'react-i18next';

export const CreateEventPage = () => {
  const { t } = useTranslation();
  const { activeOrganization } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Marathon',
    subcategory: 'Half Marathon (21.1K)',
    customSubcategory: '',
    description: '',
    venueType: 'in-person',
    location: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 16),
    targetResponses: 75,
    tagsString: 'Fitness, Health, Community',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedCategoryConfig = EVENT_CATEGORIES[formData.category] || EVENT_CATEGORIES.Workshop;
  const subcategoriesList = selectedCategoryConfig.subcategories || [];

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const config = EVENT_CATEGORIES[newCategory] || EVENT_CATEGORIES.Workshop;
    const defaultSub = config.subcategories?.[0] || '';
    setFormData({
      ...formData,
      category: newCategory,
      subcategory: defaultSub,
      customSubcategory: '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeOrganization) {
      setError('eventCreate.selectOrgFirst');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tags = formData.tagsString
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const effectiveSubcategory =
        formData.subcategory === 'Custom'
          ? formData.customSubcategory.trim()
          : formData.subcategory || formData.customSubcategory.trim();

      const res = await eventService.createEvent({
        organizationId: activeOrganization.id || activeOrganization._id,
        title: formData.title,
        category: formData.category,
        subcategory: effectiveSubcategory,
        subcategories: effectiveSubcategory ? [effectiveSubcategory] : [],
        description: formData.description,
        venueType: formData.venueType,
        location: formData.location || 'Main Venue / Route',
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
      setError(err.response?.data?.message || 'eventCreate.createFailed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-navy transition-colors"
      >
        <ArrowLeft size={14} />
        <span>{t('eventCreate.backToEvents')}</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card space-y-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-coral">{t('eventCreate.setupEyebrow')}</span>
          <h1 className="text-2xl font-heading font-extrabold text-navy mt-1">
            {t('eventCreate.heading')}
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            {t('eventCreate.subtitle')}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-coral/10 border border-coral/30 text-coral text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error.startsWith('eventCreate.') ? t(error) : error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
              {t('eventCreate.titleLabel')}
            </label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('eventCreate.titlePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
            />
          </div>

          {/* Category & Subcategory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('eventCreate.categoryLabel')}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50 font-medium"
              >
                {Object.keys(EVENT_CATEGORIES).map((key) => (
                  <option key={key} value={key}>
                    {EVENT_CATEGORIES[key].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('eventCreate.subcategoryLabel')}
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50 font-medium"
              >
                {subcategoriesList.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
                <option value="Custom">{t('eventCreate.customSubcategoryOption')}</option>
              </select>
            </div>
          </div>

          {/* Custom Subcategory input if selected */}
          {formData.subcategory === 'Custom' && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('eventCreate.customSubcategoryLabel')}
              </label>
              <input
                type="text"
                required
                name="customSubcategory"
                value={formData.customSubcategory}
                onChange={handleChange}
                placeholder={t('eventCreate.customSubcategoryPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
              />
            </div>
          )}

          {/* Auto-configured question dimensions highlight card */}
          <div className="p-4 rounded-2xl bg-lavender/30 border border-lavender/80 flex items-start gap-3">
            <Sparkles size={18} className="text-coral shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-navy">
                {t('eventCreate.templateTitle', { category: selectedCategoryConfig.name })}
              </p>
              <p className="text-charcoal/70 leading-relaxed">
                {selectedCategoryConfig.description}
                <br />
                <span className="text-charcoal/80 font-medium">
                  {t('eventCreate.templateBody')}
                </span>
              </p>
            </div>
          </div>

          {/* Venue Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('eventCreate.venueTypeLabel')}
              </label>
              <select
                name="venueType"
                value={formData.venueType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
              >
                <option value="in-person">{t('eventCreate.venueType.inPerson')}</option>
                <option value="virtual">{t('eventCreate.venueType.virtual')}</option>
                <option value="hybrid">{t('eventCreate.venueType.hybrid')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('eventCreate.locationLabel')}
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t('eventCreate.locationPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
              {t('eventCreate.descriptionLabel')}
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('eventCreate.descriptionPlaceholder')}
              className="w-full p-3 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50 resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('eventCreate.startDateLabel')}
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
                {t('eventCreate.endDateLabel')}
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

          {/* Target Responses & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('eventCreate.targetLabel')}
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="number"
                  min="5"
                  max="10000"
                  name="targetResponses"
                  value={formData.targetResponses}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-charcoal/15 text-xs focus:outline-none focus:border-coral bg-ivory-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('eventCreate.tagsLabel')}
              </label>
              <div className="relative">
                <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="text"
                  name="tagsString"
                  value={formData.tagsString}
                  onChange={handleChange}
                  placeholder={t('eventCreate.tagsPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-charcoal/15 text-xs focus:outline-none focus:border-coral bg-ivory-50"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-charcoal/10">
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl border border-charcoal/15 text-charcoal/70 hover:text-navy text-xs font-bold transition-colors"
            >
              {t('eventCreate.cancel')}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>{t('eventCreate.creating')}</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>{t('eventCreate.submit')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
