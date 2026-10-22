#!/bin/bash
set -euo pipefail
release="${1:?Release name required}"
[[ "$release" =~ ^release-[0-9TZ-]+$ ]] || exit 2
root="/opt/tranhtrap/releases/$release"
test -s "$root/client/dist/index.html"
docker build -f "$root/deploy/Dockerfile" -t "tranhtrap-api:$release" "$root"
install -d -m 700 -o ec2-user -g ec2-user /opt/tranhtrap/shared
if [[ ! -e /opt/tranhtrap/shared/.env ]]; then
  install -m 600 -o ec2-user -g ec2-user "$root/server/.env.example" /opt/tranhtrap/shared/.env
fi
docker network inspect tranhtrap >/dev/null 2>&1 || docker network create tranhtrap >/dev/null
docker volume inspect tranhtrap-mongo-data >/dev/null 2>&1 || docker volume create tranhtrap-mongo-data >/dev/null
if ! docker container inspect tranhtrap-mongo >/dev/null 2>&1; then
  docker run -d --name tranhtrap-mongo --restart unless-stopped --network tranhtrap \
    --mount source=tranhtrap-mongo-data,target=/data/db \
    --memory 384m --memory-swap 768m --cpus 0.75 --pids-limit 150 \
    --log-opt max-size=10m --log-opt max-file=3 \
    mongo:7 --wiredTigerCacheSizeGB 0.25 --bind_ip_all >/dev/null
fi
install -m 755 "$root/deploy/restart-api.sh" /usr/local/sbin/tranhtrap-restart
install -m 755 "$root/deploy/backup.sh" /usr/local/sbin/tranhtrap-backup
/usr/local/sbin/tranhtrap-restart "tranhtrap-api:$release"
previous="$(readlink -f /var/www/tranhtrap/current || true)"
if [[ -n "$previous" && -d "$previous" ]]; then ln -sfn "$previous" /var/www/tranhtrap/previous; fi
ln -sfn "$root/client/dist" /var/www/tranhtrap/current
if [[ ! -e /etc/nginx/conf.d/tranhtrap.conf ]]; then
  install -m 644 "$root/deploy/nginx.conf" /etc/nginx/conf.d/tranhtrap.conf
fi
nginx -t
systemctl enable --now nginx
systemctl reload nginx
echo "Release installed: $release"
