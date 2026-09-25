import React, { useState, useEffect } from 'react';
import {
  Lock, User, AlertCircle, ShieldCheck, Eye, EyeOff,
  ArrowLeft, KeyRound, AlertTriangle, Loader2, Sparkles,
  CheckCircle2, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminLoginPage({ navigate, navParams = {} }) {
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loggedOutNotice, setLoggedOutNotice] = useState(Boolean(navParams?.loggedOut));
  const [fieldErrors, setFieldErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  // Security brute-force throttling
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // 1. Session Protection: Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('admin_dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Caps lock detection on password input
  const handlePasswordKeyEvent = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    const cleanUser = username.trim();

    if (!cleanUser) {
      errors.username = 'Username is required';
    } else if (cleanUser.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (lockoutTimer > 0) {
      setErrorMsg(`Access temporarily locked due to repeated failed attempts. Please wait ${lockoutTimer} seconds.`);
      return;
    }

    setErrorMsg('');

    if (!validateForm()) {
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password, rememberMe);
      setLoading(false);

      if (result.success) {
        setFailedAttempts(0);
        navigate('admin_dashboard');
      } else {
        triggerShake();
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          setLockoutTimer(30);
          setErrorMsg('Security lockout triggered: 5 failed attempts. Please wait 30 seconds before trying again.');
        } else {
          setErrorMsg(
            result.message || 'Invalid administrator credentials. Please check your username and password.'
          );
        }
      }
    } catch (err) {
      setLoading(false);
      triggerShake();
      setErrorMsg('Unexpected network or server error. Please try again.');
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // 1-Click Demo Credentials Quick-Fill
  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setFieldErrors({});
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/5 relative overflow-hidden animate-fade-in">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Return to Storefront Link */}
        <div className="mb-4 flex justify-between items-center px-1">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft size={14} />
            <span>Return to Storefront</span>
          </button>

          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Tiruppur Unit Portal
          </span>
        </div>

        {/* Main Authentication Card */}
        <div
          className={`bg-white rounded-3xl p-7 sm:p-9 border border-slate-200 shadow-2xl space-y-6 transition-all backdrop-blur-xl ${
            shake ? 'animate-shake' : ''
          }`}
        >
          {/* Header & Logo Emblem */}
          <div className="text-center space-y-2.5">
            <div className="relative inline-block">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg mx-auto"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)' }}
              >
                GV
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 p-1 rounded-full shadow-sm">
                <ShieldCheck size={14} />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Admin Control Console
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                G V Clothings · Wholesale Manufacturing Management
              </p>
            </div>
          </div>

          {/* Logged Out Success Notice */}
          {loggedOutNotice && !errorMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-2xl flex items-center justify-between gap-2.5 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>You have been safely signed out. Sign in below to access the console.</span>
              </div>
              <button
                type="button"
                onClick={() => setLoggedOutNotice(false)}
                className="text-emerald-500 hover:text-emerald-800 p-0.5"
                aria-label="Dismiss message"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5 animate-fade-in shadow-xs">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                {failedAttempts > 0 && failedAttempts < 5 && (
                  <span className="block text-[10px] text-rose-600 mt-0.5">
                    Failed attempt {failedAttempts} of 5 before temporary lockout.
                  </span>
                )}
              </div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-rose-400 hover:text-rose-700 p-0.5"
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* CapsLock Alert */}
          {capsLockActive && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <span>Caps Lock is ON</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Admin Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoComplete="username"
                  disabled={loading || lockoutTimer > 0}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: '' }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium text-slate-800 placeholder-slate-400 transition-all focus:outline-none ${
                    fieldErrors.username
                      ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                  placeholder="Enter administrator username"
                />
                <User size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.username && (
                <p className="text-[11px] text-rose-600 font-semibold pl-1">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={loading || lockoutTimer > 0}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                  }}
                  onKeyDown={handlePasswordKeyEvent}
                  onKeyUp={handlePasswordKeyEvent}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium text-slate-800 placeholder-slate-400 transition-all focus:outline-none ${
                    fieldErrors.password
                      ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                  placeholder="Enter security password"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />

                {/* Show/Hide Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 font-semibold pl-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox & Help */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
                />
                <span className="text-slate-600 font-medium text-[11px]">
                  Keep me signed in on this device
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutTimer > 0}
              className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white shadow-md transition-all flex items-center justify-center gap-2 select-none ${
                lockoutTimer > 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : loading
                  ? 'bg-blue-700 opacity-90 cursor-wait'
                  : 'bg-slate-900 hover:bg-blue-600 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-amber-400" />
                  <span>Verifying Credentials...</span>
                </>
              ) : lockoutTimer > 0 ? (
                <span>Locked ({lockoutTimer}s)</span>
              ) : (
                <>
                  <KeyRound size={15} className="text-amber-400" />
                  <span>Authenticate & Enter Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles size={12} className="text-amber-500" />
              <span>Click to Fill Demo Credentials</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono">
              Username: <strong>admin</strong> · Password: <strong>admin123</strong>
            </span>
          </div>
        </div>

        {/* Security Trust Badges */}
        <div className="mt-6 flex justify-center items-center gap-4 text-[10px] text-slate-600 font-medium select-none">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-700" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-blue-700" />
            <span>Session Protected</span>
          </div>
          <span>•</span>
          <span>Tiruppur Unit</span>
        </div>
      </div>
    </div>
  );
}
