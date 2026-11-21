# Emmanuel Olivo's portfolio

A Next.js App Router site that serves the portfolio from versioned content and media. The production build needs no CMS, database, or migration credentials.

## Local development

Use Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm run lint`, `npm run typecheck`, and `npm run build` before committing site changes.

## Edit the portfolio

- Update `src/content/portfolio.json` for the hero, links, project list, experience, About, and contact. The order of the project and job arrays controls the homepage. The types are in `src/content/portfolio.ts`.
- Add a project to `work.projects` with a unique `id` and `slug`. Supply its title, summary, role labels, technologies, rich-text blocks in `detail`, and optional live and source links. `thumbnail` appears on the card. Rich-text image blocks appear in the dialog.
- To optimize a project image, run `npm run migration:ingest -- --add-image <project-slug> <image-file> "<alt text>"`. Paste the printed image record into `thumbnail` or `gallery`. For a rich-text image block, use the printed `src` as `image.url` and `alt` as `image.alternativeText`. The command accepts identical reruns and flags filename collisions.
- To update the résumé, replace `public/downloads/emmanuel-olivo-resume.pdf`, then verify that the homepage link loads the PDF.

## Capture and migrate sources

Run `npm run migration:capture` to save a dated, private capture under `.migration-private/`. The default source is the live Strapi API. To override it, set `STRAPI_ORIGIN` in `.env.local`. A temporary read token can be set there as `STRAPI_READ_TOKEN` for an authorized capture. Pass `-- --include-drafts` only for a separate private draft archive.

Use a published capture to regenerate the site's content and optimized media.

```sh
npm run migration:ingest -- <private-capture-directory> [local-media-directory ...]
```

Add `--archive-library` to retain reachable original media and variants privately. The import rewrites media references and records their sources and checksums in [the media manifest](docs/media-manifest.json). It rewrites the content snapshot, so commit editorial changes first and review the resulting diff after any recapture.

## Deployment

Import this repository in the dedicated Vercel project and use its Next.js defaults. Review an isolated Preview deployment before promoting a release. Keep migration files and credentials out of Vercel. See [the migration report](docs/migration.md) for route coverage, backup status, and rollback procedure.
