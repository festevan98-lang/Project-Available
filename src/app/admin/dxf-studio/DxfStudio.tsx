'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, AlertTriangle, RotateCcw } from 'lucide-react';
import { DxfPreview } from '@/components/dxf/DxfPreview';
import { LayerChips } from '@/components/dxf/LayerChips';
import { FindingsCard } from '@/components/dxf/FindingsCard';
import type { DxfFindings, ParsedDxf } from '@/lib/dxf/types';

type State =
  | { kind: 'idle' }
  | { kind: 'uploading'; filename: string }
  | { kind: 'analyzing'; filename: string }
  | {
      kind: 'ready';
      filename: string;
      parsed: ParsedDxf;
      findings: DxfFindings | null;
      errorDetail: string | null;
    }
  | { kind: 'error'; message: string };

export function DxfStudio() {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.dxf')) {
      setState({ kind: 'error', message: `Expected a .dxf file, got "${file.name}".` });
      return;
    }
    setHiddenLayers(new Set());
    setState({ kind: 'uploading', filename: file.name });
    const formData = new FormData();
    formData.append('file', file);

    try {
      setState({ kind: 'analyzing', filename: file.name });
      const res = await fetch('/api/admin/dxf-studio', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: 'error', message: data.errorDetail ?? data.error ?? `Server error (${res.status})` });
        return;
      }
      setState({
        kind: 'ready',
        filename: data.filename ?? file.name,
        parsed: data.parsed,
        findings: data.findings,
        errorDetail: data.errorDetail ?? null,
      });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  function reset() {
    setState({ kind: 'idle' });
    setHiddenLayers(new Set());
    if (inputRef.current) inputRef.current.value = '';
  }

  function toggleLayer(name: string) {
    setHiddenLayers((s) => {
      const next = new Set(s);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-brass-400 uppercase tracking-[0.22em] text-xs mb-2">
            Admin / PE review
          </p>
          <h1 className="font-display text-2xl sm:text-3xl">DXF Studio</h1>
          <p className="text-ink-300 text-sm mt-1 max-w-2xl">
            Upload a CAD .dxf to render the geometry and get an engineer&rsquo;s read of what the drawing represents. Informational only; the licensed PE confirms on the consult.
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
          parsed={state.parsed}
          findings={state.findings}
          errorDetail={state.errorDetail}
          hiddenLayers={hiddenLayers}
          onToggleLayer={toggleLayer}
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
      htmlFor="dxf-input"
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
        id="dxf-input"
        type="file"
        accept=".dxf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <Upload className="w-8 h-8 text-brass-400 mx-auto mb-4" />
      <p className="font-display text-xl mb-2">Drop a .dxf file</p>
      <p className="text-ink-300 text-sm">or click to browse. Max 25 MB.</p>
      <p className="text-ink-400 text-xs mt-3">
        Supports R12 through R2018. Splines, hatches, dimension blocks, and inserts are counted but not rendered.
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
        {stage === 'uploading' ? 'Uploading' : 'Parsing entities, then routing the digest to the engineer’s assistant'}
      </p>
      <p className="text-ink-400 text-sm">
        {stage === 'uploading' ? `Sending ${filename}...` : 'Typical time: 5–20 seconds.'}
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
  parsed,
  findings,
  errorDetail,
  hiddenLayers,
  onToggleLayer,
}: {
  filename: string;
  parsed: ParsedDxf;
  findings: DxfFindings | null;
  errorDetail: string | null;
  hiddenLayers: Set<string>;
  onToggleLayer: (name: string) => void;
}) {
  const w = (parsed.bbox.maxX - parsed.bbox.minX).toFixed(1);
  const h = (parsed.bbox.maxY - parsed.bbox.minY).toFixed(1);
  const unsupportedTotal = Object.values(parsed.unsupportedCounts).reduce((s, n) => s + n, 0);
  const unsupportedSummary = Object.entries(parsed.unsupportedCounts)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');

  return (
    <div className="space-y-5">
      <div className="border border-ink-700/60 bg-ink-900/40 rounded-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-brass-400 shrink-0" />
            <span className="text-ink-100 font-medium truncate">{filename}</span>
          </div>
          <Pill label="Entities" value={parsed.totalEntities.toLocaleString()} />
          <Pill label="Layers" value={parsed.layers.length.toString()} />
          <Pill label="Bbox" value={`${w} x ${h} ${parsed.unitsLabel}`} />
          <Pill
            label="Type"
            value={findings ? formatType(findings.drawingType) : 'pending'}
            accent
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-400">Layers</p>
        <LayerChips layers={parsed.layers} hiddenLayers={hiddenLayers} onToggle={onToggleLayer} />
      </div>

      <DxfPreview parsed={parsed} hiddenLayers={hiddenLayers} />

      {unsupportedTotal > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 border border-amber-500/30 bg-amber-900/10 rounded-sm text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-amber-100">
            <span className="font-medium">Partial render:</span> {unsupportedSummary} not supported by this viewer.
            They are counted in the digest sent to the engineer&rsquo;s assistant.
          </div>
        </div>
      )}

      {errorDetail && !findings && (
        <div className="flex items-start gap-3 px-4 py-3 border border-amber-500/30 bg-amber-900/10 rounded-sm text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-amber-100">
            <span className="font-medium">AI analysis unavailable:</span> {errorDetail}
          </div>
        </div>
      )}

      {findings && <FindingsCard findings={findings} />}

      {errorDetail && findings && (
        <div className="px-4 py-2 border border-amber-500/30 bg-amber-900/10 rounded-sm text-xs text-amber-200/80">
          Note: {errorDetail}
        </div>
      )}
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

function formatType(t: DxfFindings['drawingType']): string {
  return t.replace(/_/g, ' ');
}
