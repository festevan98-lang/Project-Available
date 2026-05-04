import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/supabase/types';
import { PIPELINE_LABELS } from './PipelineStepper';

export function ProjectCard({ project }: { project: Project }) {
  const priceRange =
    project.price_range_low && project.price_range_high
      ? `$${(project.price_range_low / 1000).toFixed(0)}k–$${(project.price_range_high / 1000).toFixed(0)}k`
      : null;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border border-ink-700/50 bg-ink-900/40 hover:border-brass-500/60 transition rounded-sm overflow-hidden"
    >
      <div className="aspect-[16/10] bg-ink-700 relative overflow-hidden">
        {project.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.hero_image_url}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
        )}
        <div className="absolute top-4 left-4 px-3 py-1 bg-ink-950/80 border border-brass-500/40 text-brass-300 text-xs uppercase tracking-wider rounded-sm">
          {PIPELINE_LABELS[project.pipeline_stage]}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2 className="font-display text-2xl mb-1">{project.name}</h2>
            <p className="text-ink-300 text-sm">
              {project.city}, {project.state}
            </p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-ink-400 group-hover:text-brass-400 transition" />
        </div>

        {project.headline && (
          <p className="text-ink-200 mb-4">{project.headline}</p>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-4 border-t border-ink-700/50">
          {project.total_lots != null && (
            <span>
              <span className="text-ink-400">Lots:</span>{' '}
              <span className="text-ink-100">{project.total_lots}</span>
            </span>
          )}
          {project.phase && (
            <span>
              <span className="text-ink-400">Phase:</span>{' '}
              <span className="text-ink-100">{project.phase}</span>
            </span>
          )}
          {priceRange && (
            <span>
              <span className="text-ink-400">From:</span>{' '}
              <span className="text-brass-300">{priceRange}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
