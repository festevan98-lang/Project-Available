import { notFound } from 'next/navigation';
import { getProjectBySlug } from '@/lib/data/projects';
import { PipelineStepper } from '@/components/projects/PipelineStepper';
import { EngineeringTrust } from '@/components/projects/EngineeringTrust';
import { ProjectInteractive } from '@/components/projects/ProjectInteractive';

export const revalidate = 30;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const priceRange =
    project.price_range_low && project.price_range_high
      ? `$${(project.price_range_low / 1000).toFixed(0)}k–$${(project.price_range_high / 1000).toFixed(0)}k`
      : null;

  return (
    <article>
      {/* Hero */}
      <section className="relative">
        <div className="aspect-[16/7] sm:aspect-[16/6] bg-ink-700 relative overflow-hidden">
          {project.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.hero_image_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-32 sm:-mt-40 relative">
          <p className="text-brass-400 uppercase tracking-[0.2em] text-xs mb-3">
            {project.city}, {project.state}
          </p>
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] mb-4 max-w-3xl">
            {project.name}
          </h1>
          {project.headline && (
            <p className="text-ink-100 text-lg max-w-2xl">
              {project.headline}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Quick facts strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink-700/50 border border-ink-700/50 rounded-sm overflow-hidden">
          <Fact
            label="Total lots"
            value={project.total_lots?.toString() ?? '—'}
          />
          <Fact label="Phase" value={project.phase ?? '—'} />
          <Fact label="From" value={priceRange ?? '—'} accent />
          <Fact
            label="Stage"
            value={project.pipeline_stage.replace(/_/g, ' ')}
          />
        </div>

        {/* Pipeline */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-ink-400 mb-4">
            Project pipeline
          </h2>
          <PipelineStepper current={project.pipeline_stage} />
        </section>

        {/* Description */}
        {project.description && (
          <section className="max-w-prose">
            <p className="text-ink-100 text-lg leading-relaxed">
              {project.description}
            </p>
          </section>
        )}

        {/* Engineering trust */}
        <EngineeringTrust highlights={project.engineering_highlights} />

        {/* Amenities */}
        {project.amenities.length > 0 && (
          <section>
            <h2 className="font-display text-2xl mb-4">Amenities</h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-ink-100">
              {project.amenities.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-brass-400 mt-1">▸</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Lot map + interactive */}
        <section>
          <h2 className="font-display text-3xl mb-2">Lot availability</h2>
          <p className="text-ink-300 text-sm mb-6">
            Click a lot for details. Use filters to narrow by status, size, or
            price.
          </p>
          <ProjectInteractive project={project} />
        </section>
      </div>
    </article>
  );
}

function Fact({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-ink-900 px-4 py-4 sm:py-5">
      <div className="text-xs uppercase tracking-wider text-ink-400 mb-1">
        {label}
      </div>
      <div
        className={`text-lg sm:text-xl ${
          accent ? 'text-brass-300 font-medium' : 'text-ink-50'
        } capitalize`}
      >
        {value}
      </div>
    </div>
  );
}
