import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import rawPosts from "@/content/posts.json";
import {
  formatDate,
  sectionFromSlug,
  sectionSlugs,
  sections,
  type Post,
  type Section,
  type Term,
} from "@/lib/post-types";

export {
  formatDate,
  sectionFromSlug,
  sectionSlugs,
  sections,
  type Post,
  type Section,
  type Term,
};

export type TableOfContentsItem = {
  id: string;
  label: string;
  level: 2 | 3;
};

export type FeaturedNote = {
  slug: string;
  title: string;
  date: string;
  section: Section;
  excerpt: string;
  draft: boolean;
  issue: string;
  description: string;
  status: string;
};

type MarkdownFrontmatter = {
  title?: unknown;
  slug?: unknown;
  date?: unknown;
  modified?: unknown;
  section?: unknown;
  excerpt?: unknown;
  draft?: unknown;
  featured?: unknown;
  featureIssue?: unknown;
  featureDescription?: unknown;
  featureStatus?: unknown;
  tags?: unknown;
};

type MarkdownNote = {
  post: Post;
  featured: boolean;
  featureIssue: string;
  featureDescription: string;
  featureStatus: string;
};

const legacyPosts = (rawPosts as Post[]).map((post) => ({
  ...post,
  source: "wordpress" as const,
}));
const legacyBySlug = new Map(legacyPosts.map((post) => [post.slug, post]));
const notesDirectory = path.join(process.cwd(), "content", "notes");

function requiredText(value: unknown, field: string, filename: string, fallback?: string) {
  const resolved = typeof value === "string" && value.trim() ? value.trim() : fallback;
  if (!resolved) throw new Error(`${filename}: frontmatter field '${field}' is required.`);
  return resolved;
}

function dateText(value: unknown, field: string, filename: string, fallback?: string) {
  const resolved = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : requiredText(value, field, filename, fallback);
  if (!/^\d{4}-\d{2}-\d{2}(?:[T ][^\s]+)?$/.test(resolved)) {
    throw new Error(`${filename}: '${field}' must begin with YYYY-MM-DD.`);
  }
  return resolved;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stableNumber(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash || 1);
}

function termFromName(name: string): Term {
  return { id: stableNumber(`term:${name}`), name, slug: slugify(name) };
}

function tagsFromFrontmatter(value: unknown, fallback: Term[]) {
  if (value === undefined) return fallback;
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string")) {
    throw new Error("The 'tags' frontmatter field must be a list of strings.");
  }
  return value.map((tag) => termFromName(tag));
}

function loadMarkdownNote(filename: string): MarkdownNote {
  const filePath = path.join(notesDirectory, filename);
  const parsed = matter(readFileSync(filePath, "utf8"));
  const data = parsed.data as MarkdownFrontmatter;
  const filenameSlug = filename.replace(/\.md$/i, "");
  const slug = requiredText(data.slug, "slug", filename, filenameSlug);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${filename}: slug must contain lowercase letters, numbers, and hyphens only.`);
  }

  const legacy = legacyBySlug.get(slug);
  const title = requiredText(data.title, "title", filename, legacy?.title);
  const date = dateText(data.date, "date", filename, legacy?.date);
  const modified = dateText(data.modified, "modified", filename, date);
  const excerpt = requiredText(data.excerpt, "excerpt", filename, legacy?.excerpt);
  const sectionValue = requiredText(data.section, "section", filename, legacy?.section ?? "Technology");

  if (!sections.includes(sectionValue as Section)) {
    throw new Error(`${filename}: section must be one of ${sections.join(", ")}.`);
  }

  const section = sectionValue as Section;
  const draft = data.draft === true;
  const markdownBody = parsed.content.trim();
  if (!draft && !markdownBody) {
    throw new Error(`${filename}: published posts must have a body.`);
  }

  const content = marked.parse(markdownBody, { async: false, gfm: true }) as string;
  const post: Post = {
    id: legacy?.id ?? -stableNumber(`post:${slug}`),
    slug,
    title,
    date,
    modified,
    oldUrl: legacy?.oldUrl ?? `https://benincosa.com/notes/${slug}/`,
    excerpt,
    content,
    categories: legacy?.categories ?? [termFromName(section)],
    tags: tagsFromFrontmatter(data.tags, legacy?.tags ?? []),
    section,
    source: "markdown",
    draft,
  };

  return {
    post,
    featured: data.featured === true,
    featureIssue: typeof data.featureIssue === "string" ? data.featureIssue : "01",
    featureDescription: typeof data.featureDescription === "string"
      ? data.featureDescription
      : `A note about ${section.toLowerCase()}`,
    featureStatus: typeof data.featureStatus === "string"
      ? data.featureStatus
      : draft ? "A draft in progress" : "Featured note",
  };
}

const markdownNotes = existsSync(notesDirectory)
  ? readdirSync(notesDirectory)
      .filter((filename) => filename.endsWith(".md"))
      .sort()
      .map(loadMarkdownNote)
  : [];

const featureCandidates = markdownNotes.filter((note) => note.featured);
if (featureCandidates.length > 1) {
  throw new Error("Only one Markdown note may set 'featured: true'.");
}

const includeDrafts = process.env.NODE_ENV !== "production";
const activeMarkdown = markdownNotes.filter((note) => includeDrafts || !note.post.draft);
const activeBySlug = new Map(activeMarkdown.map((note) => [note.post.slug, note.post]));
const combinedPosts = legacyPosts.map((post) => activeBySlug.get(post.slug) ?? post);

for (const note of activeMarkdown) {
  if (!legacyBySlug.has(note.post.slug)) combinedPosts.push(note.post);
}

export const posts = combinedPosts.sort((left, right) =>
  right.date.localeCompare(left.date) || right.id - left.id,
);

const feature = featureCandidates[0];
export const featuredNote: FeaturedNote = feature
  ? {
      slug: feature.post.slug,
      title: feature.post.title,
      date: feature.post.date,
      section: feature.post.section,
      excerpt: feature.post.excerpt,
      draft: Boolean(feature.post.draft),
      issue: feature.featureIssue,
      description: feature.featureDescription,
      status: feature.featureStatus,
    }
  : {
      slug: "",
      title: "Armchair Notes",
      date: new Date().toISOString().slice(0, 10),
      section: "Life & Experiments",
      excerpt: "Technology, systems, and an attempt to make sense of the world.",
      draft: true,
      issue: "01",
      description: "Notes from the armchair",
      status: "More soon",
    };

export function readingMinutes(post: Post) {
  const words = post.content
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 225));
}

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function findPost(titleFragment: string) {
  const needle = titleFragment.toLowerCase();
  return posts.find((post) => post.title.toLowerCase().includes(needle));
}

export function relatedPosts(post: Post, limit = 3) {
  const categoryIds = new Set(post.categories.map((term) => term.id));
  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      post: candidate,
      score:
        (candidate.section === post.section ? 2 : 0) +
        candidate.categories.filter((term) => categoryIds.has(term.id)).length * 3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

function slugifyHeading(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&[^;]+;/g, " ")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

export function preparePostContent(post: Post) {
  const headings: TableOfContentsItem[] = [];
  const used = new Map<string, number>();
  const html = post.content.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelValue: string, attributes: string, inner: string) => {
      const level = Number(levelValue) as 2 | 3;
      const label = inner.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
      const base = slugifyHeading(label);
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      headings.push({ id, label, level });
      const cleanAttributes = attributes.replace(/\sid=("[^"]*"|'[^']*')/i, "");
      return `<h${level}${cleanAttributes} id="${id}">${inner}</h${level}>`;
    },
  );
  return { html, headings };
}

export function postIsHistorical(post: Post) {
  return new Date().getUTCFullYear() - Number(post.date.slice(0, 4)) >= 5;
}
