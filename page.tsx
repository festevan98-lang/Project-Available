import { getPublishedProjects } from '@/lib/data/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';

export const revalidate = 60;

export default async function ProjectsIndex() {
  const projects = await getPublishedProjects();

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
      <div className="max-w-2xl mb-16">
        <p className="text-brass-400 uppercase tracking-[0.2em] text-xs mb-4">
          Active Projects
        </p>
        <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-6">
          Lots and homes,{' '}
          <span className="text-brass-400">engineered in-house.</span>
        </h1>
        <p className="text-ink-200 text-lg leading-relaxed">
          Every project on this page was platted, entitled, and engineered by a
          licensed Texas PE before a single lot went to market. No zoning
          surprises. No drainage retrofits. No permitting risk passed to the
          buyer.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-ink-300">
          No projects published yet. Check back soon.
        </p>
      )}
    </div>
  );
}
