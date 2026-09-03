import rawPosts from "@/content/posts.json";

export type Section = "Technology" | "Society & Place" | "Life & Experiments";

export type Term = {
  id: number;
  name: string;
  slug: string;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  date: string;
  modified: string;
  oldUrl: string;
  excerpt: string;
  content: string;
  categories: Term[];
  tags: Term[];
  section: Section;
};

export type TableOfContentsItem = {
  id: string;
  label: string;
  level: 2 | 3;
};

export const posts = rawPosts as Post[];

export const sectionSlugs: Record<Section, string> = {
  Technology: "technology",
  "Society & Place": "society-place",
  "Life & Experiments": "life-experiments",
};

export const sections = Object.keys(sectionSlugs) as Section[];

export function sectionFromSlug(value?: string): Section | undefined {
  return sections.find((section) => sectionSlugs[section] === value);
}

export function formatDate(value: string, style: "long" | "short" = "long") {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

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
