# Benincosa — Armchair Notes

The source for [benincosa.com](https://benincosa.com): a static editorial blog containing the complete imported WordPress archive and no production database.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Plain CSS for the design system
- Static export to `out/`
- Nginx in Docker for production serving
- The existing host Nginx for TLS and reverse proxying

The production container has no Node.js process, PHP runtime, or database. Next.js is used only at build time; the Docker image contains only Nginx and the generated `out/` directory.

## Local development

```sh
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build and verify

```sh
npm test
```

This creates the static site in `out/` and validates the homepage, archive, an imported article, RSS, robots, sitemap, redirect map, and removal of the old Sites starter.

To preview the exact static output:

```sh
npm start
```

## Content

`content/posts.json` contains all 263 posts imported from WordPress. The importer can be run on the WordPress server with:

```sh
wp eval-file scripts/export-wordpress.php > content/posts.json
npm run redirects:generate
```

The Nginx redirect map preserves every old `?p=123` post URL.

## Production image

```sh
npm test
docker build -t benincosa-armchair-notes .
docker run --rm -p 8088:80 benincosa-armchair-notes
```

The container serves the already-built static export and handles the legacy post-ID redirects. In production it listens only on the server loopback interface; the host Nginx terminates HTTPS and proxies to it.
