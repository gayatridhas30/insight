import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Send,
  Sparkles,
  Quote,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  User,
} from 'lucide-react';
import { aiIntelligenceService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

export const AIAssistantPage = () => {
  const { t } = useTranslation();
  const { activeOrganization } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      textKey: 'aiAssistant.welcome',
      orgName: activeOrganization?.name,
      supportingEvidence: [],
      timestampKey: 'aiAssistant.justNow',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedQueryKeys = [
    'aiAssistant.suggestionIssues',
    'aiAssistant.suggestionSound',
    'aiAssistant.suggestionWorkshops',
    'aiAssistant.suggestionTrends',
    'aiAssistant.suggestionPriorities',
  ];

  const getMessageText = (m) => {
    if (!m.textKey) return m.text;
    return t(m.textKey, {
      org: m.orgName || activeOrganization?.name || t('aiAssistant.yourOrganization'),
      defaultValue: m.text,
    });
  };

  const handleSend = async (queryText) => {
    const q = queryText || query;
    if (!q.trim()) return;

    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await aiIntelligenceService.queryRAG({
        organizationId: activeOrganization?.id,
        query: q,
      });

      if (res.data?.success) {
        const result = res.data.result;
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: result.answer,
            supportingEvidence: result.supportingEvidence || [],
            confidence: result.confidence || 0.92,
            sourcesCount: result.sourcesCount || 0,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          textKey: 'aiAssistant.errorResponse',
          supportingEvidence: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn h-[calc(100vh-120px)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-charcoal/10 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-navy">
              {t('aiAssistant.title')}
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-coral/10 text-coral">
              {t('aiAssistant.vectorBadge')}
            </span>
          </div>
          <p className="text-xs text-charcoal/60">
            {t('aiAssistant.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-sage-dark font-medium bg-sage/10 px-3 py-1 rounded-xl">
          <ShieldCheck size={14} />
          <span>{t('aiAssistant.isolated')}</span>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="space-y-1.5 shrink-0">
        <span className="text-[11px] font-bold text-charcoal/50 uppercase tracking-wider">
          {t('aiAssistant.suggestedQuestions')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQueryKeys.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(t(sq))}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-charcoal/10 hover:border-coral hover:text-coral text-charcoal/80 transition-all font-medium shadow-xs"
            >
              {t(sq)}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                m.sender === 'user' ? 'bg-coral' : 'bg-navy'
              }`}
            >
              {m.sender === 'user' ? <User size={16} /> : <Bot size={16} className="text-coral" />}
            </div>

            <div
              className={`max-w-xl rounded-3xl p-5 border text-xs sm:text-sm space-y-3 ${
                m.sender === 'user'
                  ? 'bg-coral text-white border-coral rounded-tr-none'
                  : 'bg-white text-charcoal border-charcoal/10 shadow-subtle rounded-tl-none'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{getMessageText(m)}</p>

              {/* Supporting Evidence Drawer */}
              {m.supportingEvidence && m.supportingEvidence.length > 0 && (
                <div className="pt-3 border-t border-charcoal/10 space-y-1.5 text-xs">
                  <span className="font-bold text-navy block text-[11px] uppercase tracking-wider">
                    {t('aiAssistant.supportingCitations')}
                  </span>
                  {m.supportingEvidence.map((ev, evIdx) => (
                    <div
                      key={evIdx}
                      className="p-2.5 rounded-xl bg-ivory border border-charcoal/10 text-charcoal/80 flex items-start gap-1.5 italic"
                    >
                      <Quote size={12} className="text-coral shrink-0 mt-0.5" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              )}

              <span className={`block text-[10px] ${m.sender === 'user' ? 'text-white/70' : 'text-charcoal/40'} text-right`}>
                {m.timestampKey ? t(m.timestampKey) : m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-coral animate-pulse p-2">
            <RefreshCw size={14} className="animate-spin" />
            <span>{t('aiAssistant.loading')}</span>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative shrink-0 pt-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('aiAssistant.placeholder')}
          className="w-full pl-5 pr-14 py-3.5 rounded-2xl border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/20 shadow-subtle"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white transition-all disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default AIAssistantPage;
