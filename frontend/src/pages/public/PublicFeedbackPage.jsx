import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  ShieldCheck,
  RefreshCw,
  Wand2,
  Check,
  ArrowRight,
  Home,
  Clock,
  Lock,
  Tag,
} from 'lucide-react';
import { eventService, feedbackService } from '../../api/services';
import { StarRating } from '../../components/feedback/StarRating';
import { NPSRating } from '../../components/feedback/NPSRating';
import { VoiceRecorder } from '../../components/feedback/VoiceRecorder';
import { LanguageSelector } from '../../components/feedback/LanguageSelector';
import { getCategoryBadge } from '../../config/eventCategories';

export const PublicFeedbackPage = () => {
  const { t, i18n } = useTranslation();
  const { code } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Participant form state
  const selectedLanguage = i18n.language || 'en';
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [answers, setAnswers] = useState({}); // questionId -> { ratingValue, selectedOptions, textResponse, audioUrl }
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentimentLabel, setSentimentLabel] = useState('positive');
  const [missingQuestionId, setMissingQuestionId] = useState(null);

  const questionRefs = useRef({});

  const errorText = error ? (error.key ? t(error.key, error.params) : error.message) : '';

  useEffect(() => {
    fetchEventData();
  }, [code]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventCode = (code || 'RUN-2026').toUpperCase();
      const res = await eventService.getEventByCode(eventCode);
      if (res.data?.success) {
        setEvent(res.data.event);
        setForm(res.data.form);
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError({ message: err.response.data.message });
      } else {
        setError({ key: 'feedbackPage.loadError', params: { code } });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
    if (missingQuestionId === questionId) {
      setMissingQuestionId(null);
      setError(null);
    }
  };

  const handleMultiChoiceToggle = (questionId, optionId) => {
    const current = answers[questionId]?.selectedOptions || [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    handleAnswerChange(questionId, 'selectedOptions', updated);
  };

  // Helper: Count answered questions
  const requiredQuestions = questions.filter((q) => q.isRequired);
  const answeredRequiredCount = requiredQuestions.filter((q) => {
    const a = answers[q._id];
    if (q.type === 'star_rating' || q.type === 'nps')
      return a?.ratingValue !== undefined && a?.ratingValue !== null;
    if (q.type === 'single_choice' || q.type === 'multi_choice' || q.type === 'yes_no')
      return a?.selectedOptions?.length > 0;
    if (q.type === 'short_text' || q.type === 'long_text')
      return Boolean(a?.textResponse?.trim());
    return false;
  }).length;

  // 1-Click Quick Fill Demo Button for Evaluators with Category Awareness
  const handleQuickFill = () => {
    const cat = (event?.category || '').toLowerCase();
    const sample = {};

    let sampleComment = '';
    if (cat.includes('marathon') || cat.includes('run')) {
      sampleComment = t('feedbackPage.sampleComments.marathon');
    } else if (cat.includes('concert') || cat.includes('music')) {
      sampleComment = t('feedbackPage.sampleComments.concert');
    } else if (cat.includes('sports')) {
      sampleComment = t('feedbackPage.sampleComments.sports');
    } else {
      sampleComment = t('feedbackPage.sampleComments.general');
    }

    questions.forEach((q) => {
      if (q.type === 'star_rating') {
        sample[q._id] = { ratingValue: 5 };
      } else if (q.type === 'nps') {
        sample[q._id] = { ratingValue: 9 };
      } else if (q.type === 'single_choice') {
        sample[q._id] = { selectedOptions: [q.options?.[0]?.id || 'opt_1'] };
      } else if (q.type === 'multi_choice') {
        sample[q._id] = { selectedOptions: [q.options?.[0]?.id || 'opt_1'] };
      } else if (q.type === 'yes_no') {
        sample[q._id] = { selectedOptions: ['yes'] };
      } else if (q.type === 'short_text') {
        sample[q._id] = { textResponse: t('feedbackPage.sampleShortText') };
      } else if (q.type === 'long_text') {
        sample[q._id] = { textResponse: sampleComment };
      }
    });

    setAnswers(sample);
    setError(null);
    setMissingQuestionId(null);
  };

  const getLocalized = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[selectedLanguage] || obj.en || Object.values(obj)[0] || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMissingQuestionId(null);

    // Validate required questions
    for (const q of questions) {
      if (q.isRequired) {
        const ans = answers[q._id];
        let isAnswered = false;

        if (q.type === 'star_rating' || q.type === 'nps') {
          isAnswered = ans?.ratingValue !== undefined && ans?.ratingValue !== null;
        } else if (
          q.type === 'single_choice' ||
          q.type === 'multi_choice' ||
          q.type === 'yes_no'
        ) {
          isAnswered = ans?.selectedOptions && ans.selectedOptions.length > 0;
        } else if (q.type === 'long_text' || q.type === 'short_text') {
          isAnswered = Boolean(ans?.textResponse && ans.textResponse.trim().length > 0);
        }

        if (!isAnswered) {
          const promptText = getLocalized(q.prompt);
          setError({ key: 'feedbackPage.requiredQuestionError', params: { prompt: promptText } });
          setMissingQuestionId(q._id);
          setSubmitting(false);

          if (questionRefs.current[q._id]) {
            questionRefs.current[q._id].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }
    }

    try {
      const payloadAnswers = questions.map((q) => {
        const userAns = answers[q._id] || {};
        return {
          questionId: q._id,
          questionType: q.type,
          questionPrompt: getLocalized(q.prompt),
          ratingValue: userAns.ratingValue,
          selectedOptions: userAns.selectedOptions || [],
          textResponse: userAns.textResponse || '',
          audioUrl: userAns.audioUrl || '',
          audioTranscription: userAns.textResponse || '',
        };
      });

      const res = await feedbackService.submitFeedback({
        eventCode: event.code,
        submissionLanguage: selectedLanguage,
        isAnonymous,
        participantName: isAnonymous ? '' : participantName,
        participantEmail: isAnonymous ? '' : participantEmail,
        answers: payloadAnswers,
      });

      if (res.data?.success) {
        setSubmitted(true);
        setSentimentLabel(res.data.sentimentLabel || 'positive');
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#10B981', '#0F172A', '#EEF2FF', '#F59E0B'],
        });
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError({ message: err.response.data.message });
      } else {
        setError({ key: 'feedbackPage.submitError' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-navy bg-white p-6 rounded-2xl shadow-card">
          <RefreshCw size={20} className="animate-spin text-coral" />
          <span>{t('feedbackPage.loading', { code: code || 'RUN-2026' })}</span>
        </div>
      </div>
    );
  }

  // Event not found error
  if (errorText && !event) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-heading font-extrabold text-navy">{t('feedbackPage.eventNotFound')}</h2>
          <p className="text-xs text-charcoal/70">{errorText}</p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/feedback/RUN-2026"
              className="w-full py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold transition-all"
            >
              {t('feedbackPage.openMarathonDemo')}
            </Link>
            <Link
              to="/feedback/HACK-2026"
              className="w-full py-2.5 rounded-xl bg-navy hover:bg-navy-900 text-white text-xs font-bold transition-all"
            >
              {t('feedbackPage.openHackathonDemo')}
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-ivory text-navy text-xs font-bold hover:bg-charcoal/10 transition-colors"
            >
              {t('feedbackPage.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Closed Event Status Check
  const isClosed = !event?.isFeedbackOpen;
  const isDraft = event?.status === 'draft';
  const isExpired = event?.feedbackDeadline && new Date() > new Date(event.feedbackDeadline);

  if (isClosed || isDraft || isExpired) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-navy">
            {t('feedbackPage.closedTitle')}
          </h2>
          <p className="text-xs text-charcoal/70 leading-relaxed">
            {isDraft
              ? t('feedbackPage.draftMsg')
              : isExpired
              ? t('feedbackPage.deadlineMsg')
              : t('feedbackPage.closedMsg')}
          </p>
          <div className="p-3 bg-ivory rounded-xl border border-charcoal/10 text-xs font-medium text-navy">
            {t('feedbackPage.event')}: {event?.title} ({event?.code})
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-900 transition-all"
            >
              {t('feedbackPage.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Submission Confirmed Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-charcoal/10 shadow-card text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-sage text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy">
              {t('feedback.thankYou')}
            </h2>
            <p className="text-sm text-charcoal/70">
              {t('feedbackPage.thankYouDesc')}
            </p>
          </div>

          <div className="bg-ivory rounded-2xl p-4 border border-charcoal/10 text-left space-y-2 text-xs">
            <div className="flex justify-between text-charcoal/60">
              <span>{t('feedbackPage.event')}:</span>
              <span className="font-bold text-navy">
                {event?.title} ({event?.code})
              </span>
            </div>
            <div className="flex justify-between text-charcoal/60">
              <span>{t('feedbackPage.category')}:</span>
              <span className="font-bold text-navy">
                {event?.category} {event?.subcategory ? `• ${event.subcategory}` : ''}
              </span>
            </div>
            <div className="flex justify-between text-charcoal/60">
              <span>{t('feedbackPage.mode')}:</span>
              <span className="font-bold text-navy">
                {isAnonymous
                  ? t('feedbackPage.modeAnonymous')
                  : participantName || t('feedbackPage.modeIdentified')}
              </span>
            </div>
            <div className="flex justify-between text-charcoal/60">
              <span>{t('feedbackPage.language')}:</span>
              <span className="font-bold uppercase text-coral">
                {t(`feedbackPage.languageNames.${selectedLanguage}`, selectedLanguage)}
              </span>
            </div>
            <div className="flex justify-between text-charcoal/60">
              <span>{t('feedbackPage.calculatedSentiment')}:</span>
              <span className="font-bold uppercase text-sage">
                {t(`feedbackPage.sentiment.${sentimentLabel}`, sentimentLabel)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
              className="flex-1 py-3 rounded-xl border border-charcoal/15 text-xs font-bold text-charcoal hover:border-coral transition-colors"
            >
              {t('feedbackPage.submitAnother')}
            </button>
            <Link
              to="/"
              className="flex-1 py-3 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <Home size={14} />
              <span>{t('feedbackPage.backHome')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryMeta = getCategoryBadge(event?.category);

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between selection:bg-coral/20 selection:text-coral">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-charcoal/10 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-subtle">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white">
            <Sparkles size={16} className="text-coral" />
          </div>
          <span className="text-base font-heading font-extrabold text-navy">
            Insight<span className="text-coral">Loop</span>
          </span>
        </Link>

        {/* Quick Language Switcher */}
        <LanguageSelector
          currentLanguage={selectedLanguage}
          onSelectLanguage={(lang) => {
            i18n.changeLanguage(lang);
            localStorage.setItem('insightloop_lang', lang);
          }}
          availableLanguages={form?.supportedLanguages || ['en', 'hi', 'mr']}
        />
      </header>

      {/* Main Feedback Form Body */}
      <main className="max-w-2xl w-full mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* Event Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${categoryMeta.badgeColor}`}
              >
                {event?.category || t('feedbackPage.event')}
              </span>
              {event?.subcategory && (
                <span className="text-[11px] font-semibold text-charcoal/70 bg-ivory-100 px-2.5 py-0.5 rounded-full border border-charcoal/10">
                  {event.subcategory}
                </span>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-navy bg-ivory px-2.5 py-1 rounded-lg border border-charcoal/10">
              {t('feedbackPage.codeLabel')}: {event?.code}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy leading-tight">
              {event?.title}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
              {form?.description || t('feedbackPage.defaultDescription')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-charcoal/10 text-xs text-charcoal/60">
            {event?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-coral shrink-0" />
                <span>{event.location}</span>
              </div>
            )}

            {/* Quick Fill Button for testing/evaluation ease */}
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory hover:bg-coral/10 text-charcoal/80 hover:text-coral border border-charcoal/15 text-xs font-bold transition-all ml-auto"
              title={t('feedbackPage.autoFillTitle')}
            >
              <Wand2 size={13} className="text-coral" />
              <span>{t('feedbackPage.autoFill')}</span>
            </button>
          </div>
        </div>

        {/* Form Settings / Identity Options */}
        {form?.isAnonymousAllowed && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-charcoal/10 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-navy block">{t('feedbackPage.privacy')}</span>
              <span className="text-[11px] text-charcoal/60">
                {isAnonymous ? t('feedbackPage.anonDesc') : t('feedbackPage.identDesc')}
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isAnonymous
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-ivory text-charcoal/70 hover:bg-charcoal/10'
                }`}
              >
                {t('feedback.anonymous')}
              </button>
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !isAnonymous
                    ? 'bg-coral text-white shadow-sm'
                    : 'bg-ivory text-charcoal/70 hover:bg-charcoal/10'
                }`}
              >
                {t('feedback.identified')}
              </button>
            </div>
          </div>
        )}

        {/* Identified Participant Fields */}
        {!isAnonymous && (
          <div className="bg-white rounded-2xl p-5 border border-charcoal/10 shadow-subtle grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('feedback.namePlaceholder')}
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder={t('feedbackPage.nameExample')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                {t('feedback.emailPlaceholder')}
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder={t('feedbackPage.emailExample')}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error notification banner (Top) */}
        {errorText && (
          <div className="p-4 rounded-2xl bg-coral/10 border border-coral/30 text-coral text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Questions Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => {
            const promptText = getLocalized(q.prompt);
            const descText = getLocalized(q.description);
            const ans = answers[q._id] || {};
            const isMissing = missingQuestionId === q._id;

            return (
              <div
                key={q._id}
                ref={(el) => (questionRefs.current[q._id] = el)}
                className={`bg-white rounded-3xl p-6 sm:p-7 border shadow-subtle space-y-4 transition-all ${
                  isMissing
                    ? 'border-coral ring-2 ring-coral/20 bg-coral/5'
                    : 'border-charcoal/10 hover:border-charcoal/20'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-coral font-mono">
                      {t('feedbackPage.questionLabel', { n: idx + 1 })}
                    </span>
                    {q.isRequired ? (
                      <span className="text-[10px] uppercase font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full">
                        {t('feedbackPage.required')}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-charcoal/50 bg-ivory px-2 py-0.5 rounded-full">
                        {t('feedbackPage.optional')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-navy mt-1.5">
                    {promptText}
                  </h3>
                  {descText && (
                    <p className="text-xs text-charcoal/60 mt-0.5">{descText}</p>
                  )}
                </div>

                {/* Question Type Inputs */}
                {q.type === 'star_rating' && (
                  <StarRating
                    value={ans.ratingValue || 0}
                    onChange={(val) => handleAnswerChange(q._id, 'ratingValue', val)}
                    size={32}
                  />
                )}

                {q.type === 'nps' && (
                  <NPSRating
                    value={ans.ratingValue}
                    onChange={(val) => handleAnswerChange(q._id, 'ratingValue', val)}
                  />
                )}

                {q.type === 'single_choice' && (
                  <div className="space-y-2">
                    {q.options?.map((opt) => {
                      const isSelected = ans.selectedOptions?.[0] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleAnswerChange(q._id, 'selectedOptions', [opt.id])}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-coral bg-coral/5 font-semibold text-coral shadow-sm'
                              : 'border-charcoal/15 bg-ivory-50 text-charcoal hover:border-charcoal/30'
                          }`}
                        >
                          <span>{getLocalized(opt.label)}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-coral bg-coral text-white' : 'border-charcoal/30'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'multi_choice' && (
                  <div className="space-y-2">
                    {q.options?.map((opt) => {
                      const isSelected = (ans.selectedOptions || []).includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleMultiChoiceToggle(q._id, opt.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-coral bg-coral/5 font-semibold text-coral shadow-sm'
                              : 'border-charcoal/15 bg-ivory-50 text-charcoal hover:border-charcoal/30'
                          }`}
                        >
                          <span>{getLocalized(opt.label)}</span>
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isSelected ? 'border-coral bg-coral text-white' : 'border-charcoal/30'
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(q._id, 'selectedOptions', ['yes'])}
                      className={`py-3 rounded-2xl border text-sm font-bold transition-all ${
                        ans.selectedOptions?.[0] === 'yes'
                          ? 'bg-sage text-white border-sage shadow-sm'
                          : 'bg-ivory border-charcoal/15 text-charcoal hover:border-charcoal/30'
                      }`}
                    >
                      {t('feedbackPage.yes')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(q._id, 'selectedOptions', ['no'])}
                      className={`py-3 rounded-2xl border text-sm font-bold transition-all ${
                        ans.selectedOptions?.[0] === 'no'
                          ? 'bg-coral text-white border-coral shadow-sm'
                          : 'bg-ivory border-charcoal/15 text-charcoal hover:border-charcoal/30'
                      }`}
                    >
                      {t('feedbackPage.no')}
                    </button>
                  </div>
                )}

                {q.type === 'short_text' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={ans.textResponse || ''}
                      onChange={(e) => handleAnswerChange(q._id, 'textResponse', e.target.value)}
                      placeholder={t('feedbackPage.typeResponse')}
                      className="w-full p-3 rounded-2xl border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-coral"
                    />

                    {form?.allowVoiceFeedback && (
                      <VoiceRecorder
                        language={selectedLanguage}
                        currentText={ans.textResponse || ''}
                        onTranscriptionChange={(text, audioUrl) => {
                          handleAnswerChange(q._id, 'textResponse', text);
                          if (audioUrl) {
                            handleAnswerChange(q._id, 'audioUrl', audioUrl);
                          }
                        }}
                      />
                    )}
                  </div>
                )}

                {q.type === 'long_text' && (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={ans.textResponse || ''}
                      onChange={(e) => handleAnswerChange(q._id, 'textResponse', e.target.value)}
                      placeholder={t('feedbackPage.typeResponse')}
                      className="w-full p-3.5 rounded-2xl border border-charcoal/15 bg-ivory-50 text-sm focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/20 resize-none"
                    />

                    {form?.allowVoiceFeedback && (
                      <VoiceRecorder
                        language={selectedLanguage}
                        currentText={ans.textResponse || ''}
                        onTranscriptionChange={(text, audioUrl) => {
                          handleAnswerChange(q._id, 'textResponse', text);
                          if (audioUrl) {
                            handleAnswerChange(q._id, 'audioUrl', audioUrl);
                          }
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Error Banner right above submit if present */}
          {errorText && (
            <div className="p-4 rounded-2xl bg-coral/10 border border-coral/30 text-coral text-xs font-bold flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Submit Action Block */}
          <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-card space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-navy">
              <span>{t('feedbackPage.completed')}</span>
              <span
                className={
                  answeredRequiredCount >= requiredQuestions.length
                    ? 'text-sage'
                    : 'text-coral'
                }
              >
                {t('feedbackPage.completedCount', {
                  answered: answeredRequiredCount,
                  total: requiredQuestions.length,
                })}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-coral hover:bg-coral-hover text-white text-base font-bold shadow-coral-glow hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>{t('feedback.submitting')}</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>{t('feedback.submit')}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-charcoal/50 text-center">
              {t('feedbackPage.secureNote')}
            </p>
          </div>
        </form>
      </main>

      {/* Simplified Mobile-Optimized Footer */}
      <footer className="py-6 border-t border-charcoal/10 bg-white text-center text-xs text-charcoal/50">
        {t('feedbackPage.footerText')}
      </footer>
    </div>
  );
};

export default PublicFeedbackPage;
