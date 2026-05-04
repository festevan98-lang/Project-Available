# Claude Code Instructions — Ferest Active Projects

You're scaffolding a new Next.js app at `projects.ferest.dev` to showcase Ferest Development's active subdivisions with an interactive lot map. The starter code is in this folder. Your job: drop it into a fresh repo, wire up Supabase + Resend, get it running, and refine the UI to match Ferest's brand.

This app is **completely separate** from `app.ferest.dev` (the Deal to Dirt feasibility tool). Do not import code, env vars, or conventions from that app. Different repo, different Vercel project, different Supabase project.

---

## STEP 1 — Research the references first (do this before writing any code)

Before you scaffold or modify anything, fetch and study these three sites. Take notes in `RESEARCH_NOTES.md` at the repo root. The goal is to understand the *interaction patterns* and *data model* — not to copy the visual style.

### Sites to study

1. **Habitat Development Group — Lot map tool**
   `https://app.habitatdevelopmentgroup.com/subdivisions/7cd2f6eb-01f5-40f0-b1d0-cebc9964a4db/lots`
   Note: how lots are clicked, what the detail panel shows, how status is color-coded, how filters behave, mobile interaction.

2. **Habitat Development Group — Project page**
   `https://habitatdevelopmentgroup.com/projects/habitat-at-ware/`
   Note: section order, what trust signals are surfaced, how amenities and pipeline are presented, CTAs.

3. **Ferest's existing site**
   `https://www.ferest.dev` and `https://www.ferest.dev/lagunaoaks`
   Note: typography, color usage, copy voice, image style, navigation. **The new app must feel like a continuation of this site, not a different brand.**

### What to write in RESEARCH_NOTES.md

For each site, capture:
- 5–10 specific things to replicate (interaction patterns, data structure, copy patterns)
- 3–5 things to deliberately do *better* than Habitat (their site is a baseline, not a ceiling)
- Specific brand cues from ferest.dev that must carry over (fonts, color tone, voice)
- Any features in Habitat that we should *not* build for v1

Only after this file exists should you proceed to Step 2.

---

## STEP 2 — Scaffold

```bash
npx create-next-app@latest ferest-projects \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --no-eslint --use-npm
cd ferest-projects
```

Then install the runtime deps:

```bash
npm install @supabase/ssr @supabase/supabase-js resend zod react-hook-form @hookform/resolvers lucide-react
```

**Do not install** Leaflet, MapLibre, Mapbox, or any other map library. Lot rendering is SVG over a plat image — that's the whole approach.

---

## STEP 3 — Drop in the starter code

Copy every file from this starter folder into the new repo, preserving paths:

```
package.json                              # merge deps if you ran create-next-app
tailwind.config.ts                        # replace
src/app/layout.tsx                        # replace
src/app/page.tsx                          # replace
src/app/globals.css                       # replace
src/app/projects/page.tsx                 # new
src/app/projects/[slug]/page.tsx          # new
src/app/api/interest/route.ts             # new
src/components/projects/*.tsx             # all new
src/lib/supabase/server.ts                # new
src/lib/supabase/types.ts                 # new
src/lib/data/projects.ts                  # new
supabase/migrations/0001_initial_schema.sql
supabase/seed.sql
.env.local.example                        # new
squarespace-snippet.html                  # new (do not deploy — for Fernando)
```

Then run `npm run dev` and confirm the app boots (it'll show empty state until Supabase is wired up).

---

## STEP 4 — Supabase setup

1. Have Fernando create a **new Supabase project** at supabase.com (not a new schema in an existing project — a brand new project). Free tier is fine.
2. Get the URL, anon key, and service role key. Fernando puts them in `.env.local`.
3. Run the migration in the Supabase SQL editor: paste contents of `supabase/migrations/0001_initial_schema.sql`, run.
4. Run the seed: paste contents of `supabase/seed.sql`, run. This creates Laguna Oaks (12 lots) and Laguna Heights (142 lots, 2 reserved) with placeholder polygon coordinates.
5. Add placeholder hero/plat images to `public/plats/` so the pages render. Names referenced in seed:
   - `laguna-oaks-hero.jpg`, `laguna-oaks-plat.jpg`
   - `laguna-heights-hero.jpg`, `laguna-heights-plat.jpg`
   For now, any 1600×1200 placeholder image works. Real plats replace these later.

---

## STEP 5 — Resend setup

1. Fernando creates a Resend account, verifies the `ferest.dev` sending domain.
2. API key into `.env.local` as `RESEND_API_KEY`.
3. `INTEREST_NOTIFY_EMAIL` set to Fernando's email.
4. The API route at `src/app/api/interest/route.ts` already wires this up.

---

## STEP 6 — Verify the flow end to end

1. `npm run dev`
2. Visit `/projects` — both projects should render as cards.
3. Click into Laguna Heights — pipeline stepper, engineering trust block, lot map should all render.
4. Click a lot polygon — detail panel opens.
5. Click "Reserve interest" — form opens, submit → confirms saved row in Supabase + email arrives.
6. Test on iOS Safari (real device, not just dev tools). The lot map needs to be tappable and pinch-zoomable.

---

## STEP 7 — Refine using your research notes

Now use what you wrote in `RESEARCH_NOTES.md` to improve:
- Typography pairing (the starter uses Fraunces + Inter as a safe default — replace if ferest.dev uses something distinctive)
- Color warmth (the brass tokens are warmer than the existing app — verify against ferest.dev's actual brass)
- Hero treatment (look at how ferest.dev's existing pages treat hero images — match that)
- Copy voice (read the existing site's copy, adjust headlines to match its register)
- Any standout patterns from Habitat worth lifting (their lot detail panel layout is solid; their pipeline tracker is bland)

Make these refinements as a second commit. Don't over-engineer — match the existing brand, ship it.

---

## STEP 8 — Deploy

1. Push to a new GitHub repo (`ferest-projects`).
2. New Vercel project, import the repo.
3. Add env vars in Vercel dashboard (same as `.env.local`).
4. Deploy — get the `*.vercel.app` URL.
5. In Squarespace DNS, add CNAME: `projects` → `cname.vercel-dns.com`.
6. In Vercel, add custom domain `projects.ferest.dev`.
7. Wait for SSL — usually under 5 minutes.

---

## STEP 9 — Squarespace integration

Give Fernando the contents of `squarespace-snippet.html`. He pastes it into a Code Block on `www.ferest.dev/active-projects`. That's the entire integration — links from Squarespace to the new app. No iframe, no embed.

---

## Hard rules

- **No PE seal, no PE license number, no cost estimates, no construction timelines** anywhere on public pages. Trust comes from the engineering being done, not from displaying credentials.
- **No Stripe, no payments, no deposits.** Reservations are interest-capture only. Stripe integration is a separate project with legal review.
- **Do not commit `.env.local`.** A Stripe key was leaked in a previous chat session — extra caution on secrets.
- **Do not merge to `main` until** the end-to-end flow in Step 6 works on a real iOS device.

---

## What's intentionally not built (v2)

- Spec home detail (floor plans, finishes, model home callouts) for Laguna Oaks
- Builder Program section
- Admin UI for lot status (Fernando uses Supabase table editor for v1)
- Unified web + DM lead pipeline
- Real plat polygon tracing (placeholder grid for v1, real plats traced post-launch)

When you finish Step 6, ping Fernando before doing Step 7 refinements so he can review the working baseline first.
