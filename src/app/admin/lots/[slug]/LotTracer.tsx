'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, LogOut, Save, Eye, EyeOff } from 'lucide-react';
import type { Project, Lot, LotStatus } from '@/lib/supabase/types';

type DraftLot = {
  id?: string;
  lot_number: string;
  status: LotStatus;
  polygon_points: string;
  size_sqft: number | null;
  price: number | null;
  phase: string | null;
  dimensions: string | null;
  notes: string | null;
};

const STATUS_COLORS: Record<LotStatus, { fill: string; stroke: string }> = {
  available: { fill: 'rgba(217,164,55,0.55)', stroke: '#d9a437' },
  reserved: { fill: 'rgba(217,164,55,0.20)', stroke: '#9c6e22' },
  under_contract: { fill: 'rgba(120,84,32,0.45)', stroke: '#785420' },
  sold: { fill: 'rgba(80,78,70,0.30)', stroke: '#52503f' },
};

function pointsToArray(s: string): { x: number; y: number }[] {
  return s.trim().split(/\s+/).map((p) => {
    const [x, y] = p.split(',').map(Number);
    return { x, y };
  });
}
function arrayToPoints(a: { x: number; y: number }[]): string {
  return a.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}
function polygonAreaSqft(pts: { x: number; y: number }[], srcExtent: { width: number; height: number }, viewportPx: { width: number; height: number }): number {
  const sx = srcExtent.width / viewportPx.width;
  const sy = srcExtent.height / viewportPx.height;
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += (p.x * sx) * (q.y * sy) - (q.x * sx) * (p.y * sy);
  }
  return Math.abs(a / 2);
}

interface Props {
  project: Project;
  initialLots: Lot[];
}

export function LotTracer({ project, initialLots }: Props) {
  const router = useRouter();
  const [lots, setLots] = useState<Lot[]>(initialLots);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftPoints, setDraftPoints] = useState<{ x: number; y: number }[] | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [pendingLot, setPendingLot] = useState<DraftLot | null>(null);
  const [editing, setEditing] = useState<DraftLot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ghostMode, setGhostMode] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const VIEW_W = project.plat_image_width ?? 1600;
  const VIEW_H = project.plat_image_height ?? 1200;

  function nextLotNumber(): string {
    const used = new Set(lots.map((l) => l.lot_number));
    for (let i = 1; i < 1000; i++) {
      if (!used.has(String(i))) return String(i);
    }
    return String(lots.length + 1);
  }

  function selectLot(lot: Lot) {
    if (drawingMode) return;
    setSelectedId(lot.id);
    setEditing({
      id: lot.id,
      lot_number: lot.lot_number,
      status: lot.status,
      polygon_points: lot.polygon_points,
      size_sqft: lot.size_sqft,
      price: lot.price,
      phase: lot.phase,
      dimensions: lot.dimensions,
      notes: lot.notes,
    });
  }

  function startDrawing() {
    setSelectedId(null);
    setEditing(null);
    setDrawingMode(true);
    setDraftPoints([]);
    setPendingLot(null);
  }
  function cancelDrawing() {
    setDrawingMode(false);
    setDraftPoints(null);
    setPendingLot(null);
  }

  function svgPointFromEvent(evt: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: Math.round(transformed.x * 10) / 10, y: Math.round(transformed.y * 10) / 10 };
  }

  function onSvgClick(evt: React.MouseEvent<SVGSVGElement>) {
    if (!drawingMode || !draftPoints) return;
    const p = svgPointFromEvent(evt);
    if (!p) return;
    if (draftPoints.length >= 3) {
      const first = draftPoints[0];
      const dist = Math.hypot(p.x - first.x, p.y - first.y);
      if (dist < 12) {
        finishDrawing();
        return;
      }
    }
    setDraftPoints([...draftPoints, p]);
  }

  function finishDrawing() {
    if (!draftPoints || draftPoints.length < 3) {
      cancelDrawing();
      return;
    }
    const poly = arrayToPoints(draftPoints);
    const lotNum = nextLotNumber();
    setPendingLot({
      lot_number: lotNum,
      status: 'available',
      polygon_points: poly,
      size_sqft: null,
      price: null,
      phase: null,
      dimensions: null,
      notes: null,
    });
    setDrawingMode(false);
  }

  async function saveNew() {
    if (!pendingLot) return;
    setBusy(true);
    setError(null);
    const res = await fetch('/api/admin/lots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: project.id, ...pendingLot }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Save failed');
      return;
    }
    const { lot } = await res.json();
    setLots([...lots, lot]);
    setPendingLot(null);
    setDraftPoints(null);
  }

  async function saveEdit() {
    if (!editing?.id) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/lots/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lot_number: editing.lot_number,
        status: editing.status,
        polygon_points: editing.polygon_points,
        size_sqft: editing.size_sqft,
        price: editing.price,
        phase: editing.phase,
        dimensions: editing.dimensions,
        notes: editing.notes,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Save failed');
      return;
    }
    const { lot } = await res.json();
    setLots(lots.map((l) => (l.id === lot.id ? lot : l)));
    setEditing(null);
    setSelectedId(null);
  }

  async function deleteSelected() {
    if (!editing?.id) return;
    if (!confirm(`Delete Lot ${editing.lot_number}? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/lots/${editing.id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Delete failed');
      return;
    }
    setLots(lots.filter((l) => l.id !== editing.id));
    setEditing(null);
    setSelectedId(null);
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (drawingMode) cancelDrawing();
        else if (pendingLot) setPendingLot(null);
        else if (editing) { setEditing(null); setSelectedId(null); }
      } else if (e.key === 'Enter' && drawingMode) {
        e.preventDefault();
        finishDrawing();
      } else if ((e.key === 'a' || e.key === 'A') && !editing && !pendingLot) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        startDrawing();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawingMode, pendingLot, editing, draftPoints]);

  const draftPolygonStr = draftPoints && draftPoints.length > 0 ? arrayToPoints(draftPoints) : null;

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <p className="text-brass-400 uppercase tracking-[0.22em] text-xs">Admin · Lot tracer</p>
          <h1 className="font-display text-2xl">{project.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-300 mr-2">{lots.length} lots</span>
          <button
            type="button"
            onClick={() => setGhostMode((v) => !v)}
            className="inline-flex items-center gap-2 border border-ink-700 hover:border-brass-500/60 text-ink-200 hover:text-brass-300 px-3 py-2 rounded-sm transition min-h-[40px]"
            aria-pressed={ghostMode}
            title={ghostMode ? 'Show lots' : 'Fade lots to see plat'}
          >
            {ghostMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline text-sm">{ghostMode ? 'Faded' : 'Plat'}</span>
          </button>
          <button
            type="button"
            onClick={startDrawing}
            disabled={drawingMode || !!pendingLot}
            className="inline-flex items-center gap-2 bg-brass-500 hover:bg-brass-400 active:bg-brass-600 text-ink-950 font-medium px-4 py-2 rounded-sm transition disabled:opacity-50 min-h-[40px]"
          >
            <Plus className="w-4 h-4" /> Add lot
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 border border-ink-700 hover:border-ink-300 text-ink-200 px-3 py-2 rounded-sm transition min-h-[40px]"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-500/40 text-red-200 text-sm rounded-sm">
          {error}
        </div>
      )}

      {drawingMode && (
        <div className="mb-3 px-3 py-2 bg-brass-900/20 border border-brass-500/40 text-brass-200 text-sm rounded-sm flex items-center justify-between">
          <span>
            Click corners on the plat. Click first point or press <kbd className="px-1 py-0.5 bg-ink-800 rounded text-xs">Enter</kbd> to close.{' '}
            <kbd className="px-1 py-0.5 bg-ink-800 rounded text-xs">Esc</kbd> to cancel. Vertices: {draftPoints?.length ?? 0}
          </span>
          <button onClick={cancelDrawing} className="text-ink-300 hover:text-ink-50">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="relative bg-ink-900/60 border border-ink-700/50 rounded-sm overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className={`w-full h-auto ${drawingMode ? 'cursor-crosshair' : 'cursor-default'}`}
            onClick={onSvgClick}
            style={{ touchAction: 'manipulation' }}
          >
            {project.plat_image_url && (
              <image
                href={project.plat_image_url}
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
                preserveAspectRatio="xMidYMid meet"
              />
            )}

            {lots.map((lot) => {
              const c = STATUS_COLORS[lot.status];
              const isSelected = selectedId === lot.id;
              return (
                <g
                  key={lot.id}
                  style={{
                    opacity: ghostMode && !isSelected ? 0.18 : 1,
                    transition: 'opacity 150ms',
                  }}
                >
                  <polygon
                    points={lot.polygon_points}
                    fill={c.fill}
                    stroke={isSelected ? '#f8ecc8' : c.stroke}
                    strokeWidth={isSelected ? 2.5 : 1}
                    style={{ cursor: drawingMode ? 'crosshair' : 'pointer' }}
                    onClick={(e) => {
                      if (drawingMode) return;
                      e.stopPropagation();
                      selectLot(lot);
                    }}
                  />
                  <text
                    x={pointsToArray(lot.polygon_points).reduce((s, p) => s + p.x, 0) / pointsToArray(lot.polygon_points).length}
                    y={pointsToArray(lot.polygon_points).reduce((s, p) => s + p.y, 0) / pointsToArray(lot.polygon_points).length}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#0d0c08"
                    fontSize={Math.max(8, VIEW_W / 160)}
                    fontWeight={600}
                    style={{ pointerEvents: 'none' }}
                  >
                    {lot.lot_number}
                  </text>
                </g>
              );
            })}

            {draftPolygonStr && (
              <>
                <polygon
                  points={draftPolygonStr}
                  fill="rgba(248,236,200,0.25)"
                  stroke="#f8ecc8"
                  strokeWidth={1.5}
                  strokeDasharray="4,3"
                  style={{ pointerEvents: 'none' }}
                />
                {draftPoints?.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill={i === 0 ? '#f8ecc8' : '#d9a437'}
                    stroke="#0d0c08"
                    strokeWidth={1}
                    style={{ pointerEvents: 'none' }}
                  />
                ))}
              </>
            )}

            {pendingLot && (
              <polygon
                points={pendingLot.polygon_points}
                fill="rgba(217,164,55,0.55)"
                stroke="#f8ecc8"
                strokeWidth={2}
                style={{ pointerEvents: 'none' }}
              />
            )}
          </svg>
        </div>

        <aside className="space-y-3">
          {!editing && !pendingLot && !drawingMode && (
            <div className="border border-ink-700/50 bg-ink-900/40 rounded-sm p-4 text-sm text-ink-300">
              <p className="mb-2 text-ink-200 font-medium">Editing instructions</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Click any lot polygon to edit it.</li>
                <li>Click <span className="text-brass-300">Add lot</span> (or press <kbd className="px-1 bg-ink-800 rounded text-xs">A</kbd>) to draw a new one.</li>
                <li>While drawing: click each corner. Click the first point or press <kbd className="px-1 bg-ink-800 rounded text-xs">Enter</kbd> to close.</li>
                <li>Press <kbd className="px-1 bg-ink-800 rounded text-xs">Esc</kbd> to cancel any action.</li>
              </ul>
            </div>
          )}

          {pendingLot && (
            <LotForm
              title="New lot"
              draft={pendingLot}
              onChange={setPendingLot}
              onSave={saveNew}
              onCancel={() => { setPendingLot(null); setDraftPoints(null); }}
              busy={busy}
              estSqft={Math.round(polygonAreaSqft(
                pointsToArray(pendingLot.polygon_points),
                { width: VIEW_W, height: VIEW_H },
                { width: VIEW_W, height: VIEW_H },
              ))}
              showDelete={false}
            />
          )}

          {editing && (
            <LotForm
              title={`Edit lot ${editing.lot_number}`}
              draft={editing}
              onChange={setEditing}
              onSave={saveEdit}
              onCancel={() => { setEditing(null); setSelectedId(null); }}
              onDelete={deleteSelected}
              busy={busy}
              showDelete
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function LotForm({
  title,
  draft,
  onChange,
  onSave,
  onCancel,
  onDelete,
  busy,
  estSqft,
  showDelete,
}: {
  title: string;
  draft: DraftLot;
  onChange: (d: DraftLot) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  busy: boolean;
  estSqft?: number;
  showDelete: boolean;
}) {
  return (
    <div className="border border-brass-500/30 bg-ink-900/60 rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-brass-400 uppercase tracking-[0.22em] text-xs">{title}</p>
        <button onClick={onCancel} className="text-ink-300 hover:text-ink-50" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <Field label="Lot number">
        <input
          type="text"
          value={draft.lot_number}
          onChange={(e) => onChange({ ...draft, lot_number: e.target.value })}
          className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
        />
      </Field>

      <Field label="Status">
        <select
          value={draft.status}
          onChange={(e) => onChange({ ...draft, status: e.target.value as LotStatus })}
          className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
        >
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="under_contract">Under contract</option>
          <option value="sold">Sold</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Size (sqft)">
          <input
            type="number"
            inputMode="numeric"
            value={draft.size_sqft ?? ''}
            placeholder={estSqft ? `est ${estSqft}` : ''}
            onChange={(e) => onChange({ ...draft, size_sqft: e.target.value ? Number(e.target.value) : null })}
            className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
          />
        </Field>
        <Field label="Price ($)">
          <input
            type="number"
            inputMode="numeric"
            value={draft.price ?? ''}
            onChange={(e) => onChange({ ...draft, price: e.target.value ? Number(e.target.value) : null })}
            className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
          />
        </Field>
      </div>

      <Field label="Phase">
        <input
          type="text"
          value={draft.phase ?? ''}
          onChange={(e) => onChange({ ...draft, phase: e.target.value || null })}
          className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
        />
      </Field>

      <Field label="Dimensions">
        <input
          type="text"
          value={draft.dimensions ?? ''}
          placeholder="e.g. 50' × 110'"
          onChange={(e) => onChange({ ...draft, dimensions: e.target.value || null })}
          className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={draft.notes ?? ''}
          onChange={(e) => onChange({ ...draft, notes: e.target.value || null })}
          rows={2}
          className="w-full bg-ink-950 border border-ink-700 text-ink-100 px-3 py-2 rounded-sm text-sm focus:border-brass-500 focus:outline-none"
        />
      </Field>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={busy || !draft.lot_number}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-brass-500 hover:bg-brass-400 active:bg-brass-600 text-ink-950 font-medium py-2 px-4 rounded-sm transition disabled:opacity-50 min-h-[40px]"
        >
          <Save className="w-4 h-4" /> {busy ? 'Saving...' : 'Save'}
        </button>
        {showDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center justify-center border border-red-500/50 text-red-300 hover:text-red-100 hover:border-red-400 px-3 py-2 rounded-sm transition disabled:opacity-50 min-h-[40px]"
            aria-label="Delete lot"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink-400 mb-1">{label}</span>
      {children}
    </label>
  );
}
