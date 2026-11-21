# Portfolio migration

Phase 1 preserves the public homepage and replaces the CMS dependency with versioned content and assets. Phase 2 starts from the verified Phase 1 tag and updates the design in the same repository.

## Public route and behavior inventory

| Entry | Observed behavior |
| --- | --- |
| `/` | Hero, Projects, Experience, About, Contact, and footer in that order. |
| `/#projects` | “See my Work” and the Projects navigation link scroll here. The ordered 19 project cards open in-page dialogs with descriptions, images where present, role labels, technologies, and any supplied project or source links. |
| `/#experience` | Seven job entries in a scroll-driven timeline. |
| `/#about` | Biography and portrait. |
| `/#contact` | Email, LinkedIn, and GitHub links. |
| Résumé | Opens the current PDF in a new tab. The verified Strapi original was copied to `/downloads/emmanuel-olivo-resume.pdf`. The legacy path redirects on the new portfolio hostname. |
| Footer | “Next.js” links to the original frontend repository. |
| `/sitemap.xml`, `/robots.txt` | Both returned HTTP 404 on the old portfolio. |
| Project detail routes | The old frontend and live homepage use dialogs. There are no public project detail URLs to move. |

The old frontend includes Vercel Analytics and Speed Insights. The rebuild enables the integrations in Vercel production. Its metadata uses the existing title and description and declares the public canonical URL. The retired Strapi revalidation webhook is unnecessary for a static content build.

## Capture and recovery

- The live public API returned one homepage and one global record, 20 published projects, four project categories, 25 technologies, and 147 media records. Nineteen projects are attached to the homepage in editorial order. Smmart Brain is the published project outside that list.
- The [media manifest](media-manifest.json) records the 72 source media references used by the homepage and its project records. The rebuild recovered 61 live originals and 11 live variants. All 72 resolve locally. The résumé bytes match the live PDF.
- The public API archive recovered 422 of 701 original and derivative Media Library URLs. This count includes variants and unused records. The private archive records the missing URLs and the hashes of surviving files.
- The supplied July 2024 SQLite backups passed `PRAGMA quick_check`. The private workspace archive holds verified copies of both databases, the supplied local Strapi uploads, the public capture, and its surviving media. The public locales API returned HTTP 403.
- The production service ran Strapi 4.24.3 with SQLite at `/app/data/data.db` and uploads at `/app/public/uploads`. A consistent SQLite snapshot and an archive of the production uploads and restoration folders are stored in `.migration-private/live-railway-2026-11-21/`. The database passed `PRAGMA quick_check` and reconciled with the live API at 20 published projects, 147 media records, one homepage, seven jobs, and one locale. The archive includes 423 files in the public upload directory plus the restoration folders.
- A Strapi 4.24.3 content-only export from an isolated copy of the production snapshot contains 29 schemas, 238 entities, and 390 links. It is retained alongside the production SQLite and uploads archive.
- The live Unfolded project had a description pasted into its website URL field. The rebuild points the button to the verified [Unfolded: Poetry Project website](https://unfoldedpoetryproject.com/).

## Cutover and rollback

Capture the live content again before cutover and reconcile any changes to the homepage, projects, uploads, and résumé. Record the current Vercel deployment, domain assignments, DNS records, and redirect behavior. After Emmanuel approves the redesign and domain move, assign the live domain to the approved project and verify HTTPS, apex and www behavior, navigation, dialogs, and the résumé. If a critical problem appears, restore the previous domain assignment or DNS settings and verify the original deployment again. Keep the Phase 1 tag and deployment as the rollback baseline within the new project.

Keep the Strapi service and private backups available until the new production site is verified and Emmanuel approves retirement.
