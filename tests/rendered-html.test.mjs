import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function output(path) {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("exports the finished editorial homepage", async () => {
  const html = await output("index.html");
  assert.match(html, /BENINCOSA/);
  assert.match(html, /Armchair Notes/);
  assert.match(html, /California Housing Market/);
  assert.match(html, /A draft about California housing/);
  assert.match(html, /Recent armchair notes/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps Markdown drafts out of production", async () => {
  const draft = await readFile(
    new URL("../content/notes/california-housing-market-is-a-ponzi-scheme.md", import.meta.url),
    "utf8",
  );
  assert.match(draft, /draft: true/);
  await assert.rejects(
    access(new URL("../out/notes/california-housing-market-is-a-ponzi-scheme/index.html", import.meta.url)),
  );
});

test("exports the real archive and every imported article", async () => {
  const [archive, article] = await Promise.all([
    output("archive/index.html"),
    output("notes/jetson-nano-new-years-eve-ai-fun/index.html"),
  ]);
  assert.match(archive, /SSH/);
  assert.match(article, /Jetson nano New Years Eve AI fun/i);
  assert.match(article, /Person Recognition/);
  assert.match(article, /piper\.download_voices/);

  const posts = JSON.parse(await readFile(new URL("../content/posts.json", import.meta.url), "utf8"));
  await Promise.all(posts.map((post) => access(new URL(`../out/notes/${post.slug}/index.html`, import.meta.url))));
  assert.equal(posts.length, 263);
});

test("publishes RSS, robots, sitemap, and every legacy redirect mapping", async () => {
  const [feed, robots, sitemap, redirects] = await Promise.all([
    output("feed.xml"),
    output("robots.txt"),
    output("sitemap.xml"),
    readFile(new URL("../redirects/nginx-post-ids.map", import.meta.url), "utf8"),
  ]);
  assert.match(feed, /<rss version="2\.0">/);
  assert.match(feed, /Benincosa — Armchair Notes/);
  assert.match(robots, /Sitemap: https:\/\/benincosa\.com\/sitemap\.xml/);
  assert.match(sitemap, /<urlset/);
  assert.equal((redirects.match(/^\s+"\d+"/gm) ?? []).length, 263);
});

test("contains no Sites or WordPress runtime", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /vinext|cloudflare|drizzle|wordpress/i);
  await Promise.all([
    assert.rejects(access(new URL("../.openai/hosting.json", projectRoot))),
    assert.rejects(access(new URL("../vite.config.ts", projectRoot))),
    assert.rejects(access(new URL("../worker", projectRoot))),
  ]);
});
