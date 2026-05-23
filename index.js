const express = require("express");
const os = require("os");
const path = require("path");

const PORT = 3000;
const HOST = "0.0.0.0";

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
    // iSH often throws here — server can still run
    console.warn("  (Could not auto-detect IP:", err.message + ")");
  }
  return null;
}

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, HOST, () => {
  const ip = getLocalIp();
  console.log("");
  console.log("  Hotspot Dashboard is running");
  console.log("  ─────────────────────────────");
  if (ip) {
    console.log(`  On this device:  http://127.0.0.1:${PORT}`);
    console.log(`  From other devices on the same WiFi:`);
    console.log(`                   http://${ip}:${PORT}`);
  } else {
    console.log(`  Could not detect local IP.`);
    console.log(`  Try: http://127.0.0.1:${PORT}`);
  }
  console.log("");
});
