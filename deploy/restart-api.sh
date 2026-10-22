#!/bin/bash
set -euo pipefail
# The application loads this owner-managed file with dotenv; never print or source it.
image="${1:-$(docker inspect --format '{{.Config.Image}}' tranhtrap-api)}"
previous="$(docker inspect --format '{{.Config.Image}}' tranhtrap-api 2>/dev/null || true)"
docker rm -f tranhtrap-api >/dev/null 2>&1 || true
start_api() {
  docker run -d --name tranhtrap-api --restart unless-stopped \
    --network tranhtrap --publish 127.0.0.1:4000:4000 \
    --mount type=bind,source=/opt/tranhtrap/shared/.env,target=/app/server/.env,readonly \
    --env NODE_ENV=production --env PORT=4000 --env TRUST_PROXY_HOPS=1 \
    --env CLIENT_ORIGIN=https://tranhtrap.com.vn \
    --env MONGODB_URI=mongodb://tranhtrap-mongo:27017/tranh_trap_web \
    --memory 320m --memory-swap 640m --cpus 0.75 --pids-limit 100 \
    --read-only --tmpfs /tmp:rw,noexec,nosuid,size=32m \
    --cap-drop ALL --security-opt no-new-privileges:true \
    --log-opt max-size=10m --log-opt max-file=3 "$1" >/dev/null
}
start_api "$image"
for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:4000/api/v1/health >/dev/null; then echo 'API healthy'; exit 0; fi
  sleep 2
done
if [[ -n "$previous" && "$previous" != "$image" ]]; then
  docker rm -f tranhtrap-api >/dev/null
  start_api "$previous"
fi
echo 'API health check failed; previous image restored when available' >&2
exit 1
