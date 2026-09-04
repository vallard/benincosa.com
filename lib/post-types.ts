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
  source?: "wordpress" | "markdown";
  draft?: boolean;
};

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
