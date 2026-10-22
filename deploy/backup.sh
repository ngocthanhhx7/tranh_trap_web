#!/bin/bash
set -euo pipefail
umask 077
destination="/var/lib/tranhtrap-backups/$(date -u +%Y%m%dT%H%M%SZ).archive.gz"
docker exec tranhtrap-mongo mongodump --db tranh_trap_web --archive --gzip > "$destination.partial"
mv "$destination.partial" "$destination"
find /var/lib/tranhtrap-backups -maxdepth 1 -type f -name '*.archive.gz' -mtime +7 -delete
