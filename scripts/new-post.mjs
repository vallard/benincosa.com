import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptsDirectory, "..");
const notesDirectory = path.join(projectDirectory, "content", "notes");
const slug = process.argv[2] ?? "";
const suppliedTitle = process.argv.slice(3).join(" ").trim();

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("Usage: make new-post SLUG=my-post TITLE=\"My Post\"");
  console.error("SLUG must contain lowercase letters, numbers, and hyphens only.");
  process.exit(1);
}

const title = suppliedTitle || slug
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");
const today = new Intl.DateTimeFormat("sv-SE", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Los_Angeles",
  year: "numeric",
}).format(new Date());
const outputPath = path.join(notesDirectory, `${slug}.md`);

if (existsSync(outputPath)) {
  console.error(`Post already exists: ${outputPath}`);
  process.exit(1);
}

mkdirSync(notesDirectory, { recursive: true });
const file = `---
title: ${JSON.stringify(title)}
slug: ${JSON.stringify(slug)}
date: ${JSON.stringify(today)}
modified: ${JSON.stringify(today)}
section: "Technology"
excerpt: "Replace this with a one-sentence summary."
draft: true
featured: false
tags: []
---

<!-- Write the post here. This comment is invisible on the rendered page. -->
`;

writeFileSync(outputPath, file);
console.log(`Created ${path.relative(projectDirectory, outputPath)}`);
console.log(`Preview at http://localhost:3000/notes/${slug}/ after running make dev.`);
console.log("Change draft to false, then run make deploy when it is ready.");
