import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Building2, ArrowRight } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { DeepSeekLogo } from './DeepSeekLogo';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, register } = useMarket();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result =
      mode === 'login'
        ? await login(email, password)
        : await register(username, email, password, organization);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message || 'Authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/84 flex items-center justify-center p-4">
      <div className="dsk-surface rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="dsk-btn-secondary-3d absolute top-4 right-4 p-1.5 rounded-lg text-[#CBD5E1] hover:text-white cursor-pointer"
          aria-label="Close sign in dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <DeepSeekLogo />
          <h2 className="text-lg font-bold text-white mt-4">
            {mode === 'login' ? 'Sign in to your account' : 'Create a DEEPSEEK account'}
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-1">
            Access licensing orders, verified blockchain settlements, product downloads, and engineering support.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#090E15] border border-[#253445] mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-md font-semibold transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-[#00D69A] text-[#050709]' : 'text-[#CBD5E1] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-md font-semibold transition-colors cursor-pointer ${
              mode === 'register' ? 'bg-[#00D69A] text-[#050709]' : 'text-[#CBD5E1] hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-700/60 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Full Name / Username</label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-[#CBD5E1] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    className="dsk-input-3d w-full rounded-lg pl-9 pr-3 py-2.5 placeholder-[#9FB0C2]/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Organization (Optional)</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[#CBD5E1] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Horizon Cloud Security"
                    className="dsk-input-3d w-full rounded-lg pl-9 pr-3 py-2.5 placeholder-[#9FB0C2]/70"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[#CBD5E1] font-medium mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#CBD5E1] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="dsk-input-3d w-full rounded-lg pl-9 pr-3 py-2.5 placeholder-[#9FB0C2]/70"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#CBD5E1] font-medium mb-1">
              Password {mode === 'register' && <span className="text-[#CBD5E1]">(min. 8 characters)</span>}
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#CBD5E1] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={mode === 'register' ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="dsk-input-3d w-full rounded-lg pl-9 pr-3 py-2.5 placeholder-[#9FB0C2]/70"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="dsk-btn-3d w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
