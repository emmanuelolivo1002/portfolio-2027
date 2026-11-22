# Portfolio migration

Phase 1 preserves the public homepage and replaces the CMS dependency with versioned content and assets. Phase 2 starts from the verified Phase 1 tag and updates the design in the same repository.

## Public route and behavior inventory

| Entry | Observed behavior |
| --- | --- |
| `/` | Hero, Projects, Experience, About, Contact, and footer in that order. |
| `/#projects` | “See my Work” and the Projects navigation link scroll here. The ordered 19 project cards open in-page dialogs with descriptions, images where present, role labels, technologies, and any supplied project or source links. |
| `/#experience` | Seven job entries in a scroll-driven timeline. |
| `/#about` | Biography. The original site and the Phase 1 baseline included a portrait. |
| `/#contact` | Email, LinkedIn, and GitHub links. |
| Résumé | Opens the current PDF in a new tab. The verified Strapi original was copied to `/downloads/emmanuel-olivo-resume.pdf`. The legacy path redirects on the new portfolio hostname. |
| Footer | “Next.js” links to the original frontend repository. |
| `/sitemap.xml`, `/robots.txt` | Both returned HTTP 404 on the old portfolio. |
| Project detail routes | The old frontend and live homepage use dialogs. There are no public project detail URLs to move. |

The old frontend includes Vercel Analytics and Speed Insights. The rebuild enables the integrations in Vercel production. Its metadata uses the existing title and description and declares the public canonical URL. The retired Strapi revalidation webhook is unnecessary for a static content build.

## Capture and recovery

- The live public API returned one homepage and one global record, 20 published projects, four project categories, 25 technologies, and 147 media records. Nineteen projects are attached to the homepage in editorial order. Smmart Brain is the published project outside that list.
- The rebuild recovered 61 live originals and 11 live variants. The [media manifest](media-manifest.json) records the Strapi migration and its checksums, with selected entries updated for Phase 2. The résumé bytes match the live PDF.
- The public API archive recovered 422 of 701 original and derivative Media Library URLs. This count includes variants and unused records. The private archive records the missing URLs and the hashes of surviving files.
- The supplied July 2024 SQLite backups passed `PRAGMA quick_check`. The private workspace archive holds verified copies of both databases, the supplied local Strapi uploads, the public capture, and its surviving media. The public locales API returned HTTP 403.
- The production service ran Strapi 4.24.3 with SQLite at `/app/data/data.db` and uploads at `/app/public/uploads`. A consistent SQLite snapshot and an archive of the production uploads and restoration folders are stored in `.migration-private/live-railway-2026-11-21/`. The database passed `PRAGMA quick_check` and reconciled with the live API at 20 published projects, 147 media records, one homepage, seven jobs, and one locale. The archive includes 423 files in the public upload directory plus the restoration folders.
- A Strapi 4.24.3 content-only export from an isolated copy of the production snapshot contains 29 schemas, 238 entities, and 390 links. It is retained alongside the production SQLite and uploads archive.
- The live Unfolded project had a description pasted into its website URL field. The rebuild points the button to the verified [Unfolded: Poetry Project website](https://unfoldedpoetryproject.com/).

## Cutover and rollback

Capture the live content again before cutover and reconcile any changes to the homepage, projects, uploads, and résumé. Record the current Vercel deployment, domain assignments, DNS records, and redirect behavior. After Emmanuel approves the redesign and domain move, assign the live domain to the approved project and verify HTTPS, apex and www behavior, navigation, dialogs, and the résumé. If a critical problem appears, restore the previous domain assignment or DNS settings and verify the original deployment again. Keep the Phase 1 tag and deployment as the rollback baseline within the new project.

Use the image and résumé paths in [the current portfolio content](../src/content/portfolio.json) when checking the redesign’s assets before cutover. Verify that each path resolves on the candidate deployment, including the project screenshots added during Phase 2.

Keep the Strapi service and private backups available until the new production site is verified and Emmanuel approves retirement.

## Preview and rollback reference

- [Phase 1 faithful rebuild](https://portfolio-2027-phase1-29d1b00.vercel.app/) is tagged `phase-1-baseline` at `29d1b00`. The dedicated alias protects that deployment from the project's 30-day retention policy. Browser checks covered two viewport widths, all 19 dialogs and their keyboard focus, four section anchors, seven timeline entries, and the résumé. All 72 hosted media items matched their committed hashes. The rebuild preserves the dark green palette and desktop navigation and recreates the hero animation with CSS. The old site's entrance and portrait parallax effects were simplified. [Vercel retention rules](https://vercel.com/docs/deployment-retention)
- The Phase 2 redesign is on `phase-2-redesign`. It gives the work screenshots more space, shows navigation on mobile, and uses the original dark green and lime palette. The About section presents the biography without the portrait.
- Sign in to the `emmanuel-olivos-projects` Vercel team to view either preview. The project is connected to the GitHub repository for branch deployments.
- The live apex domain is assigned to the original `portfolio-frontend` project, and the www hostname redirects to the apex with HTTP 308. The recorded original deployment is [portfolio-frontend-jrkc7mzx3](https://portfolio-frontend-jrkc7mzx3-emmanuel-olivos-projects.vercel.app/). The private folder contains the DNS and original deployment inventory for rollback.
