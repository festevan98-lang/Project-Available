'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { Lot } from '@/lib/supabase/types';

interface Props {
  projectSlug: string;
  projectName: string;
  lot: Lot | null;
  onClose: () => void;
}

export function InterestForm({
  projectSlug,
  projectName,
  lot,
  onClose,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      projectSlug,
      lotId: lot?.id ?? null,
      lotNumber: lot?.lot_number ?? null,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      intent: formData.get('intent'),
      notes: formData.get('notes'),
    };

    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Submission failed');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-ink-950/70 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 z-50 w-auto sm:w-[480px] max-w-full bg-ink-900 border border-brass-500/30 rounded-sm p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-brass-400 uppercase tracking-[0.2em] text-xs mb-2">
              {lot ? `Lot ${lot.lot_number}` : projectName}
            </p>
            <h3 className="font-display text-2xl">
              {done ? 'Got it.' : 'Reserve interest'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-ink-50"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-brass-300">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <p className="text-ink-100">
                Thanks. Fernando will reach out within one business day with
                next steps and current availability.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-brass-500 hover:bg-brass-400 text-ink-950 font-medium py-3 rounded-sm transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" type="tel" />

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
                I'm a
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['buyer', 'builder', 'investor', 'unspecified'] as const).map(
                  (opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 bg-ink-950 border border-ink-700 px-3 py-2 rounded-sm cursor-pointer hover:border-brass-500/60 transition has-[:checked]:border-brass-500 has-[:checked]:bg-brass-900/20"
                    >
                      <input
                        type="radio"
                        name="intent"
                        value={opt}
                        defaultChecked={opt === 'buyer'}
                        className="accent-brass-500"
                      />
                      <span className="text-sm capitalize">
                        {opt === 'unspecified' ? 'Other' : opt}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 px-3 py-2 rounded-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brass-500 hover:bg-brass-400 disabled:opacity-60 disabled:cursor-not-allowed text-ink-950 font-medium py-3 rounded-sm transition"
            >
              {submitting ? 'Sending...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-ink-400 mb-2">
        {label}
        {required && <span className="text-brass-400 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
      />
    </div>
  );
}
