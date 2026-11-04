import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  QrCode,
  Mic,
  BrainCircuit,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Languages,
  Zap,
  Layers,
  FileCheck,
  TrendingUp,
  Search,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [eventCodeInput, setEventCodeInput] = useState('');

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (eventCodeInput.trim()) {
      navigate(`/feedback/${eventCodeInput.trim().toUpperCase()}`);
    }
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Create Event & Form',
      desc: 'Customize questions or generate an AI-tailored feedback form in seconds with star ratings, NPS, and choices.',
      icon: Layers,
    },
    {
      step: '02',
      title: 'Instant QR Code Access',
      desc: 'Display printable QR codes on presentation slides, badges, or venue posters. No attendee signup required.',
      icon: QrCode,
    },
    {
      step: '03',
      title: 'Bhashini Voice & Text',
      desc: 'Participants respond comfortably in English, Hindi, or Marathi via speech audio or text with real-time ASR.',
      icon: Mic,
    },
    {
      step: '04',
      title: 'AI Analysis & Themes',
      desc: 'Synthesize sentiment scores, detect recurring bottlenecks, cluster complaint categories, and extract highlights.',
      icon: BrainCircuit,
    },
    {
      step: '05',
      title: 'RAG Assistant & Action',
      desc: 'Ask natural language questions across historical event data and convert recommendations into tracked tasks.',
      icon: CheckCircle2,
    },
  ];

  const features = [
    {
      title: 'Universal Multilingual Voice & Text',
      desc: 'Powered by Bhashini APIs. Attendees can speak in Marathi or Hindi, review transcriptions, and submit without language barriers.',
      icon: Languages,
      tag: 'Bhashini ASR & NMT',
    },
    {
      title: 'RAG-Powered AI Assistant',
      desc: 'Ask your organization’s feedback knowledge base: "What were our top 3 logistical flaws?", "Did food complaints decrease?"',
      icon: BrainCircuit,
      tag: 'Vector Intelligence',
    },
    {
      title: 'Cross-Event Comparison',
      desc: 'Compare satisfaction indices, NPS shifts, and sentiment deltas across multiple workshops, hackathons, or annual summits.',
      icon: BarChart3,
      tag: 'Benchmarking',
    },
    {
      title: 'Continuous Improvement Tracker',
      desc: 'Turn AI recommendations directly into assignable team tasks to verify whether recurring issues are resolved in future events.',
      icon: CheckCircle2,
      tag: 'Actionable Loop',
    },
    {
      title: 'Dynamic Form Generator',
      desc: 'Intelligent form builder supporting Star ratings, NPS 0-10, single/multi select, Yes/No, and 1-click AI form prompts.',
      icon: Zap,
      tag: 'Custom Builder',
    },
    {
      title: 'Executive PDF & Excel Reports',
      desc: 'Export stakeholder-ready summary decks and raw data sheets preserving both original and translated attendee feedback.',
      icon: FileCheck,
      tag: 'Dual Export',
    },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral/10 border border-coral/30 text-coral text-xs font-bold tracking-wide uppercase shadow-subtle">
              <Sparkles size={14} />
              <span>{t('landing.badge')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-navy tracking-tight leading-[1.12]">
              {t('landing.headline')}
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-charcoal/70 leading-relaxed font-normal">
              {t('landing.subheadline')}
            </p>

            {/* QUICK ATTENDEE ACCESS BOX (Solve "How to submit response" immediately) */}
            <div className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-card max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-navy">
                <span className="flex items-center gap-1.5 text-coral">
                  <QrCode size={16} />
                  <span>Attending an Event? Submit Feedback Now</span>
                </span>
                <span className="text-[10px] text-charcoal/50 uppercase">No Login Required</span>
              </div>

              <form onSubmit={handleCodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="text"
                    value={eventCodeInput}
                    onChange={(e) => setEventCodeInput(e.target.value)}
                    placeholder="Enter 4-letter Code e.g. HACK-2026"
                    className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm font-mono font-bold uppercase rounded-xl border border-charcoal/15 bg-ivory focus:outline-none focus:border-coral"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs sm:text-sm font-bold shadow-coral-glow transition-all active:scale-95 shrink-0"
                >
                  Open Form
                </button>
              </form>

              {/* Quick sample pills */}
              <div className="flex items-center justify-center gap-2 pt-1 text-xs">
                <span className="text-charcoal/50 text-[11px]">Quick Demo Events:</span>
                <button
                  type="button"
                  onClick={() => navigate('/feedback/HACK-2026')}
                  className="px-2.5 py-1 rounded-lg bg-ivory hover:bg-coral/10 hover:text-coral border border-charcoal/10 font-mono text-[11px] font-bold text-navy transition-colors"
                >
                  HACK-2026
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/feedback/WORK-2026')}
                  className="px-2.5 py-1 rounded-lg bg-ivory hover:bg-coral/10 hover:text-coral border border-charcoal/10 font-mono text-[11px] font-bold text-navy transition-colors"
                >
                  WORK-2026
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/feedback/LEAD-2026')}
                  className="px-2.5 py-1 rounded-lg bg-ivory hover:bg-coral/10 hover:text-coral border border-charcoal/10 font-mono text-[11px] font-bold text-navy transition-colors"
                >
                  LEAD-2026
                </button>
              </div>
            </div>

            {/* Organizer Calls to Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-navy hover:bg-navy-700 text-white text-sm font-bold shadow-card transition-all flex items-center justify-center gap-2"
              >
                <span>{t('landing.ctaStart')}</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-charcoal/15 text-navy hover:border-coral hover:text-coral text-sm font-bold shadow-subtle transition-all flex items-center justify-center gap-2"
              >
                <span>Organizer Sign In</span>
              </Link>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal/60 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-sage-dark" />
                <span>No Attendee Sign-in Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-sage-dark" />
                <span>Bhashini Speech-to-Text</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-sage-dark" />
                <span>Multi-tenant Organization Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Feedback Intelligence Workflow */}
      <section className="py-20 bg-white border-y border-charcoal/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-coral">End-to-End Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy">
              From QR Scan to Actionable Event Intelligence
            </h2>
            <p className="text-sm text-charcoal/70">
              A structured lifecycle guaranteeing every participant opinion is captured, translated, synthesized, and acted upon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {workflowSteps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative p-6 rounded-3xl bg-ivory-50 border border-charcoal/10 flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-extrabold text-coral/40 font-heading">{item.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center shadow-sm">
                        <Icon size={18} className="text-coral" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-navy">{item.title}</h3>
                    <p className="text-xs text-charcoal/70 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-coral">Core Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy">
              Designed for Real Academic & Enterprise Evaluation
            </h2>
            <p className="text-sm text-charcoal/70">
              InsightLoop replaces fragmented Google Forms with deep sentiment clustering, cross-lingual intelligence, and automated accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white rounded-3xl p-7 border border-charcoal/10 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center shadow-sm">
                        <Icon size={22} className="text-coral" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-lavender/60 text-navy">
                        {feat.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-navy">{feat.title}</h3>
                    <p className="text-xs text-charcoal/70 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-navy text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            Ready to upgrade your next event with AI intelligence?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto text-sm">
            Sign up as an organizer in 30 seconds or test live feedback with our sample hackathon form.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl bg-coral hover:bg-coral-hover text-white text-sm font-bold shadow-coral-glow transition-all"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
