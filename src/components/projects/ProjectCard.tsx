import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/supabase/types';
import { PIPELINE_LABELS } from './PipelineStepper';
import { PlatPattern } from './PlatPattern';

export function ProjectCard({ project }: { project: Project }) {
  const priceRange =
    project.price_range_low && project.price_range_high
      ? `$${(project.price_range_low / 1000).toFixed(0)}k–$${(project.price_range_high / 1000).toFixed(0)}k`
      : null;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative block border border-ink-700/50 bg-ink-900/40 hover:border-brass-500/70 hover:shadow-[0_0_0_1px_rgba(217,164,55,0.18)] transition rounded-sm overflow-hidden"
    >
      <span aria-hidden className="absolute top-0 left-0 w-3 h-px bg-brass-400/70 z-20" />
      <span aria-hidden className="absolute top-0 left-0 h-3 w-px bg-brass-400/70 z-20" />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-px bg-brass-400/70 z-20" />
      <span aria-hidden className="absolute bottom-0 right-0 h-3 w-px bg-brass-400/70 z-20" />

      <div className="aspect-[16/10] bg-ink-900 relative overflow-hidden">
        {project.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.hero_image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
        ) : (
          <PlatPattern />
        )}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex items-center gap-2 px-3 py-1 bg-ink-950/85 border border-brass-500/40 text-brass-300 text-[10px] sm:text-xs uppercase tracking-wider rounded-sm">
          <span aria-hidden className="block w-1.5 h-1.5 bg-brass-400" />
          {PIPELINE_LABELS[project.pipeline_stage]}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-2 sm:mb-3">
          <div>
            <h2 className="font-display text-2xl leading-tight mb-1">
              {project.name}
            </h2>
            <p className="text-ink-300 text-sm">
              {project.city}, {project.state}
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-ink-400 group-hover:text-brass-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
        </div>

        {project.headline && (
          <p className="text-ink-200 text-sm sm:text-base mb-4 leading-relaxed">
            {project.headline}
          </p>
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm pt-4 border-t border-ink-700/50">
          {project.total_lots != null && (
            <span>
              <span className="text-ink-400 uppercase tracking-wider text-[10px] sm:text-[11px] mr-1.5">
                Lots
              </span>
              <span className="text-ink-100 font-medium tabular-nums">
                {project.total_lots}
              </span>
            </span>
          )}
          {project.phase && (
            <span>
              <span className="text-ink-400 uppercase tracking-wider text-[10px] sm:text-[11px] mr-1.5">
                Phase
              </span>
              <span className="text-ink-100 font-medium">{project.phase}</span>
            </span>
          )}
          {priceRange && (
            <span>
              <span className="text-ink-400 uppercase tracking-wider text-[10px] sm:text-[11px] mr-1.5">
                From
              </span>
              <span className="text-brass-300 font-medium tabular-nums">
                {priceRange}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
