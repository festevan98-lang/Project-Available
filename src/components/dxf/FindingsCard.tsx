import { AlertTriangle } from 'lucide-react';
import type { DxfFindings } from '@/lib/dxf/types';

const DRAWING_TYPE_LABELS: Record<DxfFindings['drawingType'], string> = {
  subdivision_plat: 'Subdivision plat',
  topographic_survey: 'Topographic survey',
  boundary_survey: 'Boundary survey',
  site_plan: 'Site plan',
  engineering_design: 'Engineering design',
  unknown: 'Unclassified',
};

export function FindingsCard({ findings }: { findings: DxfFindings }) {
  const lowConfidence = findings.unitsConfidence === 'low';
  return (
    <div className="border border-brass-500/40 bg-brass-900/10 rounded-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-brass-500/30 flex items-center gap-3 bg-brass-900/20">
        <span aria-hidden className="block w-1.5 h-1.5 bg-brass-400" />
        <p className="text-brass-300 uppercase tracking-[0.22em] text-[11px]">
          Engineer&rsquo;s read
        </p>
        <span className="ml-auto text-xs text-ink-300">Informational only. PE confirms on consult.</span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <p className="text-ink-100 text-base sm:text-lg leading-relaxed">{findings.summary}</p>

        <div className="grid grid-cols-3 gap-px bg-ink-700/50 border border-ink-700/50 rounded-sm overflow-hidden text-xs sm:text-sm">
          <Stat label="Drawing type" value={DRAWING_TYPE_LABELS[findings.drawingType]} />
          <Stat label="Lot count" value={findings.lotCount != null ? String(findings.lotCount) : '-'} />
          <Stat label="Total area" value={findings.totalAreaLabel ?? '-'} accent />
        </div>

        {lowConfidence && (
          <div className="flex items-start gap-3 px-4 py-3 border border-amber-500/40 bg-amber-900/10 rounded-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-100">
              <p className="font-medium mb-1">Units uncertain</p>
              <p className="text-amber-100/80">
                {findings.unitsNote ?? 'DXF units flag was unset or inconsistent. Verify scale against a known dimension before quoting area.'}
              </p>
            </div>
          </div>
        )}

        {findings.boundingBoxNotes && (
          <div className="text-sm text-ink-200">
            <p className="text-ink-400 text-xs uppercase tracking-wider mb-1">Bounding box check</p>
            <p>{findings.boundingBoxNotes}</p>
          </div>
        )}

        {findings.keyFindings.length > 0 && (
          <div>
            <p className="text-ink-400 text-xs uppercase tracking-wider mb-2">Key findings</p>
            <ul className="space-y-1.5">
              {findings.keyFindings.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink-100">
                  <span aria-hidden className="text-brass-400 mt-1 shrink-0">&rsaquo;</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {findings.verificationItems.length > 0 && (
          <div className="border-t border-ink-700/50 pt-4">
            <p className="text-ink-400 text-xs uppercase tracking-wider mb-2">
              Verify on consult
            </p>
            <ul className="space-y-1.5">
              {findings.verificationItems.map((v, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink-100">
                  <span aria-hidden className="text-ink-400 mt-1 shrink-0">[ ]</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-ink-900 px-3 sm:px-4 py-3">
      <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-ink-400 mb-1">{label}</div>
      <div className={`text-sm sm:text-base ${accent ? 'text-brass-300 font-medium' : 'text-ink-50'} capitalize tabular-nums`}>
        {value}
      </div>
    </div>
  );
}
