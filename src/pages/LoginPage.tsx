import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SRMLogo } from '../components/SRMLogo';
import { Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
  isAdminLogin?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate, isAdminLogin = false }) => {
  const { login, quickLogin } = useAuth();
  const [identifier, setIdentifier] = useState(isAdminLogin ? 'admin' : '');
  const [password, setPassword] = useState(isAdminLogin ? 'admin123' : '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          role: isAdminLogin ? 'admin' : 'student'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      login(data.user);
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/today-menu');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'student' | 'admin') => {
    setLoading(true);
    setErrorMsg(null);
    const ok = await quickLogin(type);
    setLoading(false);
    if (ok) {
      navigate(type === 'admin' ? '/admin/dashboard' : '/today-menu');
    } else {
      setErrorMsg('Failed to log in with demo credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <SRMLogo size="lg" className="justify-center mx-auto" />
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900">
            {isAdminLogin ? 'Canteen Admin & Kitchen Login' : 'SRM Student Login'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdminLogin
              ? 'Access live order kitchen display, menu editor & sales analytics'
              : 'Enter your SRM Student ID or email to access live ordering'}
          </p>
        </div>
      </div>

      {/* Main Login Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        {isAdminLogin && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Staff Direct Access
              </span>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                Instant
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80">
              Testing or managing canteen orders? Click below to enter the live admin & kitchen terminal immediately.
            </p>
            <button
              id="instant-admin-access-btn"
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-heading font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              ⚡ Open Admin Portal Instantly
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              {isAdminLogin ? 'Admin Username' : 'SRM Student ID / Email *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-identifier-input"
                type="text"
                required
                placeholder={isAdminLogin ? 'admin' : 'e.g. prajith or prajith@srmmcet.edu.in'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 active:scale-95 disabled:opacity-50 text-white font-heading font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Helpers */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            One-Click Instant Demo Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('student')}
              className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-blue-200/60 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Demo Student
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-amber-200/60 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Demo Admin
            </button>
          </div>
        </div>

        {/* Register link / Admin switch */}
        <div className="pt-2 text-center text-xs text-slate-500">
          {!isAdminLogin ? (
            <p>
              New SRM student?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-bold text-blue-900 hover:underline ml-1"
              >
                Register Here
              </button>
            </p>
          ) : (
            <p>
              Are you a student?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-bold text-blue-900 hover:underline ml-1"
              >
                Student Portal
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
