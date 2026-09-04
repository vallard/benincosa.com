SHELL := /bin/bash
.DEFAULT_GOAL := help
NPM_CI := npm ci --prefer-offline --no-audit --no-fund

.PHONY: help dev build check deploy status logs

help:
	@printf '%s\n' \
		'make dev      Start the local Next.js development server' \
		'make build    Install dependencies and build the static site' \
		'make check    Run lint, build, and the exported-site tests' \
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

deploy:
	$(NPM_CI)
	npm run lint
	npm test
	./scripts/deploy-cosa.sh

status:
	@ssh cosa 'docker ps --filter name=benincosa-armchair --format "{{.Names}} {{.Image}} {{.Status}} {{.Ports}}"; curl -fsS -o /dev/null -w "https://benincosa.com/ -> %{http_code}\n" https://benincosa.com/'

logs:
	@ssh cosa 'docker logs --tail 100 benincosa-armchair'
