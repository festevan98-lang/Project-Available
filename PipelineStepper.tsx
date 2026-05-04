import type { PipelineStage } from '@/lib/supabase/types';

export const PIPELINE_ORDER: PipelineStage[] = [
  'entitled',
  'bidding',
  'under_construction',
  'lots_available',
  'sold_out',
];

export const PIPELINE_LABELS: Record<PipelineStage, string> = {
  entitled: 'Entitled',
  bidding: 'Bidding',
  under_construction: 'Under Construction',
  lots_available: 'Lots Available',
  sold_out: 'Sold Out',
};

export function PipelineStepper({ current }: { current: PipelineStage }) {
  const currentIdx = PIPELINE_ORDER.indexOf(current);

  return (
    <div className="flex items-center w-full overflow-x-auto pb-2">
      {PIPELINE_ORDER.map((stage, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={stage} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center min-w-[100px]">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isCurrent
                    ? 'bg-brass-400 border-brass-400 shadow-[0_0_12px_rgba(217,164,55,0.6)]'
                    : isDone
                      ? 'bg-brass-600 border-brass-600'
                      : 'bg-transparent border-ink-400'
                }`}
              />
              <span
                className={`text-xs mt-2 text-center ${
                  isCurrent
                    ? 'text-brass-300 font-medium'
                    : isDone
                      ? 'text-ink-200'
                      : 'text-ink-400'
                }`}
              >
                {PIPELINE_LABELS[stage]}
              </span>
            </div>
            {idx < PIPELINE_ORDER.length - 1 && (
              <div
                className={`h-px w-8 sm:w-16 -mt-5 ${
                  idx < currentIdx ? 'bg-brass-600' : 'bg-ink-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
