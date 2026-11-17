import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogIn, Lock, Mail, AlertCircle, Shield, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    login(demoEmail, demoPassword).then((res) => {
      if (res?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }).catch((err) => {
      setError(err.response?.data?.message || 'Failed to login with demo account.');
    });
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
              Sign In to InsightLoop
            </h2>
            <p className="text-xs text-charcoal/60">
              Access your organizer dashboard, analytics, and AI assistant
            </p>
          </div>

          {/* Quick Demo Evaluation Panel */}
          <div className="bg-white rounded-3xl p-5 border border-charcoal/10 shadow-subtle space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-navy">
              <span className="flex items-center gap-1.5 text-coral">
                <Sparkles size={14} />
                <span>1-Click Demo Evaluation</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-charcoal/50">Instant Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('organizer@vitpune.edu', 'Password123!')}
                className="p-2.5 rounded-xl border border-charcoal/15 bg-ivory hover:border-coral hover:bg-coral/5 text-left text-xs transition-all flex flex-col gap-0.5"
              >
                <div className="flex items-center gap-1 font-bold text-navy">
                  <UserCheck size={13} className="text-coral" />
                  <span>Host / Organizer</span>
                </div>
                <span className="text-[10px] text-charcoal/60">Yash Dhawale</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@insightloop.io', 'Password123!')}
                className="p-2.5 rounded-xl border border-charcoal/15 bg-ivory hover:border-coral hover:bg-coral/5 text-left text-xs transition-all flex flex-col gap-0.5"
              >
                <div className="flex items-center gap-1 font-bold text-navy">
                  <Shield size={13} className="text-lavender-dark" />
                  <span>Platform Admin</span>
                </div>
                <span className="text-[10px] text-charcoal/60">Chaitali</span>
              </button>
            </div>
          </div>

          {/* Main Login Form */}
          <div className="bg-white rounded-3xl p-8 border border-charcoal/10 shadow-card">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-coral/10 border border-coral/30 text-coral text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="organizer@vitpune.edu"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/20 bg-ivory-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-charcoal/15 text-sm focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral/20 bg-ivory-50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-coral hover:bg-coral-hover text-white text-sm font-bold shadow-coral-glow transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-charcoal/10 text-center">
              <p className="text-xs text-charcoal/60">
                Don't have an organization account yet?{' '}
                <Link to="/register" className="font-bold text-coral hover:underline">
                  Register here
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

export default LoginPage;
