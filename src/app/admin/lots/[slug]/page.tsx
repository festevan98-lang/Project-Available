import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { LotTracer } from './LotTracer';
import type { Project, Lot } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminLotsPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
  if (!project) notFound();

  const { data: lots } = await supabase
    .from('lots')
    .select('*')
    .eq('project_id', project.id);

  return (
    <LotTracer
      project={project as Project}
      initialLots={(lots ?? []) as Lot[]}
    />
  );
}
