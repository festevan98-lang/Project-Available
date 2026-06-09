'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, AlertTriangle, RotateCcw, MapPin, Ruler, Building2, Eye, ScrollText } from 'lucide-react';
import type { PlatFindings, PlatStudioResponse } from '@/lib/plat/types';

type State =
  | { kind: 'idle' }
  | { kind: 'uploading'; filename: string }
  | { kind: 'analyzing'; filename: string }
  | {
      kind: 'ready';
      filename: string;
      fileSize: number;
      findings: PlatFindings | null;
      errorDetail: string | null;
    }
  | { kind: 'error'; message: string };

const PLAT_TYPE_LABELS: Record<PlatFindings['platType'], string> = {
  recorded_plat: 'Recorded plat',
  preliminary_plat: 'Preliminary plat',
  site_plan: 'Site plan',
  survey: 'Survey',
  engineering_sheet: 'Engineering sheet',
  unknown: 'Unclassified',
};

export function PlatAnalyzer() {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setState({ kind: 'error', message: `Expected a PDF, got "${file.name}".` });
      return;
    }
    setState({ kind: 'uploading', filename: file.name });
    const formData = new FormData();
    formData.append('file', file);

    try {
      setState({ kind: 'analyzing', filename: file.name });
      const res = await fetch('/api/admin/plat-analyzer', { method: 'POST', body: formData });
      const data: PlatStudioResponse & { error?: string } = await res.json();
      if (!res.ok) {
        setState({ kind: 'error', message: data.errorDetail ?? data.error ?? `Server error (${res.status})` });
        return;
      }
      setState({
        kind: 'ready',
        filename: data.filename ?? file.name,
        fileSize: data.fileSize ?? file.size,
        findings: data.findings,
        errorDetail: data.errorDetail ?? null,
      });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  function reset() {
    setState({ kind: 'idle' });
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-brass-400 uppercase tracking-[0.22em] text-xs mb-2">
            Admin / PE review
          </p>
          <h1 className="font-display text-2xl sm:text-3xl">Plat Analyzer</h1>
          <p className="text-ink-300 text-sm mt-1 max-w-2xl">
            Upload a plat PDF. Claude reads the drawing and returns structured findings: subdivision name, lot count, setbacks, easements, scale, road names, recorded reference. Skip the DXF wrangling.
          </p>
        </div>
        {state.kind === 'ready' && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 border border-ink-700 hover:border-brass-500/60 text-ink-200 hover:text-brass-300 px-3 py-2 rounded-sm transition min-h-[40px] text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            New file
          </button>
        )}
      </header>

      {state.kind === 'idle' && (
        <Dropzone
          dragOver={dragOver}
          setDragOver={setDragOver}
          onFile={handleFile}
          inputRef={inputRef}
        />
      )}

      {(state.kind === 'uploading' || state.kind === 'analyzing') && (
        <LoadingPanel filename={state.filename} stage={state.kind} />
      )}

      {state.kind === 'error' && <ErrorPanel message={state.message} onReset={reset} />}

      {state.kind === 'ready' && (
        <ReadyView
          filename={state.filename}
          fileSize={state.fileSize}
          findings={state.findings}
          errorDetail={state.errorDetail}
        />
      )}
    </div>
  );
}

function Dropzone({
  dragOver,
  setDragOver,
  onFile,
  inputRef,
}: {
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onFile: (file: File) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <label
      htmlFor="plat-input"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={`block cursor-pointer border-2 border-dashed rounded-sm py-16 sm:py-24 px-6 text-center transition ${
        dragOver
          ? 'border-brass-500 bg-brass-900/15'
          : 'border-ink-700/60 hover:border-brass-500/50 bg-ink-900/40'
      }`}
    >
      <input
        ref={inputRef}
        id="plat-input"
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <Upload className="w-8 h-8 text-brass-400 mx-auto mb-4" />
      <p className="font-display text-xl mb-2">Drop a plat PDF</p>
      <p className="text-ink-300 text-sm">or click to browse. Max 30 MB.</p>
      <p className="text-ink-400 text-xs mt-3">
        Works on recorded plats, preliminary plats, site plans, and engineering sheets.
      </p>
    </label>
  );
}

function LoadingPanel({ filename, stage }: { filename: string; stage: 'uploading' | 'analyzing' }) {
  return (
    <div className="border border-ink-700/60 bg-ink-900/40 rounded-sm p-8 sm:p-12 text-center">
      <div
        aria-hidden
        className="w-8 h-8 mx-auto mb-4 border-2 border-brass-400/30 border-t-brass-400 rounded-full animate-spin"
      />
      <p className="text-ink-100 font-medium mb-1">
        {stage === 'uploading' ? 'Uploading' : 'Claude is reading the plat'}
      </p>
      <p className="text-ink-400 text-sm">
        {stage === 'uploading' ? `Sending ${filename}...` : 'Typical time: 15–45 seconds for a single-sheet plat.'}
      </p>
    </div>
  );
}

function ErrorPanel({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="border border-red-500/40 bg-red-900/10 rounded-sm p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-red-100 mb-1">Could not analyze this file</p>
          <p className="text-red-200/90 break-words">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 bg-ink-800 hover:bg-ink-700 text-ink-100 px-4 py-2 rounded-sm text-sm transition min-h-[40px]"
      >
        <RotateCcw className="w-4 h-4" /> Try a different file
      </button>
    </div>
  );
}

function ReadyView({
  filename,
  fileSize,
  findings,
  errorDetail,
}: {
  filename: string;
  fileSize: number;
  findings: PlatFindings | null;
  errorDetail: string | null;
}) {
  if (!findings) {
    return (
      <div className="border border-amber-500/40 bg-amber-900/10 rounded-sm p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-100 mb-1">Analysis incomplete</p>
            <p className="text-amber-200/90">{errorDetail ?? 'No findings returned.'}</p>
          </div>
        </div>
      </div>
    );
  }
  const sizeMb = (fileSize / 1024 / 1024).toFixed(2);
  return (
    <div className="space-y-5">
      <div className="border border-ink-700/60 bg-ink-900/40 rounded-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-brass-400 shrink-0" />
            <span className="text-ink-100 font-medium truncate">{filename}</span>
          </div>
          <Pill label="Size" value={`${sizeMb} MB`} />
          <Pill label="Type" value={PLAT_TYPE_LABELS[findings.platType]} accent />
          {findings.totalLotsLabeled != null && <Pill label="Lots" value={String(findings.totalLotsLabeled)} />}
          {findings.totalAcreageLabel && <Pill label="Area" value={findings.totalAcreageLabel} />}
          {findings.scaleLabel && <Pill label="Scale" value={findings.scaleLabel} />}
        </div>
      </div>

      <FindingsCard findings={findings} />

      {errorDetail && (
        <div className="px-4 py-2 border border-amber-500/30 bg-amber-900/10 rounded-sm text-xs text-amber-200/80">
          Note: {errorDetail}
        </div>
      )}
    </div>
  );
}

function FindingsCard({ findings }: { findings: PlatFindings }) {
  const lowConfidence = findings.confidence === 'low';
  return (
    <div className="border border-brass-500/40 bg-brass-900/10 rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-brass-500/30 flex items-center gap-3 bg-brass-900/20">
        <span aria-hidden className="block w-1.5 h-1.5 bg-brass-400" />
        <p className="text-brass-300 uppercase tracking-[0.22em] text-[11px]">
          Engineer&rsquo;s read
        </p>
        <span className="ml-auto text-xs text-ink-300">Informational only. PE confirms on consult.</span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        <p className="text-ink-100 text-base sm:text-lg leading-relaxed">{findings.summary}</p>

        {lowConfidence && (
          <div className="flex items-start gap-3 px-4 py-3 border border-amber-500/40 bg-amber-900/10 rounded-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-100">
              <p className="font-medium mb-1">Low confidence reading</p>
              <p className="text-amber-100/80">
                {findings.confidenceNote ?? 'The model could not read the plat cleanly. Verify visually before relying on these values.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <FactBlock icon={<Building2 className="w-4 h-4" />} label="Subdivision" value={findings.subdivisionName} />
          <FactBlock icon={<ScrollText className="w-4 h-4" />} label="Recorded reference" value={findings.recordedReference} />
          <FactBlock icon={<Eye className="w-4 h-4" />} label="Engineer of record" value={findings.engineerOfRecord} />
          <FactBlock icon={<Ruler className="w-4 h-4" />} label="Scale" value={findings.scaleLabel} />
        </div>

        {findings.roadNames.length > 0 && (
          <Section title="Roads">
            <Chips items={findings.roadNames} icon={<MapPin className="w-3 h-3" />} />
          </Section>
        )}

        {findings.setbacks.length > 0 && (
          <Section title="Setbacks">
            <ul className="space-y-1 text-sm text-ink-100">
              {findings.setbacks.map((s, i) => <li key={i} className="flex gap-2"><span className="text-brass-400">·</span>{s}</li>)}
            </ul>
          </Section>
        )}

        {findings.easements.length > 0 && (
          <Section title="Easements">
            <ul className="space-y-1 text-sm text-ink-100">
              {findings.easements.map((s, i) => <li key={i} className="flex gap-2"><span className="text-brass-400">·</span>{s}</li>)}
            </ul>
          </Section>
        )}

        {findings.utilities.length > 0 && (
          <Section title="Utilities">
            <ul className="space-y-1 text-sm text-ink-100">
              {findings.utilities.map((s, i) => <li key={i} className="flex gap-2"><span className="text-brass-400">·</span>{s}</li>)}
            </ul>
          </Section>
        )}

        {findings.lotsSampled.length > 0 && (
          <Section title={`Lots (${findings.lotsSampled.length} sampled)`}>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-400 border-b border-ink-700/50">
                    <th className="py-2 px-2">Lot</th>
                    <th className="py-2 px-2">Block</th>
                    <th className="py-2 px-2">Size (sqft)</th>
                    <th className="py-2 px-2">Dimensions</th>
                    <th className="py-2 px-2">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-ink-100">
                  {findings.lotsSampled.map((l, i) => (
                    <tr key={i} className="border-b border-ink-700/30">
                      <td className="py-2 px-2 tabular-nums">{l.lot_number}</td>
                      <td className="py-2 px-2">{l.block ?? '-'}</td>
                      <td className="py-2 px-2 tabular-nums">{l.size_sqft?.toLocaleString() ?? '-'}</td>
                      <td className="py-2 px-2">{l.dimensions ?? '-'}</td>
                      <td className="py-2 px-2 text-ink-300">{l.notes ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {findings.keyFindings.length > 0 && (
          <Section title="Key findings">
            <ul className="space-y-1.5">
              {findings.keyFindings.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink-100">
                  <span aria-hidden className="text-brass-400 mt-1 shrink-0">&rsaquo;</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {findings.verificationItems.length > 0 && (
          <Section title="Verify on consult">
            <ul className="space-y-1.5">
              {findings.verificationItems.map((v, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink-100">
                  <span aria-hidden className="text-ink-400 mt-1 shrink-0">[ ]</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function Pill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2 text-xs sm:text-sm">
      <span className="text-ink-400 uppercase tracking-wider text-[10px] sm:text-[11px]">{label}</span>
      <span className={`tabular-nums ${accent ? 'text-brass-300 font-medium' : 'text-ink-100'} capitalize`}>{value}</span>
    </span>
  );
}

function FactBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-ink-400 text-xs uppercase tracking-wider mb-1.5">
        {icon} {label}
      </div>
      <div className="text-ink-100 text-sm">{value ?? <span className="text-ink-400">-</span>}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-ink-400 text-xs uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

function Chips({ items, icon }: { items: string[]; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-ink-700/60 bg-ink-900/40 text-xs text-ink-100">
          {icon}
          {s}
        </span>
      ))}
    </div>
  );
}
