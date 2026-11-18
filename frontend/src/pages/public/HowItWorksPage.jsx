import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const steps = [
    {
      num: '01',
      title: t('howItWorks.step1.title'),
      desc: t('howItWorks.step1.desc'),
      icon: CalendarPlus,
    },
    {
      num: '02',
      title: t('howItWorks.step2.title'),
      desc: t('howItWorks.step2.desc'),
      icon: QrCode,
    },
    {
      num: '03',
      title: t('howItWorks.step3.title'),
      desc: t('howItWorks.step3.desc'),
      icon: Smartphone,
    },
    {
      num: '04',
      title: t('howItWorks.step4.title'),
      desc: t('howItWorks.step4.desc'),
      icon: Cpu,
    },
    {
      num: '05',
      title: t('howItWorks.step5.title'),
      desc: t('howItWorks.step5.desc'),
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-coral">{t('howItWorks.eyebrow')}</span>
            <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-navy">
              {t('howItWorks.heading')}
            </h1>
            <p className="text-base text-charcoal/70">
              {t('howItWorks.subheading')}
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
                      <span className="text-sm font-extrabold text-coral font-heading">{t('howItWorks.step')} {s.num}</span>
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
              <span>{t('howItWorks.createFirst')}</span>
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
