#!/usr/bin/env bash
set -euo pipefail

BACKUP_ROOT="/opt/truckflow/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
STAGING_DIR="${BACKUP_ROOT}/truckflow-${TIMESTAMP}"
ARCHIVE_PATH="${BACKUP_ROOT}/truckflow-${TIMESTAMP}.tar.gz"
LOG_FILE="${BACKUP_ROOT}/backup.log"

log() {
  printf '[%s] %s\n' "$(date -Is)" "$*" >> "$LOG_FILE"
}

copy_if_exists() {
  local source="$1"
  local destination="$2"

  if [ -f "$source" ]; then
    mkdir -p "$(dirname "$destination")"
    cp -p "$source" "$destination"
    log "Copied ${source}"
  else
    log "Skipped missing ${source}"
  fi
}

mkdir -p "$STAGING_DIR"

copy_if_exists "/opt/truckflow/backend/data/leads.json" "${STAGING_DIR}/opt/truckflow/backend/data/leads.json"
copy_if_exists "/opt/truckflow/backend/data/reports.json" "${STAGING_DIR}/opt/truckflow/backend/data/reports.json"
copy_if_exists "/opt/truckflow/backend/data/truckflow.db" "${STAGING_DIR}/opt/truckflow/backend/data/truckflow.db"
copy_if_exists "/opt/truckflow/backend/data/truckflow.db-wal" "${STAGING_DIR}/opt/truckflow/backend/data/truckflow.db-wal"
copy_if_exists "/opt/truckflow/backend/data/truckflow.db-shm" "${STAGING_DIR}/opt/truckflow/backend/data/truckflow.db-shm"
copy_if_exists "/opt/truckflow/backend/.env" "${STAGING_DIR}/opt/truckflow/backend/.env"
copy_if_exists "/opt/truckflow/frontend/.env.local" "${STAGING_DIR}/opt/truckflow/frontend/.env.local"
copy_if_exists "/etc/nginx/sites-available/truckflow" "${STAGING_DIR}/etc/nginx/sites-available/truckflow"
copy_if_exists "/etc/cloudflared/config.yml" "${STAGING_DIR}/etc/cloudflared/config.yml"

mkdir -p "${STAGING_DIR}/pm2"
if command -v pm2 >/dev/null 2>&1; then
  pm2 jlist > "${STAGING_DIR}/pm2/pm2-jlist.json"
  pm2 list > "${STAGING_DIR}/pm2/pm2-list.txt" || true
  log "Saved PM2 process list"
else
  log "Skipped PM2 process list: pm2 missing"
fi

tar -C "$BACKUP_ROOT" -czf "$ARCHIVE_PATH" "$(basename "$STAGING_DIR")"
rm -rf "$STAGING_DIR"

find "$BACKUP_ROOT" -maxdepth 1 -name 'truckflow-*.tar.gz' -type f -printf '%T@ %p\n' \
  | sort -nr \
  | awk 'NR>14 {print $2}' \
  | while read -r old_backup; do
      rm -f "$old_backup"
      log "Removed old backup ${old_backup}"
    done

log "Created backup ${ARCHIVE_PATH}"
printf '%s\n' "$ARCHIVE_PATH"
