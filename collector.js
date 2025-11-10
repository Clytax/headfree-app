// collector.js — minimal POST collector, no deps
const http = require("http");
const samples = { cold: [], warm: [] };

function pct(arr, p) {
  const a = arr.slice().sort((x, y) => x - y);
  if (!a.length) return null;
  const idx = Math.ceil((p / 100) * a.length) - 1;
  return a[Math.max(0, Math.min(idx, a.length - 1))];
}

const server = http.createServer((req, res) => {
  // CORS/headers (nice to have)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.end();

  if (req.method === "POST" && req.url === "/perf") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const { event, ms, cold_start } = JSON.parse(body || "{}");
        if (event === "first_interactive_ms") {
          (cold_start ? samples.cold : samples.warm).push(Number(ms));
        } else if (event === "warm_start_ms") {
          samples.warm.push(Number(ms));
        }
      } catch {}
      res.statusCode = 204;
      res.end();
    });
    return;
  }

  if (req.method === "POST" && req.url === "/reset") {
    samples.cold = [];
    samples.warm = [];
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === "GET" && req.url === "/stats") {
    const out = {
      cold: {
        n: samples.cold.length,
        p50: pct(samples.cold, 50),
        p90: pct(samples.cold, 90),
      },
      warm: {
        n: samples.warm.length,
        p50: pct(samples.warm, 50),
        p90: pct(samples.warm, 90),
      },
    };
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify(out));
  }

  if (req.method === "GET" && req.url === "/dump") {
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify(samples));
  }

  res.statusCode = 404;
  res.end("Not found");
});

server.listen(4000, "127.0.0.1", () =>
  console.log(
    "Perf collector on http://127.0.0.1:4000  (endpoints: POST /perf, GET /stats, POST /reset, GET /dump)"
  )
);
