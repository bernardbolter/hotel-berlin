# Netcup deploy — Hotel Berlin

Run the full Next.js + Payload app on the VPS so Postgres and media stay on the same machine.

## 0. Stop Vercel auto-deploys (do this first)

Pushes to `main` will keep rebuilding on Vercel until you turn that off.

**Option A — recommended while on Netcup**

1. Vercel → project **hotel-berlin-berlin** → **Settings → Git**
2. **Disconnect** the Git repository  
   (or under **Ignored Build Step** set a command that always skips, e.g. `exit 0` — disconnect is clearer)

**Option B — pause the project**

1. Project **Settings → General** → scroll to danger zone / pause  
2. Or delete the project if you no longer need the `.vercel.app` URL

After disconnect/pause, `git push origin main` only updates GitHub — Netcup is updated when you pull/build there.

---

## 1. Server packages

SSH into the Netcup box (Ubuntu/Debian assumed):

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

## 2. Postgres

```bash
sudo -u postgres createuser hotelberlin -P   # choose a strong password
sudo -u postgres createdb -O hotelberlin hotelberlin
```

Keep Postgres **bound to localhost** (default). The app on the same machine connects via `127.0.0.1` — do not open `5432` to the internet.

## 3. App code

```bash
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
cd /var/www
git clone https://github.com/bernardbolter/hotel-berlin.git
cd hotel-berlin
npm install
```

If you change the path, edit `cwd` in `deploy/netcup/ecosystem.config.cjs`.

## 4. Environment

```bash
cp .env.example .env
nano .env
```

Set at least:

```env
DATABASE_URL=postgresql://hotelberlin:YOUR_PASSWORD@127.0.0.1:5432/hotelberlin
PAYLOAD_SECRET=generate-a-long-random-string
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.…
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN_OR_IP
# First deploy / after schema changes — then remove or set false
PAYLOAD_DATABASE_PUSH=true
NODE_ENV=production
PORT=3000
```

## 5. Build, seed, start

```bash
npm run build
# Create admin user via /admin on first visit, or seed:
npm run seed
npm run seed:rooms
# optional: npm run seed:hero-images   (needs image assets on the server)
npm run seed:room-images             # if room image sources are available

pm2 start deploy/netcup/ecosystem.config.cjs
pm2 save
pm2 startup   # follow the command it prints
```

After the DB schema is stable, remove `PAYLOAD_DATABASE_PUSH` from `.env` (or set it to `false`) and `pm2 restart hotel-berlin`.

Media uploads land under the app’s media storage on this disk — back up that folder with the database.

## 6. Nginx reverse proxy

```bash
sudo cp deploy/netcup/nginx.conf /etc/nginx/sites-available/hotel-berlin
# edit server_name
sudo ln -sf /etc/nginx/sites-available/hotel-berlin /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

TLS (when DNS points here):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your.preview.domain
```

## 7. Updates after a git push

On the server:

```bash
cd /var/www/hotel-berlin
git pull origin main
npm install
npm run build
pm2 restart hotel-berlin
```

Or copy `deploy/netcup/update.sh` and run it.

## Checklist

- [ ] Vercel Git disconnected / project paused
- [ ] Postgres local-only
- [ ] `.env` with DB, secret, Mapbox, site URL
- [ ] `npm run build` succeeds
- [ ] PM2 running (`pm2 status`)
- [ ] Nginx proxies to `:3000`
- [ ] `/en` shows hero + rooms; `/admin` works
- [ ] Backups: Postgres dump + media directory
