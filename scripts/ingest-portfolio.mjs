import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import sharp from "sharp";

const output = resolve("public");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const slugify = (value) => value.normalize("NFKD").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const formats = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif" };

async function readIfPresent(path) {
  try {
    return await readFile(path);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function writeAsset(path, bytes) {
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(path, bytes, { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    if (!(await readFile(path)).equals(bytes)) throw new Error(`Asset collision at ${path}`);
  }
}

async function verify(bytes, mime) {
  const pdf = bytes.subarray(0, 5).equals(Buffer.from("%PDF-"));
  if (mime === "application/pdf" || pdf) {
    if (!pdf || (mime && mime !== "application/pdf") || !bytes.subarray(-1024).includes("%%EOF")) {
      throw new Error("Invalid PDF");
    }
    return { mime: "application/pdf" };
  }
  const metadata = await sharp(bytes).metadata();
  const actualMime = formats[metadata.format];
  if (!actualMime || (mime && mime !== actualMime)) throw new Error(`Unexpected image type ${actualMime}`);
  await sharp(bytes, { animated: metadata.format === "gif" }).raw().toBuffer();
  return { mime: actualMime, width: metadata.width, height: metadata.height };
}

async function optimize(bytes, width, mime) {
  if (mime === "application/pdf" || mime === "image/gif") return bytes;
  return sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

if (process.argv[2] === "--add-image") {
  const [, , , project, file, alt] = process.argv;
  if (!project || slugify(project) !== project || !file || !alt?.trim()) {
    throw new Error("Usage: npm run migration:ingest -- --add-image <project-slug> <file> <alt-text>");
  }
  const bytes = await readFile(file);
  const { mime } = await verify(bytes);
  const name = slugify(basename(file, extname(file)));
  if (mime === "application/pdf" || !name) throw new Error("Choose a supported image with a usable filename.");
  const extension = mime === "image/gif" ? ".gif" : ".webp";
  const path = `/images/projects/${project}/${name}${extension}`;
  const optimized = await optimize(bytes, 1920, mime);
  await writeAsset(join(output, path), optimized);
  const { width, height } = await sharp(optimized).metadata();
  console.log(JSON.stringify({ src: path, alt, width, height }, null, 2));
  process.exit(0);
}

const snapshot = resolve(process.argv[2] || ".migration-private");
const input = (name) => readFile(join(snapshot, `${name}.json`), "utf8").then(JSON.parse);
const [capture, home, global, projects, library] = await Promise.all([
  input("capture"), input("home"), input("global"), input("projects"), input("media-library"),
]);
if (capture.includeDrafts || !home.publishedAt || !global.publishedAt || projects.some((p) => !p.publishedAt)) {
  throw new Error("Ingestion requires a published-only capture.");
}
const archiveLibrary = process.argv.includes("--archive-library");
const sourceDirs = process.argv.slice(3).filter((arg) => arg !== "--archive-library");
const localFiles = new Map();
async function indexLocal(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await indexLocal(path);
    if (entry.isFile() && !localFiles.has(entry.name.toLowerCase())) localFiles.set(entry.name.toLowerCase(), path);
  }
}
for (const dir of sourceDirs) await indexLocal(resolve(dir));

const mediaCache = join(snapshot, "media-by-url");
await mkdir(mediaCache, { recursive: true, mode: 0o700 });
const attempts = new Map();
function download(url, mime) {
  if (attempts.has(url)) return attempts.get(url);
  const operation = (async () => {
    if (new URL(url).protocol !== "https:") return;
    const cachePath = join(mediaCache, digest(url));
    const cached = await readIfPresent(cachePath);
    if (cached) return { bytes: cached, info: await verify(cached, mime) };
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12_000), redirect: "error" });
      if (!response.ok) return;
      const bytes = Buffer.from(await response.arrayBuffer());
      const info = await verify(bytes, mime);
      await writeAsset(cachePath, bytes);
      return { bytes, info };
    } catch {
      return undefined;
    }
  })();
  attempts.set(url, operation);
  return operation;
}

const absolute = (url) => new URL(url, capture.origin).href;
const fileName = (url) => decodeURIComponent(basename(new URL(absolute(url)).pathname));
const libraryByUrl = new Map(library.map((record) => [absolute(record.url), record]));
const manifest = new Map();
const optimizedByHash = new Map();
const assets = new Map();
function resolveMedia(record, owner, target, preferred, alt) {
  if (!record?.url) return Promise.resolve(null);
  const url = absolute(record.url);
  let promise = assets.get(url);
  if (!promise) {
    const media = libraryByUrl.get(url) ?? record;
    const references = new Set();
    const entry = {
      url,
      originalName: media.name,
      mime: media.mime,
      width: media.width,
      height: media.height,
      alt: media.alternativeText || alt || "",
      caption: media.caption || null,
      variants: Object.fromEntries(Object.entries(media.formats ?? {}).map(([key, value]) => [key, absolute(value.url)])),
      references,
    };
    manifest.set(url, entry);
    promise = (async () => {
      const options = [media, ...(preferred ?? []).map((key) => media.formats?.[key]).filter(Boolean)];
      for (const option of options) {
        const sourceUrl = absolute(option.url);
        let source = await download(sourceUrl, media.mime);
        let recovery = option === media ? "live original" : "live variant";
        if (!source) {
          const exact = localFiles.get(fileName(sourceUrl).toLowerCase());
          // The original display name is usable only when it also matches a supplied file.
          const named = option === media && localFiles.get(media.name?.toLowerCase());
          for (const path of new Set([exact, named].filter(Boolean))) {
            try {
              const bytes = await readFile(path);
              source = { bytes, info: await verify(bytes, media.mime) };
              recovery = option === media ? "local original" : "recovered variant";
              break;
            } catch {
              // Try another supplied copy or size.
            }
          }
        }
        if (!source) continue;
        const bytes = await optimize(source.bytes, target.startsWith("/images/projects/") ? 1920 : 1400, source.info.mime);
        const sha256 = digest(bytes);
        const extension = source.info.mime === "application/pdf" ? ".pdf" : source.info.mime === "image/gif" ? ".gif" : ".webp";
        const name = slugify(basename(media.name ?? fileName(url), extname(media.name ?? fileName(url))));
        const src = optimizedByHash.get(sha256) ?? (target.startsWith("/downloads/") ? target : `${target}/${name}${extension}`);
        optimizedByHash.set(sha256, src);
        await writeAsset(join(output, src), bytes);
        const info = await verify(bytes);
        Object.assign(entry, { sourceUrl, recovery, sourceSha256: digest(source.bytes), src, sha256, optimized: info });
        return { src, alt: entry.alt, ...(entry.caption ? { caption: entry.caption } : {}), ...info };
      }
      entry.recovery = "missing";
      return null;
    })();
    assets.set(url, promise);
  }
  manifest.get(url).references.add(owner);
  return promise.then((image) => image && { ...image, alt: record.alternativeText || alt || image.alt });
}

async function rewriteBlocks(blocks, owner, target) {
  return (await Promise.all((blocks ?? []).map(async (block) => {
    if (block.type === "image") {
      const image = await resolveMedia(block.image, owner, target, ["large", "medium", "small", "thumbnail"]);
      if (!image) return null;
      return { ...block, image: { ...image, url: image.src, alternativeText: image.alt } };
    }
    if (block.type === "link" && block.url?.includes("/uploads/")) {
      const document = libraryByUrl.get(absolute(block.url));
      if (!document) throw new Error(`Unknown uploaded link: ${owner} ${block.url}`);
      const asset = await resolveMedia(document, owner, target, ["large", "medium", "small", "thumbnail"]);
      if (!asset) return block.children;
      return { ...block, url: asset.src };
    }
    if (block.children) return { ...block, children: await rewriteBlocks(block.children, owner, target) };
    return block;
  }))).filter(Boolean).flat();
}

function readSection(name) {
  const section = home.blocks.find((block) => block.__component === `layout.${name}`);
  if (!section) throw new Error(`Missing homepage section ${name}`);
  return section;
}

const hero = readSection("hero-section");
const projectSection = readSection("projects-section");
const about = readSection("about");
const experience = readSection("experience-section");
const contact = readSection("contact-section");
const projectsById = new Map(projects.map((project) => [project.id, project]));
const visible = new Set(projectSection.projects.map(({ id }) => id));
const projectData = [];

for (const card of projectSection.projects) {
  const project = projectsById.get(card.id);
  if (!project) throw new Error(`Homepage project ${card.id} missing from the published collection`);
  const { id, title, shortDescription, linkToView, linkToCode } = project;
  const slug = slugify(title);
  const target = `/images/projects/${slug}`;
  const owner = `/#projects, ${title}`;
  const [thumbnail, gallery, detail] = await Promise.all([
    resolveMedia(project.thumbnail, `${owner} thumbnail`, target, ["large", "medium", "small", "thumbnail"], title),
    Promise.all((project.images ?? []).map((image) => resolveMedia(image, `${owner} gallery`, target, ["large", "medium", "small", "thumbnail"]))),
    rewriteBlocks(project.detailedDescription, `${owner} dialog`, target),
  ]);
  projectData.push({
    id, slug, title, shortDescription, thumbnail,
    roles: (project.project_categories ?? []).map(({ label }) => label),
    technologies: (project.technologies ?? []).map(({ iconKey, label }) => ({ iconKey, label })),
    detail, gallery: gallery.filter(Boolean), linkToView, linkToCode,
  });
}

const [resume, portrait, aboutDetail, jobs] = await Promise.all([
  resolveMedia(hero.secondaryLink.fileData, "/ résumé", "/downloads/emmanuel-olivo-resume.pdf"),
  resolveMedia(about.image, "/#about portrait", "/images/about", ["large", "medium", "small", "thumbnail"], "Emmanuel Olivo"),
  rewriteBlocks(about.detailedDescription, "/#about body", "/images/about"),
  Promise.all(experience.job.map(async ({ id, title, company, location, startDate, endDate, detailedDescription }) => ({
    id, title, company, location, startDate, endDate,
    detail: await rewriteBlocks(detailedDescription, `/#experience, ${title}`, "/images/experience"),
  }))),
]);
if (!resume) throw new Error("The current résumé is required.");

const data = {
  title: global.title,
  description: global.description,
  navigation: global.header.navigationLink.map(({ label, url }) => ({ label, href: url })),
  sourceLink: global.footer.linkToSource,
  hero: { heading: hero.heading, workLink: { label: hero.primaryLink.label, href: hero.primaryLink.url },
    resumeLink: { label: hero.secondaryLink.label, href: resume.src } },
  work: { title: projectSection.title, subtitle: projectSection.subtitle, projects: projectData },
  experience: { title: experience.title, subtitle: experience.subtitle, jobs },
  about: { title: about.title, detail: aboutDetail, portrait },
  contact: { title: contact.title, subtitle: contact.subtitle, links: Object.entries(contact.socialLinks)
    .filter(([, href]) => href).map(([label, href]) => ({ label, href: label === "email" ? `mailto:${href}` : href })) },
};

await writeJson(resolve("src/content/portfolio.json"), data);
await writeJson(resolve("docs/media-manifest.json"), [...manifest.values()].map(({ references, ...entry }) => ({
  ...entry, references: [...references],
})));
console.log(`Captured ${projects.length} published projects, migrated ${visible.size} homepage projects and ${jobs.length} jobs.`);
console.log(`Public media: ${manifest.size} references, ${[...manifest.values()].filter((entry) => !entry.src).length} unresolved.`);
if (archiveLibrary) {
  const remaining = library.flatMap((record) => [record, ...Object.values(record.formats ?? {})]);
  const report = [];
  for (let offset = 0; offset < remaining.length; offset += 12) {
    report.push(...await Promise.all(remaining.slice(offset, offset + 12).map(async ({ url, mime }) => {
      const sourceUrl = absolute(url);
      const file = await download(sourceUrl, mime);
      return { url: sourceUrl, preserved: Boolean(file), ...(file ? { cacheFile: digest(sourceUrl), sha256: digest(file.bytes) } : {}) };
    })));
  }
  await writeJson(join(snapshot, "media-archive.json"), report);
  console.log(`Private media archive: ${report.filter((entry) => entry.preserved).length}/${report.length} URLs preserved.`);
}
