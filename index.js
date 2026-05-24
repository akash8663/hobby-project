const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const os = require("os");
const path = require("path");

const PORT = 3000;
const HOST = "0.0.0.0";
const CERT_PATH = path.join(__dirname, "cert.pem");
const KEY_PATH = path.join(__dirname, "key.pem");
const LOCATION_PATH = path.join(__dirname, "location.json");

function getLocalIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (err) {
    console.warn("  (Could not auto-detect IP:", err.message + ")");
  }
  return null;
}

function loadHostLocation() {
  if (process.env.LATITUDE != null && process.env.LONGITUDE != null) {
    return {
      latitude: Number(process.env.LATITUDE),
      longitude: Number(process.env.LONGITUDE),
    };
  }
  try {
    if (fs.existsSync(LOCATION_PATH)) {
      const data = JSON.parse(fs.readFileSync(LOCATION_PATH, "utf8"));
      if (data.latitude != null && data.longitude != null) {
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        };
      }
    }
  } catch (err) {
    console.warn("  (Could not read location.json:", err.message + ")");
  }
  return null;
}

async function fetchOpenMeteo(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set(
    "current",
    "temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m"
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API unavailable");
  return res.json();
}

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/weather", async (req, res) => {
  let lat = Number(req.query.lat);
  let lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    const hostLocation = loadHostLocation();
    if (!hostLocation) {
      return res.status(400).json({
        error: "no_location",
        message:
          "No coordinates provided. Allow browser location, or create location.json on the server (see location.json.example).",
      });
    }
    lat = hostLocation.latitude;
    lon = hostLocation.longitude;
  }

  try {
    const data = await fetchOpenMeteo(lat, lon);
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "weather_failed", message: err.message });
  }
});

function printStartupUrls(useHttps) {
  const protocol = useHttps ? "https" : "http";
  const ip = getLocalIp();

  console.log("");
  console.log("  Hotspot Dashboard is running");
  console.log("  ─────────────────────────────");
  if (useHttps) {
    console.log("  HTTPS enabled (secure context for location)");
  } else {
    console.warn("  WARNING: cert.pem/key.pem not found — using HTTP.");
    console.warn("  Geolocation may be blocked on LAN devices.");
  }
  console.log(`  On this device:  ${protocol}://127.0.0.1:${PORT}`);
  if (ip) {
    console.log("  From other devices on the same WiFi:");
    console.log(`                   ${protocol}://${ip}:${PORT}`);
  }
  if (useHttps) {
    console.log("");
    console.log("  First visit: accept the certificate warning in the browser.");
  }
  const hostLocation = loadHostLocation();
  if (hostLocation) {
    console.log(
      `  Host weather fallback: ${hostLocation.latitude}, ${hostLocation.longitude}`
    );
  } else {
    console.log("  Tip: copy location.json.example → location.json for weather without GPS.");
  }
  console.log("");
}

const hasTls = fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH);

if (hasTls) {
  const options = {
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH),
  };
  https.createServer(options, app).listen(PORT, HOST, () => printStartupUrls(true));
} else {
  http.createServer(app).listen(PORT, HOST, () => printStartupUrls(false));
}
