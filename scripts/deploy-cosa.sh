#!/usr/bin/env bash
set -Eeuo pipefail

project_dir=$(cd "$(dirname "$0")/.." && pwd)
cd "$project_dir"

deployment_host=${DEPLOY_HOST:-cosa}
deployment_root=/opt/benincosa-armchair
git_revision=$(git rev-parse --short HEAD)
release_id=${RELEASE_ID:-$(date -u +%Y%m%d%H%M%S)-${git_revision}}

case "$release_id" in
  *[!A-Za-z0-9._-]*)
    echo "Invalid release id: $release_id" >&2
    exit 1
    ;;
esac

if [[ ! -f out/index.html ]]; then
  echo "Static export not found. Run 'make check' first." >&2
  exit 1
fi

deployment_tmp_dir=$(mktemp -d "${TMPDIR:-/tmp}/benincosa-deploy.XXXXXX")
deployment_archive="$deployment_tmp_dir/release.tgz"
cleanup() {
  rm -rf "$deployment_tmp_dir"
}
trap cleanup EXIT

echo "Packaging release $release_id"
COPYFILE_DISABLE=1 tar --no-xattrs -czf "$deployment_archive" \
  Dockerfile \
  out \
  deploy/container-nginx.conf \
  deploy/host-nginx.conf \
  redirects/nginx-post-ids.map \
  scripts/remote-deploy-cosa.sh

remote_release="$deployment_root/releases/$release_id"
echo "Transferring release to $deployment_host:$remote_release"
ssh "$deployment_host" "mkdir -p '$remote_release'"
ssh "$deployment_host" "tar --warning=no-unknown-keyword -xzf - -C '$remote_release'" < "$deployment_archive"

echo "Activating release on $deployment_host"
ssh "$deployment_host" "bash '$remote_release/scripts/remote-deploy-cosa.sh' '$release_id'"

echo "Production deployment complete: https://benincosa.com/"
