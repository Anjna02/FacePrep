// src/routes/assessments.js
const express = require("express");
const db      = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// All assessment routes require auth
router.use(requireAuth);

// ── GET /api/assessments ─────────────────────────────────────────────────────
// Returns all assessments split into active and completed
router.get("/", (req, res) => {
  const all = db.prepare("SELECT * FROM assessments ORDER BY created_at DESC").all();

  const active    = all.filter(a => a.status === "Active");
  const completed = all.filter(a => a.status === "Completed");

  res.json({ active, completed });
});

// ── GET /api/assessments/:id ─────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const assessment = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
  if (!assessment) return res.status(404).json({ error: "Assessment not found" });

  const sections = db.prepare(
    "SELECT id, assessment_id, title, total_questions, total_marks, duration_mins, type, position FROM sections WHERE assessment_id = ? ORDER BY position"
  ).all(assessment.id);

  // Check which sections this user has already submitted
  const sectionIds = sections.map(s => s.id);
  const submittedRows = sectionIds.length
    ? db.prepare(
        `SELECT section_id FROM submissions WHERE user_id = ? AND section_id IN (${sectionIds.map(() => "?").join(",")})`
      ).all(req.user.id, ...sectionIds)
    : [];
  const submittedSet = new Set(submittedRows.map(r => r.section_id));

  const sectionsWithStatus = sections.map(s => ({
    ...s,
    completed: submittedSet.has(s.id),
  }));

  res.json({ ...assessment, sections: sectionsWithStatus });
});

// ── GET /api/assessments/:id/sections/:sectionId/questions ──────────────────
router.get("/:id/sections/:sectionId/questions", (req, res) => {
  const section = db.prepare(
    "SELECT * FROM sections WHERE id = ? AND assessment_id = ?"
  ).get(req.params.sectionId, req.params.id);
  if (!section) return res.status(404).json({ error: "Section not found" });

  const questions = db.prepare(
    "SELECT id, text, type, options, position FROM questions WHERE section_id = ? ORDER BY position"
  ).all(section.id);

  // Parse options JSON for each question
  const parsed = questions.map(q => ({
    ...q,
    options: JSON.parse(q.options),
  }));

  res.json({ section, questions: parsed });
});

module.exports = router;