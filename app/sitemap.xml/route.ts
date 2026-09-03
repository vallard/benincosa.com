import { posts } from "@/lib/posts";

export const dynamic = "force-static";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const base = "https://benincosa.com";
  const entries = [
    { url: base, modified: new Date().toISOString() },
    { url: `${base}/archive`, modified: new Date().toISOString() },
    { url: `${base}/about`, modified: new Date().toISOString() },
    ...posts.map((post) => ({
      url: `${base}/notes/${post.slug}`,
      modified: `${post.modified}Z`,
    })),
  ];
  const body = entries
    .map(
      (entry) =>
        `<url><loc>${escapeXml(entry.url)}</loc><lastmod>${escapeXml(entry.modified)}</lastmod></url>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    },
  );
}
