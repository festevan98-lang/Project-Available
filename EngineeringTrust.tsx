import { ShieldCheck } from 'lucide-react';

export function EngineeringTrust({ highlights }: { highlights: string[] }) {
  return (
    <section className="border border-brass-500/30 bg-gradient-to-br from-brass-900/20 to-ink-900/40 rounded-sm p-6 sm:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-sm bg-brass-500/20 border border-brass-500/40 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-brass-300" />
        </div>
        <div>
          <p className="text-brass-400 uppercase tracking-[0.2em] text-xs mb-2">
            Engineering Trust Stack
          </p>
          <h3 className="font-display text-2xl leading-tight">
            Engineered, platted, and entitled in-house by a licensed Texas PE.
          </h3>
          <p className="text-ink-200 mt-2 text-sm">
            Drainage, utilities, and entitlement risk handled before lots go to
            market.
          </p>
        </div>
      </div>

      {highlights.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-ink-100"
            >
              <span className="text-brass-400 mt-1">▸</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
