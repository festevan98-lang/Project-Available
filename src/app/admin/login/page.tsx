'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin/lots/laguna-heights');
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Invalid password');
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 sm:px-6 py-16 sm:py-24">
      <p className="text-brass-400 uppercase tracking-[0.22em] text-xs mb-3">
        Admin
      </p>
      <h1 className="font-display text-3xl mb-6">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          required
          className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-4 py-3 rounded-sm focus:border-brass-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-brass-500 hover:bg-brass-400 active:bg-brass-600 text-ink-950 font-medium py-3 px-5 rounded-sm transition disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
