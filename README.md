# Hotspot Dashboard

A mobile-hosted web dashboard you can run on your phone and open from any device on the same WiFi hotspot — ideal for a Tesla browser, tablet, or passenger phone while driving.

Shows a live clock and local weather via [Open-Meteo](https://open-meteo.com/) (no API key required).

## Requirements

- [Node.js](https://nodejs.org/) on the host device
- A Node.js terminal app on mobile:
  - **iOS:** [iSH](https://ish.app/) (`apk add nodejs npm`)
  - **Android:** [Termux](https://termux.dev/) (`pkg install nodejs`)
- **HTTPS certificates** (`cert.pem` and `key.pem` in the project root) for location on LAN devices

## Install

```bash
npm install
```

### HTTPS certificates

Place `key.pem` and `cert.pem` in the project root. Generate them with OpenSSL or `mkcert`, and include your LAN IP in the certificate (Subject Alternative Name), e.g. `192.168.1.183`.

### Weather without GPS (optional)

For Tesla or browsers that block location, copy the example and set your coordinates:

```bash
cp location.json.example location.json
```

Edit `latitude` / `longitude` to your area. The server uses this when the browser denies GPS.

## Run

```bash
node index.js
```

The server binds to `0.0.0.0:3000` with HTTPS when certs are present:

```
  Hotspot Dashboard is running
  ─────────────────────────────
  HTTPS enabled (secure context for location)
  On this device:  https://127.0.0.1:3000
  From other devices on the same WiFi:
                   https://192.168.x.x:3000
```

Use **`https://`** URLs (not `http://`).

### First visit — trust the certificate

Self-signed certs show a warning. On each device:

1. Open the `https://` URL
2. Accept the security warning (**Advanced** → proceed)
3. Allow **Location** when prompted (optional if `location.json` is set)
4. Tap **Retry** if weather did not load

## Access from another device

1. Enable **Personal Hotspot** on the host phone.
2. Connect the other device (Tesla, tablet, etc.) to that WiFi.
3. Run `node index.js` on the host and note the printed IP.
4. Open `https://<host-ip>:3000` in the browser.

## Weather / location behavior

| Method | When it applies |
|--------|------------------|
| Browser GPS | Preferred on `https://` after you allow location |
| Saved browser location | Used if GPS is denied but worked before on that device |
| `location.json` on server | Fallback for Tesla / denied GPS — set once on the host |

## Project structure

```
├── index.js               # HTTPS server + /api/weather
├── cert.pem, key.pem      # TLS certs (not in git)
├── location.json.example  # Template for host fallback coords
├── public/index.html      # Dashboard UI
├── package.json
└── README.md
```

## Tech stack

- Node.js + Express
- Vanilla HTML/CSS/JS (no build step)
