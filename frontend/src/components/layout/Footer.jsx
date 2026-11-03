import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
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
              Universal multilingual event feedback & intelligence platform. Powering colleges, companies, hackathons, and conferences with real-time AI sentiment analysis, Bhashini translation, and evidence-backed recommendations.
            </p>
            <div className="flex items-center gap-2 text-xs text-sage font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-sage-dark animate-pulse" />
              <span>Bhashini National Language Mission & AI Service Integrated</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase font-bold tracking-wider text-white">Platform</h5>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/features" className="hover:text-coral transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-coral transition-colors">How It Works</Link></li>
              <li><Link to="/feedback/HACK-2026" className="hover:text-coral transition-colors">Public Feedback Form</Link></li>
              <li><Link to="/login" className="hover:text-coral transition-colors">Organizer Login</Link></li>
            </ul>
          </div>

          {/* Compliance & Security */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase font-bold tracking-wider text-white">Privacy & Isolation</h5>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Anonymous Feedback Protection</li>
              <li>Multi-tenant Organization Isolation</li>
              <li>Dual Language Storage (Original & Translated)</li>
              <li>Audit Trail & RBAC Control</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© {new Date().getFullYear()} InsightLoop. Production Ready Universal Event Intelligence Platform.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for Academic Evaluation & Enterprise Deployment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
