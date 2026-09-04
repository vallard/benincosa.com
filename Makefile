SHELL := /bin/bash
.DEFAULT_GOAL := help
NPM_CI := npm ci --prefer-offline --no-audit --no-fund

.PHONY: help dev build check new-post edit-post deploy status logs

help:
	@printf '%s\n' \
		'make dev      Start the local Next.js development server' \
		'make build    Install dependencies and build the static site' \
		'make check    Run lint, build, and the exported-site tests' \
		'make new-post SLUG=my-post TITLE="My Post"' \
		'make edit-post SLUG=existing-post-slug' \
		'make deploy   Verify everything and deploy production over ssh cosa' \
		'make status   Show the production container and public HTTP status' \
		'make logs     Show the latest production container logs'

dev:
	npm run dev

build:
	$(NPM_CI)
	npm run build

check:
	$(NPM_CI)
	npm run lint
	npm test

new-post:
	@node scripts/new-post.mjs "$(SLUG)" "$(TITLE)"

edit-post:
	@node scripts/edit-post.mjs "$(SLUG)"

deploy:
	$(NPM_CI)
	npm run lint
	npm test
	./scripts/deploy-cosa.sh

status:
	@ssh cosa 'docker ps --filter name=benincosa-armchair --format "{{.Names}} {{.Image}} {{.Status}} {{.Ports}}"; curl -fsS -o /dev/null -w "https://benincosa.com/ -> %{http_code}\n" https://benincosa.com/'

logs:
	@ssh cosa 'docker logs --tail 100 benincosa-armchair'
