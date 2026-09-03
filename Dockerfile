FROM nginx:1.25-alpine

COPY deploy/container-nginx.conf /etc/nginx/conf.d/default.conf
COPY redirects/nginx-post-ids.map /etc/nginx/conf.d/00-legacy-posts.conf
COPY out/ /usr/share/nginx/html/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/_health || exit 1
