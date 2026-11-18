import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, UserPlus, Lock, Mail, User, Building2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    category: 'college',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const errorText = error ? (error.key ? t(error.key, error.params) : error.message) : '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError({ message: err.response.data.message });
      } else {
        setError({ key: 'auth.register.failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-navy text-coral items-center justify-center shadow-card mb-2">
              <Sparkles size={24} />
            </div>
            <h2 className="text-3xl font-heading font-extrabold text-navy">
              {t('auth.register.title')}
            </h2>
            <p className="text-xs text-charcoal/60">
              {t('auth.register.subtitle')}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card">
            {errorText && (
              <div className="mb-6 p-4 rounded-xl bg-coral/10 border border-coral/30 text-coral text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  {t('auth.register.fullNameLabel')}
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Yash Dhawale"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  {t('auth.register.emailLabel')}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="organizer@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  {t('auth.register.organizationLabel')}
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="text"
                    required
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="MIT Pune Tech Council"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  {t('auth.register.categoryLabel')}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
                >
                  <option value="college">{t('auth.register.categoryCollege')}</option>
                  <option value="club">{t('auth.register.categoryClub')}</option>
                  <option value="company">{t('auth.register.categoryCompany')}</option>
                  <option value="ngo">{t('auth.register.categoryNgo')}</option>
                  <option value="other">{t('auth.register.categoryOther')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1">
                  {t('auth.register.passwordLabel')}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="password"
                    required
                    name="password"
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral bg-ivory-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-sm font-bold shadow-coral-glow transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span>{t('auth.register.creating')}</span>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>{t('auth.register.getStarted')}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-charcoal/10 text-center">
              <p className="text-xs text-charcoal/60">
                {t('auth.register.haveAccount')}{' '}
                <Link to="/login" className="font-bold text-coral hover:underline">
                  {t('auth.register.signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
