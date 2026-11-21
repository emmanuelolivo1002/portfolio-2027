import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const includeDrafts = process.argv.includes("--include-drafts");
const token = process.env.STRAPI_READ_TOKEN;
const origin = new URL(process.env.STRAPI_ORIGIN || "https://adminv2.emmanuelolivo.com");
const timestamp = new Date().toISOString().replaceAll(":", "-");
const destination = resolve(".migration-private", `${includeDrafts ? "drafts" : "public"}-${timestamp}`);

if (includeDrafts && !token) throw new Error("Draft capture requires STRAPI_READ_TOKEN.");
if (origin.protocol !== "https:" && token) throw new Error("API tokens require HTTPS.");

const projectPopulate = ["project_categories", "technologies", "thumbnail", "images"];
const homePopulate = {
  blocks: {
    populate: {
      primaryLink: { populate: ["fileData"] },
      secondaryLink: { populate: ["fileData"] },
      job: true,
      image: true,
      projects: { populate: ["project_categories", "technologies", "thumbnail"] },
    },
  },
};

function appendParams(params, values, prefix) {
  for (const [key, value] of Object.entries(values)) {
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object") appendParams(params, value, name);
    else params.set(name, String(value));
  }
}

async function get(endpoint, query = {}) {
  const url = new URL(`/api/${endpoint}`, origin);
  appendParams(url.searchParams, query);
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${endpoint}: HTTP ${response.status}`);
  return response.json();
}

async function collect(endpoint, query, allowBareArray = false) {
  const records = [];
  let page = 1;
  let expectedTotal;
  let pageCount;
  do {
    const result = await get(endpoint, { ...query, pagination: { page, pageSize: 100 } });
    if (allowBareArray && Array.isArray(result) && page === 1) return result;
    const pagination = result.meta?.pagination;
    if (!pagination || pagination.page !== page || !Array.isArray(result.data)) {
      throw new Error(`${endpoint}: unexpected pagination response`);
    }
    expectedTotal ??= pagination.total;
    pageCount ??= pagination.pageCount;
    if (pagination.total !== expectedTotal || pagination.pageCount !== pageCount) {
      throw new Error(`${endpoint}: records changed during capture, rerun it`);
    }
    records.push(...result.data);
    page += 1;
  } while (page <= pageCount);

  if (records.length !== expectedTotal || new Set(records.map(({ id }) => id)).size !== expectedTotal) {
    throw new Error(`${endpoint}: captured records do not reconcile with the reported total`);
  }
  return records;
}

async function save(name, value) {
  await writeFile(resolve(destination, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, {
    flag: "wx",
    mode: 0o600,
  });
}

const state = { publicationState: includeDrafts ? "preview" : "live" };
const tasks = [
  ["home", () => get("home-page", { ...state, populate: homePopulate }).then(({ data }) => data)],
  ["global", () => get("global", { ...state, populate: ["header.navigationLink", "footer"] }).then(({ data }) => data)],
  ["projects", () => collect("projects", { ...state, populate: projectPopulate, sort: ["id:asc"] })],
  ["project-categories", () => collect("project-categories", { ...state, sort: ["id:asc"] })],
  ["technologies", () => collect("technologies", { ...state, sort: ["id:asc"] })],
  ["media-library", () => collect("upload/files", { sort: ["id:asc"] }, true)],
  ["locales", () => get("i18n/locales").then((response) => response.data ?? response)],
];

await mkdir(destination, { recursive: true, mode: 0o700 });
const results = await Promise.all(tasks.map(async ([name, load]) => {
  try {
    const value = await load();
    if (!value) throw new Error(`${name}: no record returned`);
    await save(name, value);
    return { name, count: Array.isArray(value) ? value.length : 1 };
  } catch (error) {
    return { name, error: error.message };
  }
}));
await save("capture", { origin: origin.origin, timestamp, includeDrafts, results });
console.log(destination);
for (const { name, count, error } of results) console.log(`${name}: ${error ?? count}`);
if (results.some(({ name, error }) => error && ["home", "global", "projects"].includes(name))) process.exitCode = 1;
