import React, { useState } from 'react';
import { User, Mail, Phone, Globe, Shield, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/services';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await authService.updateProfile({
        name,
        phone,
        preferences: { language, theme },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-navy">
          User Profile & Preferences
        </h1>
        <p className="text-xs text-charcoal/60 mt-0.5">
          Manage your contact information, default language, and security
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-2xl bg-sage/20 border border-sage-dark/30 text-sage-dark text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
              Email Address (Login Identity)
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm bg-ivory text-charcoal/50 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98220 11223"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Default Portal Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal/15 text-sm bg-ivory-50 focus:outline-none focus:border-coral"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                Role Authority
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-charcoal/15 bg-ivory text-sm font-bold uppercase text-navy">
                <Shield size={16} className="text-coral" />
                <span>{user?.role || 'host'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal/10 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold shadow-coral-glow transition-all disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
