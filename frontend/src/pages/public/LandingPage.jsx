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
  Activity,
  Trophy,
  Music,
  Presentation,
  Laptop,
  Briefcase,
  Users,
  GraduationCap,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { EVENT_CATEGORIES } from '../../config/eventCategories';

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [eventCodeInput, setEventCodeInput] = useState('');
  const [activeCategoryKey, setActiveCategoryKey] = useState('Marathon');

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (eventCodeInput.trim()) {
      navigate(`/feedback/${eventCodeInput.trim().toUpperCase()}`);
    }
  };

  const categoryDemos = {
    Marathon: {
      title: t('landing.demo.marathon.title'),
      code: 'RUN-2026',
      subtitle: t('landing.demo.marathon.subtitle'),
      icon: Activity,
      color: 'from-emerald-500 to-teal-700',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      sampleDimensions: [
        t('landing.demo.marathon.d1'),
        t('landing.demo.marathon.d2'),
        t('landing.demo.marathon.d3'),
        t('landing.demo.marathon.d4'),
      ],
      sampleQuote: '"धावण्याचा मार्ग आणि पाण्याची सोय उत्तम होती. १५ किमी नंतर थोडे इलेक्ट्रोलाइट्स वाढवावेत."',
      quoteAuthor: t('landing.demo.marathon.author'),
      aiInsight: t('landing.demo.marathon.insight'),
    },
    Concert: {
      title: t('landing.demo.concert.title'),
      code: 'LIVE-2026',
      subtitle: t('landing.demo.concert.subtitle'),
      icon: Music,
      color: 'from-purple-500 to-indigo-700',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      sampleDimensions: [
        t('landing.demo.concert.d1'),
        t('landing.demo.concert.d2'),
        t('landing.demo.concert.d3'),
        t('landing.demo.concert.d4'),
      ],
      sampleQuote: '"ध्वनि की गुणवत्ता बहुत शानदार थी, स्टेज और विजुअल अद्भुत थे। वॉशरूम बढ़ाएं।"',
      quoteAuthor: t('landing.demo.concert.author'),
      aiInsight: t('landing.demo.concert.insight'),
    },
    Sports: {
      title: t('landing.demo.sports.title'),
      code: 'PLAY-2026',
      subtitle: t('landing.demo.sports.subtitle'),
      icon: Trophy,
      color: 'from-amber-500 to-orange-700',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      sampleDimensions: [
        t('landing.demo.sports.d1'),
        t('landing.demo.sports.d2'),
        t('landing.demo.sports.d3'),
        t('landing.demo.sports.d4'),
      ],
      sampleQuote: '"Pitch condition was excellent! Match schedules had minor delay in the afternoon."',
      quoteAuthor: t('landing.demo.sports.author'),
      aiInsight: t('landing.demo.sports.insight'),
    },
    Workshop: {
      title: t('landing.demo.workshop.title'),
      code: 'WORK-2026',
      subtitle: t('landing.demo.workshop.subtitle'),
      icon: Laptop,
      color: 'from-blue-500 to-indigo-700',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      sampleDimensions: [
        t('landing.demo.workshop.d1'),
        t('landing.demo.workshop.d2'),
        t('landing.demo.workshop.d3'),
        t('landing.demo.workshop.d4'),
      ],
      sampleQuote: '"प्रात्यक्षिक सराव खूप चांगला झाला, खूप काही नवीन शिकायला मिळाले."',
      quoteAuthor: t('landing.demo.workshop.author'),
      aiInsight: t('landing.demo.workshop.insight'),
    },
    Conference: {
      title: t('landing.demo.conference.title'),
      code: 'LEAD-2026',
      subtitle: t('landing.demo.conference.subtitle'),
      icon: Presentation,
      color: 'from-cyan-500 to-blue-700',
      tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      sampleDimensions: [
        t('landing.demo.conference.d1'),
        t('landing.demo.conference.d2'),
        t('landing.demo.conference.d3'),
        t('landing.demo.conference.d4'),
      ],
      sampleQuote: '"Exceptional keynote panels! Would appreciate more structured networking sessions."',
      quoteAuthor: t('landing.demo.conference.author'),
      aiInsight: t('landing.demo.conference.insight'),
    },
    College: {
      title: t('landing.demo.college.title'),
      code: 'HACK-2026',
      subtitle: t('landing.demo.college.subtitle'),
      icon: GraduationCap,
      color: 'from-orange-500 to-rose-700',
      tagColor: 'bg-orange-50 text-orange-700 border-orange-200',
      sampleDimensions: [
        t('landing.demo.college.d1'),
        t('landing.demo.college.d2'),
        t('landing.demo.college.d3'),
        t('landing.demo.college.d4'),
      ],
      sampleQuote: '"Outstanding mentorship from industry mentors! WiFi dipped briefly in Lab 4."',
      quoteAuthor: t('landing.demo.college.author'),
      aiInsight: t('landing.demo.college.insight'),
    },
  };

  const activeDemo = categoryDemos[activeCategoryKey] || categoryDemos.Marathon;

  const workflowSteps = [
    {
      step: '01',
      title: t('landing.steps.s1.title'),
      desc: t('landing.steps.s1.desc'),
      icon: Layers,
    },
    {
      step: '02',
      title: t('landing.steps.s2.title'),
      desc: t('landing.steps.s2.desc'),
      icon: QrCode,
    },
    {
      step: '03',
      title: t('landing.steps.s3.title'),
      desc: t('landing.steps.s3.desc'),
      icon: Mic,
    },
    {
      step: '04',
      title: t('landing.steps.s4.title'),
      desc: t('landing.steps.s4.desc'),
      icon: BrainCircuit,
    },
    {
      step: '05',
      title: t('landing.steps.s5.title'),
      desc: t('landing.steps.s5.desc'),
      icon: CheckCircle2,
    },
  ];

  const features = [
    {
      title: t('landing.cards.f1.title'),
      desc: t('landing.cards.f1.desc'),
      icon: Languages,
      tag: t('landing.cards.f1.tag'),
    },
    {
      title: t('landing.cards.f2.title'),
      desc: t('landing.cards.f2.desc'),
      icon: Zap,
      tag: t('landing.cards.f2.tag'),
    },
    {
      title: t('landing.cards.f3.title'),
      desc: t('landing.cards.f3.desc'),
      icon: BrainCircuit,
      tag: t('landing.cards.f3.tag'),
    },
    {
      title: t('landing.cards.f4.title'),
      desc: t('landing.cards.f4.desc'),
      icon: CheckCircle2,
      tag: t('landing.cards.f4.tag'),
    },
    {
      title: t('landing.cards.f5.title'),
      desc: t('landing.cards.f5.desc'),
      icon: BarChart3,
      tag: t('landing.cards.f5.tag'),
    },
    {
      title: t('landing.cards.f6.title'),
      desc: t('landing.cards.f6.desc'),
      icon: FileCheck,
      tag: t('landing.cards.f6.tag'),
    },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col selection:bg-coral/20 selection:text-coral">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-coral/15 via-lavender/20 to-sage/15 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Universal Platform Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-charcoal/10 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
              {t('landing.platformPill')}
            </span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-navy tracking-tight leading-[1.12]">
              {t('landing.headline')}
            </h1>
            <p className="text-base sm:text-xl text-charcoal/75 max-w-2xl mx-auto font-sans leading-relaxed">
              {t('landing.subheadline')}
            </p>
          </div>

          {/* Direct Event Code Search Box & Primary CTAs */}
          <div className="max-w-xl mx-auto space-y-4">
            <form
              onSubmit={handleCodeSubmit}
              className="flex items-center bg-white rounded-2xl p-2 border-2 border-charcoal/15 shadow-card hover:border-coral transition-all"
            >
              <div className="pl-3 pr-2 text-charcoal/40">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder={t('landing.searchPlaceholder')}
                value={eventCodeInput}
                onChange={(e) => setEventCodeInput(e.target.value)}
                className="w-full bg-transparent px-2 py-2 text-sm sm:text-base font-semibold text-navy placeholder:text-charcoal/40 focus:outline-none uppercase"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs sm:text-sm font-bold shadow-coral-glow transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>{t('landing.giveFeedback')}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/register"
                className="px-6 py-3 rounded-2xl bg-navy text-white text-sm font-bold shadow-hover hover:bg-navy-900 transition-all flex items-center gap-2"
              >
                <Sparkles size={16} className="text-coral" />
                <span>{t('landing.createAccount')}</span>
              </Link>
              <Link
                to="/feedback/HACK-2026"
                className="px-6 py-3 rounded-2xl bg-white border border-charcoal/15 text-navy text-sm font-bold shadow-sm hover:border-coral transition-all flex items-center gap-2"
              >
                <QrCode size={16} className="text-charcoal/60" />
                <span>{t('landing.exploreDemo')}</span>
              </Link>
            </div>
          </div>

          {/* Quick Universal Category Pills */}
          <div className="pt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal/50 mb-3">
              {t('landing.categoryLabel')}
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {Object.keys(categoryDemos).map((key) => {
                const item = categoryDemos[key];
                const Icon = item.icon;
                const isActive = activeCategoryKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategoryKey(key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-navy text-white shadow-card scale-105'
                        : 'bg-white border border-charcoal/10 text-charcoal/70 hover:border-charcoal/30'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-coral' : 'text-charcoal/40'} />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Category Deep-Dive Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-24 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-charcoal/10 shadow-card">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-charcoal/10">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${activeDemo.color} text-white shadow-sm`}>
                <activeDemo.icon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-heading font-extrabold text-navy">
                    {activeDemo.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeDemo.tagColor}`}>
                    {activeDemo.code}
                  </span>
                </div>
                <p className="text-xs text-charcoal/60 mt-0.5">{activeDemo.subtitle}</p>
              </div>
            </div>

            <Link
              to={`/feedback/${activeDemo.code}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-coral/10 hover:bg-coral text-coral hover:text-white text-xs font-bold transition-all"
            >
              <span>{t('landing.testFormLive')}</span>
              <ExternalLink size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Dimensions */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/50">
                {t('landing.categoryDimensions')}
              </span>
              <ul className="space-y-2">
                {activeDemo.sampleDimensions.map((dim, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-charcoal/80">
                    <CheckCircle2 size={14} className="text-sage shrink-0" />
                    <span>{dim}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Multilingual Voice/Text Quote */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/50">
                {t('landing.multilingualFeedback')}
              </span>
              <div className="p-3.5 rounded-2xl bg-ivory-100 border border-charcoal/5 text-xs italic text-charcoal/80 space-y-2">
                <p>{activeDemo.sampleQuote}</p>
                <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 not-italic">
                  — {activeDemo.quoteAuthor}
                </div>
              </div>
            </div>

            {/* Synthesized AI Insight */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-coral">
                {t('landing.aiInsightLabel')}
              </span>
              <div className="p-3.5 rounded-2xl bg-coral/5 border border-coral/20 text-xs text-charcoal/90 space-y-2">
                <div className="flex items-center gap-1.5 text-coral font-bold text-[11px]">
                  <BrainCircuit size={14} />
                  <span>{t('landing.aiCategoryIntelligence')}</span>
                </div>
                <p className="leading-relaxed">{activeDemo.aiInsight}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Workflow Stepper */}
      <section className="py-16 bg-white border-y border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-coral">
              {t('landing.workflowBadge')}
            </span>
            <h2 className="text-3xl font-heading font-extrabold text-navy">
              {t('landing.workflowHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70">
              {t('landing.workflowSubheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-ivory-50 border border-charcoal/10 hover:border-coral transition-all space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-navy text-white flex items-center justify-center font-bold text-sm">
                      <Icon size={18} className="text-coral" />
                    </div>
                    <span className="text-xs font-mono font-extrabold text-charcoal/30">
                      {s.step}
                    </span>
                  </div>
                  <h4 className="text-sm font-heading font-extrabold text-navy pt-1">
                    {s.title}
                  </h4>
                  <p className="text-xs text-charcoal/65 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-coral">
            {t('landing.featuresBadge')}
          </span>
          <h2 className="text-3xl font-heading font-extrabold text-navy">
            {t('landing.featuresHeading')}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/70">
            {t('landing.featuresSubheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-charcoal/10 shadow-subtle hover:shadow-card hover:border-coral/40 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-lavender/50 text-navy flex items-center justify-center">
                    <Icon size={22} className="text-coral" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-ivory-100 text-charcoal/70 border border-charcoal/5">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-base font-heading font-extrabold text-navy">
                  {f.title}
                </h3>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Demonstration Quick Launch Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        <div className="rounded-3xl bg-navy text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <BrainCircuit size={400} />
          </div>

          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="text-xs uppercase font-bold tracking-widest text-coral">
              {t('landing.ctaBadge')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight leading-tight">
              {t('landing.ctaHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-ivory-200 leading-relaxed">
              {t('landing.ctaDesc')}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl bg-coral hover:bg-coral-hover text-white text-xs sm:text-sm font-bold shadow-coral-glow transition-all"
              >
                {t('landing.openHostDashboard')}
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all"
              >
                {t('landing.browseEvents')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
