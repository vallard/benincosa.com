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
make check
```

This creates the static site in `out/` and validates the homepage, archive, an imported article, RSS, robots, sitemap, redirect map, and removal of the old Sites starter.

To preview the exact static output:

```sh
npm start
```

## Content

The 263 imported WordPress posts remain in `content/posts.json`. New writing and edited-post overrides live as individual Markdown files in `content/notes/`.

### Write a new post

```sh
make new-post SLUG=my-new-post TITLE="My New Post"
make dev
```

Open `http://localhost:3000/notes/my-new-post/` to preview it. New files start with `draft: true`; drafts are available during local development but are excluded from production builds, the archive, RSS, and the sitemap. Edit the Markdown, choose one of the three valid sections, replace the excerpt, and set `draft: false` when it is ready.

To publish:

```sh
make deploy
```

### Edit an imported post

Find the existing slug in its URL or the archive, then run:

```sh
make edit-post SLUG=jetson-nano-new-years-eve-ai-fun
```

This converts the imported HTML into a Markdown override with the same slug. It starts as a draft, so local development shows the edited version while production continues serving the original WordPress import. Set `draft: false` and deploy when the replacement is ready. Removing the override restores the imported version on the next build.

The homepage feature is controlled by the one Markdown file with `featured: true`. The current housing draft is `content/notes/california-housing-market-is-a-ponzi-scheme.md`.

### Re-import WordPress

The importer can be run on the WordPress server with:

```sh
wp eval-file scripts/export-wordpress.php > content/posts.json
npm run redirects:generate
```

The Nginx redirect map preserves every old `?p=123` post URL.

## Production image

```sh
make check
docker build -t benincosa-armchair-notes .
docker run --rm -p 8088:80 benincosa-armchair-notes
```

The container serves the already-built static export and handles the legacy post-ID redirects. In production it listens only on the server loopback interface; the host Nginx terminates HTTPS and proxies to it.

## Deploy to production

The complete production workflow is one command:

```sh
make deploy
```

It installs from the lockfile using the local npm cache when possible, runs lint and the full exported-site test suite, creates a versioned release, transfers it over `ssh cosa`, builds the Nginx image on the server, replaces the production container, validates public routes and legacy redirects, and reloads the host Nginx configuration. If activation fails, the remote script restores the previous container image and Nginx configuration.

Useful operational commands:

```sh
make status
make logs
```

Versioned releases are stored under `/opt/benincosa-armchair/releases/`, and `/opt/benincosa-armchair/current` points to the active release.
