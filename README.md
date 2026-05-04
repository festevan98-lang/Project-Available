# Ferest Active Projects

Public-facing app for showcasing Ferest Development's active subdivisions and lots. Lives at `projects.ferest.dev`. Linked from `www.ferest.dev/active-projects` (Squarespace).

This app is **separate** from `app.ferest.dev` (Deal to Dirt). Different repo, different Supabase project, different Vercel deploy. Intentionally isolated.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Supabase (Postgres + RLS) for projects, lots, leads
- Resend for transactional email
- SVG-over-image for the interactive lot map (no map library)

## Getting started

See `CLAUDE_CODE_INSTRUCTIONS.md` for the full setup walkthrough. Short version:

```bash
npm install
cp .env.local.example .env.local   # fill in keys
npm run dev
```

Apply the migration in `supabase/migrations/0001_initial_schema.sql` and seed with `supabase/seed.sql` in the Supabase SQL editor.

## Adding a new project

Insert a row into `projects` (Supabase table editor or SQL):
- Set `slug`, `name`, `tier='lot_inventory'`, `city`, `state`
- Add `plat_image_url` pointing to `/plats/your-plat.jpg`
- Set `plat_image_width` and `plat_image_height` to the natural dimensions of that image in pixels
- Set `is_published=true` when ready to go live

Add lots in the `lots` table with `polygon_points` in SVG point format (see below).

## Plat-to-SVG workflow

1. Export the plat from CAD as a PNG (or JPG) at known dimensions, e.g. 1600×1200.
2. Save it to `public/plats/{slug}-plat.jpg`.
3. Open the image in a vector tool (Figma, Illustrator, Inkscape).
4. Trace each lot as a polygon. Use coordinates relative to the **image's natural pixel dimensions**, not the displayed size.
5. Export each polygon's points as a space-separated string: `"x1,y1 x2,y2 x3,y3 ..."`
6. Insert into `lots.polygon_points`.
7. Update `projects.plat_image_width` and `plat_image_height` to match the natural image dimensions.

The seed file generates rectangular placeholders in a grid — replace these with real polygon coordinates per project.

## Updating lot status

Open Supabase table editor → `lots` → find the row → change `status` to `available`, `reserved`, `under_contract`, or `sold`. Live within 30 seconds (page revalidate window). No deploy required.

## Deploy

Push to `main` → Vercel auto-deploys. Ensure all env vars are set in the Vercel dashboard (Project Settings → Environment Variables).

## Squarespace integration

Paste `squarespace-snippet.html` into a Code Block on `www.ferest.dev/active-projects`. Update headlines and links per project.

## Hard rules

- No PE seal, license number, cost estimates, or construction timelines on public pages.
- No payments. Reservations are interest-capture only.
- Do not commit `.env.local`.
