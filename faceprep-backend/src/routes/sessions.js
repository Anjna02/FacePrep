// src/routes/sessions.js
const express = require("express");
const db      = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// Session ID helper
function sid(userId, sectionId) {
  return `${userId}__${sectionId}`;
}

// ── GET /api/sessions/:sectionId ─────────────────────────────────────────────
// Load saved session for current user + section
router.get("/:sectionId", (req, res) => {
  const row = db.prepare(
    "SELECT * FROM exam_sessions WHERE id = ?"
  ).get(sid(req.user.id, req.params.sectionId));

  if (!row) return res.status(404).json({ error: "No session found" });

  res.json({
    answers:    JSON.parse(row.answers),
    statuses:   JSON.parse(row.statuses),
    time_left:  row.time_left,
    updated_at: row.updated_at,
  });
});

// ── POST /api/sessions/:sectionId ─────────────────────────────────────────────
// Upsert (create or update) session state
router.post("/:sectionId", (req, res) => {
  const { answers, statuses, time_left } = req.body;

  if (!Array.isArray(answers) || !Array.isArray(statuses) || typeof time_left !== "number") {
    return res.status(400).json({ error: "answers[], statuses[], and time_left (number) are required" });
  }

  const sessionSid = sid(req.user.id, req.params.sectionId);

  db.prepare(`
    INSERT INTO exam_sessions (id, user_id, section_id, answers, statuses, time_left, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, unixepoch())
    ON CONFLICT(id) DO UPDATE SET
      answers    = excluded.answers,
      statuses   = excluded.statuses,
      time_left  = excluded.time_left,
      updated_at = unixepoch()
  `).run(
    sessionSid,
    req.user.id,
    req.params.sectionId,
    JSON.stringify(answers),
    JSON.stringify(statuses),
    time_left
  );

  res.json({ ok: true });
});

// ── DELETE /api/sessions/:sectionId ──────────────────────────────────────────
// Clear session on submit or abandon
router.delete("/:sectionId", (req, res) => {
  db.prepare("DELETE FROM exam_sessions WHERE id = ?").run(
    sid(req.user.id, req.params.sectionId)
  );
  res.json({ ok: true });
});

module.exports = router;