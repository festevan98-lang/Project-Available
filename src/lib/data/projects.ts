import { createClient } from '@/lib/supabase/server';
import type { Project, ProjectWithLots, Lot } from '@/lib/supabase/types';

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('getPublishedProjects error:', error);
    return [];
  }
  return data ?? [];
}

export async function getProjectBySlug(
  slug: string
): Promise<ProjectWithLots | null> {
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (projectError || !project) return null;

  const { data: lots, error: lotsError } = await supabase
    .from('lots')
    .select('*')
    .eq('project_id', project.id)
    .order('lot_number', { ascending: true });

  if (lotsError) {
    console.error('getProjectBySlug lots error:', lotsError);
    return { ...(project as Project), lots: [] };
  }

  return { ...(project as Project), lots: (lots ?? []) as Lot[] };
}
