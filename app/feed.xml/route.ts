import { posts } from "@/lib/posts";

const BASE_URL = "https://benincosa.com";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = posts.slice(0, 50).map((post) => {
    const url = `${BASE_URL}/notes/${post.slug}`;
    return `<item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${post.date}Z`).toUTCString()}</pubDate>
      <category>${escapeXml(post.section)}</category>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Benincosa — Armchair Notes</title>
      <link>${BASE_URL}</link>
      <description>An old man’s take on tech, systems, and trying to make sense of the world.</description>
      <language>en-us</language>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
