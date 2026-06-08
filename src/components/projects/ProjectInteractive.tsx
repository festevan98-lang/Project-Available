'use client';

import { useState } from 'react';
import type { ProjectWithLots, Lot } from '@/lib/supabase/types';
import { LotMap } from './LotMap';
import { InterestForm } from './InterestForm';
import { AvailableLotsGrid } from './AvailableLotsGrid';

export function ProjectInteractive({
  project,
}: {
  project: ProjectWithLots;
}) {
  const [interestLot, setInterestLot] = useState<Lot | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function openInterest(lot: Lot | null) {
    setInterestLot(lot);
    setFormOpen(true);
  }

  if (!project.plat_image_width || !project.plat_image_height) {
    return (
      <div className="text-ink-300 text-sm border border-ink-700/50 rounded-sm p-6">
        Plat dimensions not configured. Set plat_image_width and
        plat_image_height on this project.
      </div>
    );
  }

  return (
    <>
      <LotMap
        projectName={project.name}
        platImageUrl={project.plat_image_url}
        platWidth={project.plat_image_width}
        platHeight={project.plat_image_height}
        lots={project.lots}
        onInterest={openInterest}
      />

      <AvailableLotsGrid
        lots={project.lots}
        onSelect={(lot) => openInterest(lot)}
      />

      {project.interest_form_enabled && (
        <div className="border border-brass-500/30 bg-brass-900/10 rounded-sm p-5 sm:p-8 text-center">
          <h3 className="font-display text-xl sm:text-2xl mb-2">
            Not seeing the right lot?
          </h3>
          <p className="text-ink-200 text-sm sm:text-base mb-5">
            Join the priority list — get first look at new releases and pricing.
          </p>
          <button
            onClick={() => openInterest(null)}
            className="w-full sm:w-auto bg-brass-500 hover:bg-brass-400 active:bg-brass-600 text-ink-950 font-medium px-6 py-3 rounded-sm transition min-h-[48px]"
          >
            Join priority list
          </button>
        </div>
      )}

      {formOpen && (
        <InterestForm
          projectSlug={project.slug}
          projectName={project.name}
          lot={interestLot}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  );
}
