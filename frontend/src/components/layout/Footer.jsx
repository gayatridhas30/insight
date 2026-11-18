import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-navy text-white/80 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-coral flex items-center justify-center text-white">
                <Sparkles size={18} />
              </div>
              <span className="text-xl font-heading font-extrabold text-white tracking-tight">
                Insight<span className="text-coral">Loop</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 max-w-sm">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs text-sage font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-sage-dark animate-pulse" />
              <span>{t('footer.bhashiniNote')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase font-bold tracking-wider text-white">{t('footer.platform')}</h5>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/features" className="hover:text-coral transition-colors">{t('footer.features')}</Link></li>
              <li><Link to="/how-it-works" className="hover:text-coral transition-colors">{t('footer.howItWorks')}</Link></li>
              <li><Link to="/feedback/HACK-2026" className="hover:text-coral transition-colors">{t('footer.publicFeedback')}</Link></li>
              <li><Link to="/login" className="hover:text-coral transition-colors">{t('footer.organizerLogin')}</Link></li>
            </ul>
          </div>

          {/* Compliance & Security */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase font-bold tracking-wider text-white">{t('footer.privacy')}</h5>
            <ul className="space-y-2 text-sm text-white/60">
              <li>{t('footer.privacyAnonymous')}</li>
              <li>{t('footer.privacyMultiTenant')}</li>
              <li>{t('footer.privacyDual')}</li>
              <li>{t('footer.privacyAudit')}</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
          <div className="flex items-center gap-1">
            <span>{t('footer.builtWith')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
