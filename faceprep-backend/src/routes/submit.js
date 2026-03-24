// src/routes/submit.js
const express = require("express");
const db      = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// ── POST /api/submit/:sectionId ──────────────────────────────────────────────
// Body: { answers: [...], time_taken: number }
// Grades the submission, saves to submissions table, deletes exam_session
router.post("/:sectionId", (req, res) => {
  const sectionId = Number(req.params.sectionId);
  const { answers, time_taken = 0 } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "answers[] is required" });
  }

  // Fetch section + questions
  const section = db.prepare("SELECT * FROM sections WHERE id = ?").get(sectionId);
  if (!section) return res.status(404).json({ error: "Section not found" });

  const questions = db.prepare(
    "SELECT id, correct_idx FROM questions WHERE section_id = ? ORDER BY position"
  ).all(sectionId);

  // Grade — only MCQ questions have a correct_idx
  let score = 0;
  const gradedAnswers = answers.map((selected, i) => {
    const q = questions[i];
    if (!q) return { selected, correct: null, is_correct: false };
    const correct = q.correct_idx;
    const is_correct = correct !== null && selected === correct;
    if (is_correct) score++;
    return { selected, correct, is_correct };
  });

  // Check for duplicate submission
  const existing = db.prepare(
    "SELECT id FROM submissions WHERE user_id = ? AND section_id = ?"
  ).get(req.user.id, sectionId);
  if (existing) {
    return res.status(409).json({ error: "Section already submitted" });
  }

  // Save submission
  const result = db.prepare(`
    INSERT INTO submissions (user_id, assessment_id, section_id, answers, score, total_marks, time_taken)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    section.assessment_id,
    sectionId,
    JSON.stringify(answers),
    score,
    section.total_marks,
    time_taken
  );

  // Clean up the in-progress session
  db.prepare("DELETE FROM exam_sessions WHERE user_id = ? AND section_id = ?").run(
    req.user.id, sectionId
  );

  res.json({
    submission_id: result.lastInsertRowid,
    score,
    total_marks: section.total_marks,
    graded: gradedAnswers,
  });
});

// ── GET /api/submit/:sectionId/result ────────────────────────────────────────
// Get a previously submitted section's result
router.get("/:sectionId/result", (req, res) => {
  const sub = db.prepare(
    "SELECT * FROM submissions WHERE user_id = ? AND section_id = ?"
  ).get(req.user.id, req.params.sectionId);

  if (!sub) return res.status(404).json({ error: "No submission found" });

  const questions = db.prepare(
    "SELECT id, text, type, options, correct_idx, position FROM questions WHERE section_id = ? ORDER BY position"
  ).all(req.params.sectionId);

  const savedAnswers = JSON.parse(sub.answers);

  const graded = questions.map((q, i) => ({
    question:   q.text,
    options:    JSON.parse(q.options),
    selected:   savedAnswers[i] ?? null,
    correct:    q.correct_idx,
    is_correct: savedAnswers[i] === q.correct_idx && q.correct_idx !== null,
  }));

  res.json({
    score:        sub.score,
    total_marks:  sub.total_marks,
    time_taken:   sub.time_taken,
    submitted_at: sub.submitted_at,
    graded,
  });
});

module.exports = router;