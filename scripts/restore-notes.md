# TruckFlow Restore Notes

Backups live in:

```bash
/opt/truckflow/backups
```

Each archive is named:

```bash
truckflow-YYYYMMDD-HHMMSS.tar.gz
```

## Inspect A Backup

```bash
cd /opt/truckflow/backups
tar -tzf truckflow-YYYYMMDD-HHMMSS.tar.gz
```

## Extract A Backup

Extract into a temporary restore folder first:

```bash
mkdir -p /tmp/truckflow-restore
tar -xzf /opt/truckflow/backups/truckflow-YYYYMMDD-HHMMSS.tar.gz -C /tmp/truckflow-restore
```

The archive contains paths under a timestamped folder, such as:

```bash
/tmp/truckflow-restore/truckflow-YYYYMMDD-HHMMSS/opt/truckflow/backend/data/leads.json
```

## Restore Runtime Data

```bash
cp /tmp/truckflow-restore/truckflow-YYYYMMDD-HHMMSS/opt/truckflow/backend/data/leads.json /opt/truckflow/backend/data/leads.json
cp /tmp/truckflow-restore/truckflow-YYYYMMDD-HHMMSS/opt/truckflow/backend/data/reports.json /opt/truckflow/backend/data/reports.json
chown chancesr:chancesr /opt/truckflow/backend/data/leads.json /opt/truckflow/backend/data/reports.json
```

## Restore Env Files

```bash
cp /tmp/truckflow-restore/truckflow-YYYYMMDD-HHMMSS/opt/truckflow/backend/.env /opt/truckflow/backend/.env
cp /tmp/truckflow-restore/truckflow-YYYYMMDD-HHMMSS/opt/truckflow/frontend/.env.local /opt/truckflow/frontend/.env.local
chown chancesr:chancesr /opt/truckflow/backend/.env /opt/truckflow/frontend/.env.local
chmod 600 /opt/truckflow/backend/.env /opt/truckflow/frontend/.env.local
```

After restoring frontend env values, rebuild the frontend:

```bash
cd /opt/truckflow/frontend
npm run build
pm2 restart truckflow-frontend --update-env
```

## Restore Nginx Config

```bash
cp /tmp/truckflow-restore/truckflow-YYYYMMDD-HHMMSS/etc/nginx/sites-available/truckflow /etc/nginx/sites-available/truckflow
nginx -t
systemctl reload nginx
```

## Restore Cloudflared Config

```bash
cp /tmp/truckflow-restore/truckflow-YYYYMMDD-HHMMSS/etc/cloudflared/config.yml /etc/cloudflared/config.yml
systemctl restart cloudflared
systemctl status cloudflared --no-pager
```

Note: Cloudflare tunnel credential JSON files are intentionally not included in this app backup. Keep tunnel credentials protected separately.

## Restart PM2 Services

```bash
pm2 restart truckflow-backend --update-env
pm2 restart truckflow-frontend --update-env
pm2 save
pm2 list
```

The backup includes PM2 process snapshots for reference:

```bash
pm2/pm2-jlist.json
pm2/pm2-list.txt
```


## SQLite runtime data

TruckFlow now stores leads and report history in `/opt/truckflow/backend/data/truckflow.db`. Restore `truckflow.db` plus any matching `truckflow.db-wal` and `truckflow.db-shm` files from the same backup archive before restarting PM2.
