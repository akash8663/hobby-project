# Hotspot Dashboard

A mobile-hosted web dashboard you can run on your phone and open from any device on the same WiFi hotspot — ideal for a Tesla browser, tablet, or passenger phone while driving.

Shows a live clock and local weather (via browser geolocation + [Open-Meteo](https://open-meteo.com/), no API key required).

## Requirements

- [Node.js](https://nodejs.org/) on the host device
- A Node.js terminal app on mobile:
  - **iOS:** [iSH](https://ish.app/) (Alpine Linux shell with Node via `apk add nodejs`)
  - **Android:** [Termux](https://termux.dev/) (`pkg install nodejs`)

## Install

Copy this project onto your phone (or clone it), then in the project folder:

```bash
npm install
```

## Run

```bash
node index.js
```

The server binds to `0.0.0.0:3000` so other devices on the hotspot can reach it. On startup you will see output like:

```
  Hotspot Dashboard is running
  ─────────────────────────────
  On this device:  http://127.0.0.1:3000
  From other devices on the same WiFi:
                   http://192.168.x.x:3000
```

Use the **second URL** from other devices (Tesla, tablet, etc.).

## Access from another device

1. **Enable the hotspot** on your phone (Settings → Personal Hotspot / Mobile Hotspot).
2. **Connect the other device** to that WiFi network.
3. **Start the server** on the phone (`node index.js`) and note the IP printed in the terminal.
4. **Open a browser** on the other device and go to `http://<phone-ip>:3000`.

### Finding your phone's IP manually

If the printed IP is wrong or missing:

| Platform | How to find IP |
|----------|----------------|
| **iPhone** | Settings → Wi-Fi → (i) next to your hotspot / network → IP Address |
| **Android** | Settings → Network → Hotspot → or `ifconfig` / `ip addr` in Termux |
| **iSH** | Run `ip addr` or `ifconfig` in the shell |

The IP is usually in the `192.168.x.x` range.

### Tips

- Keep the terminal app open (or use a background process manager) so the server stays running.
- **Location:** The Tesla or client browser must allow location for weather. The phone hosting the server should have location enabled; clients use their own GPS if available, otherwise the host's location is used when you open the page on the phone itself.
- **Firewall:** Most phone hotspots do not block device-to-device traffic; if you cannot connect, confirm both devices are on the same hotspot network.

## Project structure

```
├── index.js          # Express server (0.0.0.0:3000, prints local IP)
├── public/
│   └── index.html    # Dashboard UI (clock + weather)
├── package.json
└── README.md
```

## Tech stack

- Node.js + Express
- Vanilla HTML/CSS/JS (no build step)
