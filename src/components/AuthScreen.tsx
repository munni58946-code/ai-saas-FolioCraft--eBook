import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  BookOpen,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
  X,
} from 'lucide-react';
import { AdSenseBlock } from './AdSenseBlock';

interface AuthScreenProps {
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const copyDomain = () => {
    if (!currentDomain) return;
    navigator.clipboard.writeText(currentDomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose?.();
    } catch (err: any) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose?.();
    } catch (err: any) {
      // Handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    await signInAsGuest();
    onClose?.();
  };

  const displayError = localError || authError;

  const isUnauthorizedDomain =
    displayError === 'UNAUTHORIZED_DOMAIN' ||
    (typeof displayError === 'string' && displayError.toLowerCase().includes('unauthorized-domain'));

  return (
    <div className={`min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col justify-between selection:bg-stone-800 selection:text-stone-100 ${onClose ? 'fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4' : ''}`}>
      {/* Top Header Bar if standalone */}
      {!onClose && (
        <header className="px-6 lg:px-12 py-5 border-b border-stone-200/80 bg-[#faf8f5]/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">
              FolioCraft
            </span>
            <span className="text-stone-400 text-xs">·</span>
            <span className="text-xs text-stone-500 font-sans uppercase tracking-wider">
              Publishing Studio
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Secure Firebase Authentication</span>
          </div>
        </header>
      )}

      {/* Main Auth Container */}
      <main className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full ${onClose ? 'max-w-md my-auto' : ''}`}>
        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Card Banner */}
          <div className="p-8 text-center border-b border-stone-100 bg-gradient-to-b from-stone-50 to-white">
            <div className="w-12 h-12 rounded-xl bg-stone-900 text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>

            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              {mode === 'signin' ? 'Sign in to FolioCraft' : 'Create Publisher Account'}
            </h1>
            <p className="font-serif italic text-xs text-stone-600 mt-2 leading-relaxed">
              Sign in with your Google account to sync your books to the cloud or continue directly as a publisher.
            </p>
          </div>

          <div className="p-8 space-y-5">
            {/* Error Message Alert */}
            {isUnauthorizedDomain ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-amber-950 block">
                      Firebase: auth/unauthorized-domain
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Firebase Console me domain add karte waqt <strong>https://</strong> mat lagayein.
                    </span>
                  </div>
                </div>

                {/* Domain display & copy box */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                    Copy and add this exact domain:
                  </span>
                  <div className="bg-white border border-amber-300 rounded-lg p-2 flex items-center justify-between gap-2 shadow-2xs">
                    <code className="text-[11px] font-mono font-semibold text-stone-800 truncate">
                      {currentDomain || 'ais-dev-a5dfewkca2i5gt5uwhamyu-240962024176.asia-southeast1.run.app'}
                    </code>
                    <button
                      type="button"
                      onClick={copyDomain}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDomain ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <a
                    href={firebaseSettingsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] rounded-lg shadow-2xs transition-colors"
                  >
                    <span>Open Firebase Settings</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={handleGuestSignIn}
                    className="flex-1 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Skip &amp; Open Studio</span>
                  </button>
                </div>
              </div>
            ) : displayError ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{displayError}</div>
              </div>
            ) : null}

            {/* 1. Primary: Continue with Google Popup */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 shadow-xs transition-colors disabled:opacity-50"
              >
                {/* Google SVG Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-stone-400 font-sans uppercase tracking-wider relative">
                or sign in with email
              </span>
            </div>

            {/* Separator */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-stone-400 font-sans uppercase tracking-wider relative">
                or with email
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  clearAuthError();
                  setLocalError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'signin'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  clearAuthError();
                  setLocalError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === 'signup'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="scholar@foliocraft.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 mt-2"
              >
                <span>{mode === 'signin' ? 'Sign In to Studio' : 'Create Publisher Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Guest Access Link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => signInAsGuest()}
                  className="text-xs text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5 underline decoration-stone-300 hover:decoration-stone-600"
                >
                  <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>Skip Login &amp; Continue as Guest Publisher</span>
                </button>
              </div>
            </form>
          </div>

          <div className="px-8 py-3.5 bg-stone-50 border-t border-stone-100 text-center text-[11px] text-stone-500">
            Protected by Firebase Cloud Authentication &amp; Firestore Security Rules
          </div>
        </div>

        {/* Defined AdSense Block for public visitors / crawler */}
        <div className="w-full max-w-md mt-4">
          <AdSenseBlock />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-5 border-t border-stone-200/80 bg-[#f4f0e8]/40 text-stone-500 text-xs text-center font-serif">
        FolioCraft Archival Publishing Studio · Complete Monograph Architecture
      </footer>
    </div>
  );
};
