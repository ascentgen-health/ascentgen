'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>(
    'idle'
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    let supabase;

    try {
      supabase = getSupabaseClient();
    } catch (err) {
      setStatus('error');
      setMessage(
        'Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
      return;
    }

    setStatus('loading');
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('ok');
      setMessage('Check your email for a magic link.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Log in</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-200 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2 rounded bg-white text-black font-medium disabled:opacity-60 text-sm"
          >
            {status === 'loading' ? 'Sending magic link…' : 'Send magic link'}
          </button>
        </form>

        {message && (
          <p
            className={`mt-3 text-sm ${
              status === 'error' ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}