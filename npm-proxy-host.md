# NGINX Proxy Manager — Proxy Host settings

Create a new **Proxy Host** in NPM pointing at the host that runs this site on `0.0.0.0:2026`.

## Details tab
| Field | Value |
|---|---|
| Domain Names | `we-are-all-going-to-europe-with-kevin.pathiakis.com` |
| Scheme | `http` |
| Forward Hostname / IP | `192.168.150.50` (LAN IP of the machine serving on :2026 — verify with `hostname -I`) |
| Forward Port | `2026` |
| Cache Assets | on (optional) |
| Block Common Exploits | on |
| Websockets Support | optional (not required for this static site) |

## SSL tab
- **SSL Certificate:** request a new **Let's Encrypt** certificate (NPM handles it),
  *or* upload/select a Cloudflare Origin certificate.
- **Force SSL:** on
- **HTTP/2 Support:** on
- **HSTS:** optional

## Cloudflare (in front of NPM)
- **DNS:** `A`/`CNAME` for `we-are-all-going-to-europe-with-kevin` → your public IP / tunnel, **Proxied**.
- **SSL/TLS mode:** **Full** (use **Full (strict)** when NPM has a valid public cert).
- If Let's Encrypt issuance via NPM fails behind Cloudflare's proxy, either grey-cloud the record
  during issuance, use the **DNS-01** challenge with a Cloudflare API token, or use a
  **Cloudflare Origin certificate** instead.

## Sanity checks
```bash
# on the serving host
ss -tlnp | grep 2026          # expect 0.0.0.0:2026
curl -I http://localhost:2026 # 200 OK

# from the NPM host
curl -I http://192.168.150.50:2026   # 200 OK  → NPM can reach it
```
If the last check fails, open the firewall: `sudo 