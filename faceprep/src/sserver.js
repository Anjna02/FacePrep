// src/server.js
const express = require("express");
const cors    = require("cors");
const db      = require("./db");

const app  = express();
const PORT = process.env.PORT || 4000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",   // lock down in production
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// ── HELPERS ───────────────────────────────────────────────────────────────────
function sessionId(userId, sectionTitle) {
  return `${userId}__${sectionTitle}`;
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

/**
 * GET /api/session/:userId/:sectionTitle
 * Returns saved answers, statuses, and time_left for a user+section.
 * Returns 404 if no session exists yet.
 */
app.get("/api/session/:userId/:sectionTitle", (req, res) => {
  const { userId, sectionTitle } = req.params;
  const row = db.prepare(
    "SELECT * FROM sessions WHERE id = ?"
  ).get(sessionId(userId, sectionTitle));

  if (!row) return res.status(404).json({ error: "No session found" });

  res.json({
    answers:   JSON.parse(row.answers),
    statuses:  JSON.parse(row.statuses),
    time_left: row.time_left,
    updated_at: row.updated_at,
  });
});

/**
 * POST /api/session/:userId/:sectionTitle
 * Upserts (creates or updates) the session state.
 * Body: { answers: [...], statuses: [...], time_left: number }
 */
app.post("/api/session/:userId/:sectionTitle", (req, res) => {
  const { userId, sectionTitle } = req.params;
  const { answers, statuses, time_left } = req.body;

  if (!Array.isArray(answers) || !Array.isArray(statuses) || typeof time_left !== "number") {
    return res.status(400).json({ error: "Invalid body: answers[], statuses[], time_left required" });
  }

  const sid = sessionId(userId, sectionTitle);
  db.prepare(`
    INSERT INTO sessions (id, user_id, section_title, answers, statuses, time_left, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, unixepoch())
    ON CONFLICT(id) DO UPDATE SET
      answers    = excluded.answers,
      statuses   = excluded.statuses,
      time_left  = excluded.time_left,
      updated_at = unixepoch()
  `).run(sid, userId, sectionTitle, JSON.stringify(answers), JSON.stringify(statuses), time_left);

  res.json({ ok: true });
});

/**
 * DELETE /api/session/:userId/:sectionTitle
 * Clears the session (on submit).
 */
app.delete("/api/session/:userId/:sectionTitle", (req, res) => {
  const { userId, sectionTitle } = req.params;
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId(userId, sectionTitle));
  res.json({ ok: true });
});

/**
 * GET /api/health
 * Simple health check for Railway.
 */
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  MCQ backend running on http://localhost:${PORT}`);
});