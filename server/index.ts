import express from "express";
import { evaluate } from "./evaluate";

try {
  // Optional .env support without extra dependency (Node >= 20.12)
  (process as unknown as { loadEnvFile?: (p?: string) => void }).loadEnvFile?.(".env");
} catch {
  /* no .env file: fine */
}

const app = express();
app.use(express.json({ limit: "32kb" }));

// Tiny in-memory rate limit: 20 req / minute / IP (protects the API key during a public demo)
const hits = new Map<string, { n: number; t: number }>();
app.use("/api", (req, res, next) => {
  const ip = req.ip ?? "x";
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) hits.set(ip, { n: 1, t: now });
  else if (++h.n > 20) return res.status(429).json({ error: "Too many requests, slow down." });
  next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true, ai: Boolean(process.env.ANTHROPIC_API_KEY) }));

app.post("/api/evaluate", async (req, res) => {
  const { title, event, evidence } = req.body ?? {};
  if (typeof evidence !== "string" || evidence.trim().length < 10) {
    return res.status(400).json({ error: "Evidence must be at least 10 characters." });
  }
  const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
  res.json(await evaluate({ title: clip(title, 120), event: clip(event, 120), evidence: clip(evidence, 4000) }));
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`SkillPass API on http://localhost:${port}`));
