export const dynamic = "force-static";

export function GET() {
  return new Response(
    "User-agent: *\nAllow: /\nSitemap: https://benincosa.com/sitemap.xml\n",
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}
