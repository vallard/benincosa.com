import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import TurndownService from "turndown";
import legacyPosts from "../content/posts.json" with { type: "json" };

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptsDirectory, "..");
const notesDirectory = path.join(projectDirectory, "content", "notes");
const slug = process.argv[2] ?? "";
const printOnly = process.argv.includes("--stdout");
const post = legacyPosts.find((candidate) => candidate.slug === slug);

if (!post) {
  console.error(`No imported WordPress post found with slug '${slug}'.`);
  process.exit(1);
}

const turndown = new TurndownService({
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "_",
  headingStyle: "atx",
});
turndown.keep(["iframe", "video", "audio"]);

const markdown = turndown.turndown(post.content).trim();
const today = new Intl.DateTimeFormat("sv-SE", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Los_Angeles",
  year: "numeric",
}).format(new Date());
const output = matter.stringify(`${markdown}\n`, {
  title: post.title,
  slug: post.slug,
  date: post.date.slice(0, 10),
  modified: today,
  section: post.section,
  excerpt: post.excerpt,
  draft: true,
  featured: false,
  tags: post.tags.map((tag) => tag.name),
});

if (printOnly) {
  process.stdout.write(output);
  process.exit(0);
}

const outputPath = path.join(notesDirectory, `${post.slug}.md`);
if (existsSync(outputPath)) {
  console.error(`Markdown override already exists: ${outputPath}`);
  process.exit(1);
}

mkdirSync(notesDirectory, { recursive: true });
writeFileSync(outputPath, output);
console.log(`Created ${path.relative(projectDirectory, outputPath)} from the WordPress version.`);
console.log("The override is a draft: local preview uses it, while production keeps the original.");
console.log("Change draft to false, then run make deploy when the edit is ready.");
