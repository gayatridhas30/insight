import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Globe,
  User,
  Smile,
  Meh,
  Frown,
  Eye,
  FileSpreadsheet,
  Volume2,
} from 'lucide-react';
import { feedbackService, eventService } from '../../api/services';

export const FeedbackResponsesPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    fetchResponses();
  }, [id, sentimentFilter, languageFilter]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const [evtRes, respRes] = await Promise.all([
        eventService.getEventById(id),
        feedbackService.getResponsesByEvent(id, {
          sentiment: sentimentFilter || undefined,
          language: languageFilter || undefined,
          limit: 50,
        }),
      ]);

      if (evtRes.data?.success) setEvent(evtRes.data.event);
      if (respRes.data?.success) setResponses(respRes.data.responses || []);
    } catch (err) {
      console.warn('Responses fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentBadge = (label) => {
    if (label === 'positive') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sage/30 text-sage-dark">
          <Smile size={12} />
          <span>{t('responses.sentiments.positive')}</span>
        </span>
      );
    }
    if (label === 'negative') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-coral/20 text-coral">
          <Frown size={12} />
          <span>{t('responses.sentiments.negative')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-lavender/50 text-navy">
        <Meh size={12} />
        <span>{t('responses.sentiments.neutral')}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/events/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-navy transition-colors mb-1"
          >
            <ArrowLeft size={14} />
            <span>{t('responses.backToEvent')}</span>
          </Link>
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            {t('responses.title')}
          </h1>
          <p className="text-xs text-charcoal/60">
            {event?.title} ({t('responses.responsesRecorded', { count: responses.length })})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/events/${id}/ai`}
            className="px-4 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all"
          >
            {t('responses.viewAI')}
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-charcoal/10 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-charcoal/15 bg-ivory-50 text-charcoal"
          >
            <option value="">{t('responses.allSentiments')}</option>
            <option value="positive">{t('responses.positiveOnly')}</option>
            <option value="neutral">{t('responses.neutralOnly')}</option>
            <option value="negative">{t('responses.negativeOnly')}</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-charcoal/15 bg-ivory-50 text-charcoal"
          >
            <option value="">{t('responses.allLanguages')}</option>
            <option value="en">{t('responses.langEnglish')}</option>
            <option value="hi">{t('responses.langHindi')}</option>
            <option value="mr">{t('responses.langMarathi')}</option>
          </select>
        </div>

        <span className="text-xs text-charcoal/60 font-medium">
          {t('responses.showingEntries', { count: responses.length })}
        </span>
      </div>

      {/* Responses Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-sm font-semibold text-navy">
          <RefreshCw size={20} className="animate-spin text-coral mr-2" />
          <span>{t('responses.loading')}</span>
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-charcoal/10 space-y-3">
          <MessageSquare size={36} className="text-coral mx-auto" />
          <h3 className="text-base font-bold text-navy">{t('responses.emptyTitle')}</h3>
          <p className="text-xs text-charcoal/60">{t('responses.emptyDesc')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-charcoal/10 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory border-b border-charcoal/10 text-charcoal/70 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">{t('responses.thParticipant')}</th>
                  <th className="py-3.5 px-4">{t('responses.thLanguage')}</th>
                  <th className="py-3.5 px-4">{t('responses.thRating')}</th>
                  <th className="py-3.5 px-4">{t('responses.thSentiment')}</th>
                  <th className="py-3.5 px-4">{t('responses.thSnippet')}</th>
                  <th className="py-3.5 px-4 text-right">{t('responses.thActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {responses.map((r) => {
                  const txtAns = r.answers?.find((a) => a.textResponseOriginal || a.textResponseTranslated);
                  const rateAns = r.answers?.find((a) => a.ratingValue !== undefined);
                  const hasVoice = Boolean(txtAns?.audioUrl || txtAns?.audioTranscriptionOriginal);

                  return (
                    <tr key={r._id} className="hover:bg-ivory/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-navy">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-charcoal/40" />
                          <span>{r.isAnonymous ? t('responses.anonymous') : r.participantName || t('responses.attendee')}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold uppercase text-coral">
                        <span className="flex items-center gap-1">
                          <Globe size={12} />
                          <span>{r.submissionLanguage || 'en'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-navy">
                        {rateAns?.ratingValue !== undefined ? `${rateAns.ratingValue} / 5` : t('responses.notAvailable')}
                      </td>

                      <td className="py-3.5 px-4">
                        {getSentimentBadge(r.sentimentLabel)}
                      </td>

                      <td className="py-3.5 px-4 text-charcoal/80 max-w-xs truncate">
                        {hasVoice && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-coral font-bold mr-1">
                            <Volume2 size={11} />
                            <span>{t('responses.voiceLabel')}</span>
                          </span>
                        )}
                        <span>{txtAns?.textResponseTranslated || txtAns?.textResponseOriginal || t('responses.noTextAnswer')}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedResponse(r)}
                          className="px-2.5 py-1 rounded-lg bg-ivory hover:bg-navy hover:text-white text-navy font-bold text-[11px] transition-colors"
                        >
                          {t('responses.inspect')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response Detail Drawer / Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-card border border-charcoal/10 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-coral tracking-wider font-mono">
                  {t('responses.modalKicker')}
                </span>
                <h3 className="text-lg font-heading font-bold text-navy mt-0.5">
                  {selectedResponse.isAnonymous ? t('responses.anonymousParticipant') : selectedResponse.participantName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-1 rounded-lg text-charcoal/50 hover:text-navy text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-ivory rounded-2xl p-4 border border-charcoal/10">
              <div>
                <span className="text-charcoal/50 block">{t('responses.labelLanguage')}</span>
                <span className="font-bold uppercase text-navy">{selectedResponse.submissionLanguage}</span>
              </div>
              <div>
                <span className="text-charcoal/50 block">{t('responses.labelSentiment')}</span>
                <span className="font-bold capitalize text-coral">
                  {t(`responses.sentiments.${selectedResponse.sentimentLabel}`, { defaultValue: selectedResponse.sentimentLabel })}
                </span>
              </div>
              <div>
                <span className="text-charcoal/50 block">{t('responses.labelScore')}</span>
                <span className="font-bold text-navy">{selectedResponse.sentimentScore}</span>
              </div>
              <div>
                <span className="text-charcoal/50 block">{t('responses.labelDate')}</span>
                <span className="font-bold text-navy">
                  {new Date(selectedResponse.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Answer items */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-navy">{t('responses.submittedAnswers')}</h4>
              {selectedResponse.answers?.map((ans, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-ivory-50 border border-charcoal/10 space-y-2 text-xs">
                  <span className="font-bold text-navy block">
                    {t('responses.question', { num: idx + 1, question: ans.questionPrompt })}
                  </span>

                  {ans.ratingValue !== undefined && (
                    <div className="text-coral font-bold">
                      {t('responses.ratingLabel', { rating: ans.ratingValue })}
                    </div>
                  )}

                  {ans.selectedOptions?.length > 0 && (
                    <div className="text-charcoal/80">
                      {t('responses.selectedLabel', { options: ans.selectedOptions.join(', ') })}
                    </div>
                  )}

                  {/* Dual text preservation */}
                  {(ans.textResponseOriginal || ans.textResponseTranslated) && (
                    <div className="space-y-2 pt-2 border-t border-charcoal/10">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-charcoal/50">
                          {t('responses.originalText', { lang: selectedResponse.submissionLanguage.toUpperCase() })}
                        </span>
                        <p className="p-2.5 bg-white rounded-xl border border-charcoal/10 text-charcoal mt-1">
                          {ans.textResponseOriginal || t('responses.notAvailable')}
                        </p>
                      </div>

                      {selectedResponse.submissionLanguage !== 'en' && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-coral">
                            {t('responses.bhashiniTranslation')}
                          </span>
                          <p className="p-2.5 bg-coral/5 rounded-xl border border-coral/20 text-navy mt-1">
                            {ans.textResponseTranslated || t('responses.notAvailable')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="px-5 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-700 transition-colors"
              >
                {t('responses.closeInspector')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackResponsesPage;
