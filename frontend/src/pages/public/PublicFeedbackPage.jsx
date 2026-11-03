import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  Mail,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { eventService, feedbackService } from '../../api/services';
import { StarRating } from '../../components/feedback/StarRating';
import { NPSRating } from '../../components/feedback/NPSRating';
import { VoiceRecorder } from '../../components/feedback/VoiceRecorder';
import { LanguageSelector } from '../../components/feedback/LanguageSelector';

export const PublicFeedbackPage = () => {
  const { code } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Participant form state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [answers, setAnswers] = useState({}); // questionId -> { rating, selectedOptions, textResponse, audioUrl }
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentimentLabel, setSentimentLabel] = useState('positive');

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const res = await eventService.getEventByCode(code || 'HACK-2026');
        if (res.data?.success) {
          setEvent(res.data.event);
          setForm(res.data.form);
          setQuestions(res.data.questions || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Event not found or feedback is not available.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [code]);

  const handleAnswerChange = (questionId, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
  };

  const handleMultiChoiceToggle = (questionId, optionId) => {
    const current = answers[questionId]?.selectedOptions || [];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    handleAnswerChange(questionId, 'selectedOptions', updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate required questions
    for (const q of questions) {
      if (q.isRequired) {
        const ans = answers[q._id];
        if (q.type === 'star_rating' || q.type === 'nps') {
          if (!ans?.ratingValue && ans?.ratingValue !== 0) {
            setError(`Please answer the required question: "${getLocalized(q.prompt)}"`);
            setSubmitting(false);
            return;
          }
        } else if (q.type === 'single_choice' || q.type === 'multi_choice') {
          if (!ans?.selectedOptions || ans.selectedOptions.length === 0) {
            setError(`Please select an option for: "${getLocalized(q.prompt)}"`);
            setSubmitting(false);
            return;
          }
        } else if (q.type === 'long_text' || q.type === 'short_text') {
          if (!ans?.textResponse || ans.textResponse.trim() === '') {
            setError(`Please provide feedback for: "${getLocalized(q.prompt)}"`);
            setSubmitting(false);
            return;
          }
        }
      }
    }

    try {
      const payloadAnswers = questions.map((q) => {
        const userAns = answers[q._id] || {};
        return {
          questionId: q._id,
          questionType: q.type,
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
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF7058', '#A9B9A0', '#17243A', '#DCD7F5'],
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please check your submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const getLocalized = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[selectedLanguage] || obj.en || Object.values(obj)[0] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral" />
          <span>Loading event feedback form...</span>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-heading font-extrabold text-navy">Form Unavailable</h2>
          <p className="text-xs text-charcoal/70">{error}</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-700 transition-colors"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Submission Confirmed Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-charcoal/10 shadow-card text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-sage-dark text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy">
              Thank You for Your Feedback!
            </h2>
            <p className="text-sm text-charcoal/70">
              Your response for <span className="font-bold text-navy">{event?.title}</span> has been securely recorded and will be synthesized by the InsightLoop AI engine.
            </p>
          </div>

          <div className="bg-ivory rounded-2xl p-4 border border-charcoal/10 text-left space-y-2 text-xs">
            <div className="flex justify-between text-charcoal/60">
              <span>Event:</span>
              <span className="font-bold text-navy">{event?.title} ({event?.code})</span>
            </div>
            <div className="flex justify-between text-charcoal/60">
              <span>Mode:</span>
              <span className="font-bold text-navy">{isAnonymous ? 'Anonymous' : participantName || 'Identified'}</span>
            </div>
            <div className="flex justify-between text-charcoal/60">
              <span>Language:</span>
              <span className="font-bold uppercase text-coral">{selectedLanguage}</span>
            </div>
            <div className="flex justify-between text-charcoal/60">
              <span>Estimated Polarity:</span>
              <span className="font-bold uppercase text-sage-dark">{sentimentLabel}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
              }}
              className="flex-1 py-3 rounded-xl border border-charcoal/15 text-xs font-bold text-charcoal hover:border-coral transition-colors"
            >
              Submit Another Response
            </button>
            <Link
              to="/"
              className="flex-1 py-3 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-700 transition-colors flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-charcoal/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white">
            <Sparkles size={16} className="text-coral" />
          </div>
          <span className="text-base font-heading font-extrabold text-navy">
            Insight<span className="text-coral">Loop</span>
          </span>
        </Link>

        {/* Language Switcher */}
        <LanguageSelector
          currentLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          availableLanguages={form?.supportedLanguages || ['en', 'hi', 'mr']}
        />
      </header>

      {/* Main Feedback Form Body */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 space-y-6">
        {/* Event Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-coral/10 text-coral">
              {event?.category || 'Event'}
            </span>
            <span className="text-xs font-mono font-bold text-charcoal/60 bg-ivory px-2.5 py-1 rounded-lg border border-charcoal/10">
              Code: {event?.code}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy leading-tight">
              {event?.title}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
              {form?.description || 'Your feedback helps the organizers improve subsequent editions.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-charcoal/60 border-t border-charcoal/10">
            {event?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-coral" />
                <span>{event.location}</span>
              </div>
            )}
            {event?.organization?.name && (
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-sage-dark" />
                <span>{event.organization.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Settings / Identity Options */}
        {form?.isAnonymousAllowed && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-charcoal/10 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-navy block">Submission Privacy</span>
              <span className="text-[11px] text-charcoal/60">
                {isAnonymous
                  ? 'Your identity is fully concealed. No name or email is recorded.'
                  : 'Your contact details will be shared with the event organizer.'}
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isAnonymous
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-ivory text-charcoal/70 hover:bg-charcoal/10'
                }`}
              >
                Anonymous
              </button>
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !isAnonymous
                    ? 'bg-coral text-white shadow-sm'
                    : 'bg-ivory text-charcoal/70 hover:bg-charcoal/10'
                }`}
              >
                Identified
              </button>
            </div>
          </div>
        )}

        {/* Identified Participant Fields */}
        {!isAnonymous && (
          <div className="bg-white rounded-2xl p-5 border border-charcoal/10 shadow-subtle grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Your Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Aarav Mehta"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Your Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                <input
                  type="email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="aarav@college.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal/15 bg-ivory-50 focus:outline-none focus:border-coral"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-coral/10 border border-coral/30 text-coral text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Questions Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => {
            const promptText = getLocalized(q.prompt);
            const descText = getLocalized(q.description);
            const ans = answers[q._id] || {};

            return (
              <div
                key={q._id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal/10 shadow-subtle space-y-4 hover:border-charcoal/20 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-coral font-heading">
                      Q{idx + 1}
                    </span>
                    {q.isRequired && (
                      <span className="text-[10px] uppercase font-bold text-coral/80 bg-coral/10 px-1.5 py-0.2 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-navy mt-1">
                    {promptText}
                  </h3>
                  {descText && (
                    <p className="text-xs text-charcoal/60 mt-0.5">{descText}</p>
                  )}
                </div>

                {/* Render Question Inputs depending on Type */}
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
                            {isSelected && <CheckCircle2 size={12} />}
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
                          ? 'bg-sage-dark text-white border-sage-dark shadow-sm'
                          : 'bg-ivory border-charcoal/15 text-charcoal hover:border-charcoal/30'
                      }`}
                    >
                      {selectedLanguage === 'mr' ? 'होय (Yes)' : selectedLanguage === 'hi' ? 'हाँ (Yes)' : 'Yes'}
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
                      {selectedLanguage === 'mr' ? 'नाही (No)' : selectedLanguage === 'hi' ? 'ना (No)' : 'No'}
                    </button>
                  </div>
                )}

                {q.type === 'short_text' && (
                  <input
                    type="text"
                    value={ans.textResponse || ''}
                    onChange={(e) => handleAnswerChange(q._id, 'textResponse', e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full p-3 rounded-2xl border border-charcoal/15 bg-ivory-50 text-sm focus:outline-none focus:border-coral"
                  />
                )}

                {q.type === 'long_text' && (
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={ans.textResponse || ''}
                      onChange={(e) => handleAnswerChange(q._id, 'textResponse', e.target.value)}
                      placeholder="Type your feedback here, or use the voice recording button below..."
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

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-coral hover:bg-coral-hover text-white text-base font-bold shadow-coral-glow hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Response...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-charcoal/50 text-center mt-2.5">
              Responses are securely captured and analyzed using the InsightLoop intelligence engine.
            </p>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default PublicFeedbackPage;
