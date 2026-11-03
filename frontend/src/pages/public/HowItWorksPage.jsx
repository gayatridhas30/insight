import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  CalendarPlus,
  Sliders,
  QrCode,
  Smartphone,
  Cpu,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const HowItWorksPage = () => {
  const steps = [
    {
      num: '01',
      title: 'Host Creates Event & Configures Form',
      desc: 'An organizer registers their college, club, or enterprise account and defines event sessions. Using the Dynamic Form Builder or 1-click AI form generation, they select rating scales, NPS, multiple-choice questions, and enable voice feedback.',
      icon: CalendarPlus,
    },
    {
      num: '02',
      title: 'Instant QR Code & Link Generation',
      desc: 'InsightLoop generates a high-resolution QR code and printable feedback badge flyer. Organizers project the QR on stage screens or print it on attendee badges for seamless mobile scanning.',
      icon: QrCode,
    },
    {
      num: '03',
      title: 'Multilingual Participant Submission',
      desc: 'Attendees scan the QR code and are directed to the mobile-optimized form without being forced to create an account. They choose English, Hindi, or Marathi, submit text or record audio, review transcriptions, and submit anonymously or identified.',
      icon: Smartphone,
    },
    {
      num: '04',
      title: 'Bhashini Pipeline & AI Intelligence',
      desc: 'Multilingual text and speech are processed via Bhashini translation (NMT) and speech-to-text (ASR). Our AI service runs sentiment analysis, extracts recurring complaints, clusters topics, and creates actionable recommendations with evidence.',
      icon: Cpu,
    },
    {
      num: '05',
      title: 'Continuous Tracking & Benchmark Reporting',
      desc: 'Organizers review interactive Recharts dashboards, query the RAG AI Assistant for natural language answers, convert recommendations into team tasks, and export executive PDF or Excel reports.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-coral">Architecture & Flow</span>
            <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-navy">
              How InsightLoop Operates
            </h1>
            <p className="text-base text-charcoal/70">
              A transparent, robust architecture designed to turn unstructured attendee reactions into verified institutional improvements.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal/10 shadow-subtle flex flex-col sm:flex-row items-start gap-6 hover:shadow-card transition-shadow"
                >
                  <div className="w-16 h-16 rounded-2xl bg-navy text-white flex items-center justify-center shrink-0 shadow-md">
                    <Icon size={28} className="text-coral" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-coral font-heading">STEP {s.num}</span>
                      <h3 className="text-xl font-heading font-bold text-navy">{s.title}</h3>
                    </div>
                    <p className="text-sm text-charcoal/70 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-coral hover:bg-coral-hover text-white text-base font-bold shadow-coral-glow transition-all"
            >
              <span>Create Your First Event</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
