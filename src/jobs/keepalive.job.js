/**
 * Keep-alive job — pings health endpoint every 14 minutes
 * Prevents Render free tier from sleeping
 * Only runs in production
 */

const https = require("https");

const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

function ping() {
  if (!RENDER_URL) return;

  const url = `${RENDER_URL}/api/health`;
  https
    .get(url, (res) => {
      console.log(`[Keep-alive] Ping ${res.statusCode} — ${new Date().toISOString()}`);
    })
    .on("error", (err) => {
      console.warn("[Keep-alive] Ping failed:", err.message);
    });
}

function startKeepAlive() {
  if (process.env.NODE_ENV !== "production") return;
  if (!RENDER_URL) {
    console.log("[Keep-alive] RENDER_EXTERNAL_URL not set — skipping");
    return;
  }

  // Ping every 14 minutes (Render sleeps after 15 min)
  const interval = 14 * 60 * 1000;
  setInterval(ping, interval);
  console.log("✅ Keep-alive job started — pinging every 14 minutes");
}

module.exports = { startKeepAlive };
