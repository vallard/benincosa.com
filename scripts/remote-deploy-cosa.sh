#!/usr/bin/env bash
set -Eeuo pipefail

release_id=${1:?release id is required}
deployment_root=/opt/benincosa-armchair
release_dir="$deployment_root/releases/$release_id"
container_name=benincosa-armchair
image_tag="benincosa-armchair-notes:$release_id"
container_port=8088
nginx_config=/etc/nginx/sites-available/default
nginx_backup="${nginx_config}.pre-${release_id}"

if [[ $(id -u) -ne 0 ]]; then
  echo "Remote deployment must run as root." >&2
  exit 1
fi

for required_file in \
  Dockerfile \
  out/index.html \
  deploy/container-nginx.conf \
  deploy/host-nginx.conf \
  redirects/nginx-post-ids.map; do
  if [[ ! -f "$release_dir/$required_file" ]]; then
    echo "Missing release file: $required_file" >&2
    exit 1
  fi
done

echo "Building $image_tag"
docker build -t "$image_tag" "$release_dir"

old_image=""
if docker inspect "$container_name" >/dev/null 2>&1; then
  old_image=$(docker inspect --format '{{.Config.Image}}' "$container_name")
fi

cp -a "$nginx_config" "$nginx_backup"

rollback() {
  failure_status=$?
  trap - ERR
  set +e
  echo "Deployment failed; restoring the previous container and Nginx configuration." >&2
  cp "$nginx_backup" "$nginx_config"
  docker rm -f "$container_name" >/dev/null 2>&1
  if [[ -n "$old_image" ]]; then
    docker run -d \
      --name "$container_name" \
      --restart unless-stopped \
      -p "127.0.0.1:${container_port}:80" \
      "$old_image" >/dev/null
  fi
  nginx -t && systemctl reload nginx
  exit "$failure_status"
}
trap rollback ERR

if docker inspect "$container_name" >/dev/null 2>&1; then
  docker rm -f "$container_name" >/dev/null
fi

docker run -d \
  --name "$container_name" \
  --restart unless-stopped \
  -p "127.0.0.1:${container_port}:80" \
  "$image_tag" >/dev/null

container_ready=0
for attempt in {1..20}; do
  if curl -fsS "http://127.0.0.1:${container_port}/_health" >/dev/null; then
    container_ready=1
    break
  fi
  sleep 1
done

if [[ "$container_ready" -ne 1 ]]; then
  echo "The new container did not become healthy." >&2
  false
fi

container_home=$(curl -fsS -H 'Host: benincosa.com' "http://127.0.0.1:${container_port}/")
if [[ "$container_home" != *'Armchair Notes'* ]]; then
  echo "The new container returned unexpected homepage content." >&2
  false
fi

cp "$release_dir/deploy/host-nginx.conf" "$nginx_config"
nginx -t
systemctl reload nginx

public_home=$(curl -fsS --retry 5 --retry-delay 1 https://benincosa.com/)
if [[ "$public_home" != *'Armchair Notes'* ]]; then
  echo "The public homepage returned unexpected content." >&2
  false
fi

public_archive=$(curl -fsS --retry 5 --retry-delay 1 https://benincosa.com/archive/)
if [[ "$public_archive" != *'Every armchair note since 2009'* ]]; then
  echo "The public archive returned unexpected content." >&2
  false
fi

legacy_location=$(curl -fsSI 'https://benincosa.com/?p=3881' | tr -d '\r' | awk 'tolower($1) == "location:" { print $2 }')
if [[ "$legacy_location" != /notes/* ]]; then
  echo "Legacy redirect validation failed: $legacy_location" >&2
  false
fi

for private_path in token.tok tp.zip IP2LOCATION-LITE-DB11.BIN.ZIP wp-login.php; do
  response_code=$(curl -sS -o /dev/null -w '%{http_code}' "https://benincosa.com/$private_path")
  if [[ "$response_code" != 404 ]]; then
    echo "Expected /$private_path to return 404, got $response_code" >&2
    false
  fi
done

ln -sfn "releases/$release_id" "$deployment_root/current"
trap - ERR

echo "Activated $image_tag"
docker ps --filter "name=$container_name" --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
