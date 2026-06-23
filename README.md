# We're All Going to Europe with Kevin 🇨🇭

A single-page web app of lake-view hotels in the **Lucerne area** for the trip:
land Zurich **Wed 26 Aug 2026**, Lucerne base **27–29 Aug**, then on to **Chur (30 Aug)** for the Bernina Express.

~12 hotels with real photos, live-checked prices (2 rooms / 2 nights, 27–29 Aug), guest ratings,
lake-view & balcony flags, transport notes, **favorites** (saved in your browser), filtering and sorting,
and a **Check availability** button that opens each hotel on Booking.com with your dates pre-filled.

It's a **static site** — just `index.html`. No build step, no backend.

**Hosting model:** this host serves the site on **`0.0.0.0:2026`** (all interfaces). Your
**NGINX Proxy Manager** on the other host proxies
`we-are-all-going-to-europe-with-kevin.pathiakis.com` → `192.168.150.50:2026`, and **Cloudflare**
terminates HTTPS at the edge.

> **This host's LAN IP: `192.168.150.50`** (verify with `hostname -I`). NPM forwards to
> `192.168.150.50:2026`. Replace it if the address ever changes.

---

## Files

```
Europe2026/
├── index.html             ← the whole app (open directly to preview)
├── run.sh                 ← serve on 0.0.0.0:2026 (one-liner, Python)
├── europe2026.service     ← systemd unit (keeps it running on boot)
├── Dockerfile             ← optional: container image
├── docker-compose.yml     ← optional: `docker compose up -d` on 0.0.0.0:2026
├── npm-proxy-host.md      ← NGINX Proxy Manager + Cloudflare settings cheat-sheet
└── README.md
```

---

## 1. Push to GitHub (https://github.com/kpathiakis424/Europe2026)

```bash
cd Europe2026
git init
git add .
git commit -m "Lucerne hotel picker"
git branch -M main
git remote add origin https://github.com/kpathiakis424/Europe2026.git
git push -u origin main
```

> Repo already has commits? `git pull --rebase origin main` first (or `git push -f` to overwrite if you're sure).
> Update later: `git add . && git commit -m "update" && git push`.

---

## 2. Run it on the host (listening on all IPs, port 2026)

Clone, then pick **one** of the options below.

```bash
cd /var/www
git clone https://github.com/kpathiakis424/Europe2026.git
cd Europe2026
```

### Option A — quick test (foreground)

```bash
./run.sh                 # = python3 -m http.server 2026 --bind 0.0.0.0
# or a different port:  PORT=8080 ./run.sh
```

### Option B — systemd (survives reboots, recommended)

```bash
sudo cp europe2026.service /etc/systemd/system/
sudo sed -i "s#/var/www/Europe2026#$(pwd)#" /etc/systemd/system/europe2026.service  # fix path if needed
sudo systemctl daemon-reload
sudo systemctl enable --now europe2026
sudo systemctl status europe2026
```

### Option C — Docker

```bash
docker compose up -d --build      # serves on 0.0.0.0:2026
```

**Verify it's listening on all interfaces:**

```bash
curl -I http://localhost:2026         # 200 OK
ss -tlnp | grep 2026                  # should show 0.0.0.0:2026 (not 127.0.0.1)
```

Make sure the host firewall allows `2026/tcp` from the Proxy Manager host
(e.g. `sudo ufw allow 2026/tcp`).

---

## 3. NGINX Proxy Manager (other host)

Add a **Proxy Host** — full field values are in `npm-proxy-host.md`. In short:

- **Domain Names:** `we-are-all-going-to-europe-with-kevin.pathiakis.com`
- **Scheme:** `http`
- **Forward Hostname / IP:** `192.168.150.50`
- **Forward Port:** `2026`
- **Cache Assets / Block Common Exploits:** on; **Websockets:** optional
- **SSL tab:** request a Let's Encrypt cert (or use Cloudflare-origin) and force SSL

---

## 4. Cloudflare

1. **DNS** → `A` (or `CNAME`) record for `we-are-all-going-to-europe-with-kevin` → your public IP /
   tunnel, **Proxied (orange cloud)** on.
2. **SSL/TLS** → **Full** (or **Full (strict)** if NPM has a valid cert).
3. Browse **https://we-are-all-going-to-europe-with-kevin.pathiakis.com**.

> Using a **Cloudflare Tunnel** instead of port-forwarding? Point the tunnel's public hostname at
> `http://192.168.150.50:2026` and you can skip exposing the port publicly.

---

## Editing the hotel list

All hotel data is one JavaScript array near the bottom of `index.html` (`const HOTELS = [ … ]`).
Each entry: `name, area, stars, score, reviews, perNight, total, budget ("under"|"in"|"over"),
lakeview, balcony, img, thumbs[], desc, facil[], transport, book, lat, lng`. Add/remove objects to
change the list, then re-push. Favorites are stored per-browser under the key `europe2026_favs`.

**Prices & availability were live as of the search and move fast �