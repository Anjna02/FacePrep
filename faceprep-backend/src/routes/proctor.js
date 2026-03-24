// src/routes/proctor.js
const express  = require("express");
const db       = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// ── Send email via Resend (HTTPS, works on Render free tier) ─────────────────
async function sendNotification(code, assessmentTitle) {
  const apiKey     = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL || "animemines2004@gmail.com";

  if (!apiKey) {
    console.log(`[ProctorNotify] No RESEND_API_KEY set. Code: ${code} | Assessment: ${assessmentTitle}`);
    return;
  }

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <div style="background:#152d6e;padding:16px 24px;border-radius:8px 8px 0 0">
        <span style="color:#fff;font-size:20px;font-weight:700">FacePrep</span>
        <span style="background:#e53c2b;color:#fff;font-size:20px;font-weight:700;padding:2px 10px;margin-left:4px">Prep</span>
      </div>
      <div style="border:1px solid #e0e4ed;border-top:none;padding:28px 24px;border-radius:0 0 8px 8px">
        <h2 style="margin:0 0 16px;color:#111">Proctor Code Notification</h2>
        <p style="color:#444;margin:0 0 12px">A proctor code was entered for an assessment session.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#888;font-size:13px">Code</td><td style="font-size:22px;font-weight:700;letter-spacing:6px;color:#1a5cff">${code}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:13px">Assessment</td><td style="color:#222">${assessmentTitle || "N/A"}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:13px">Time</td><td style="color:#222">${new Date().toLocaleString()}</td></tr>
        </table>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from:    "FacePrep Proctor <onboarding@resend.dev>",
      to:      [notifyEmail],
      subject: `Proctor Code Entered – ${assessmentTitle || "Assessment"}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}

// ── POST /api/proctor/notify ─────────────────────────────────────────────────
router.post("/notify", requireAuth, async (req, res) => {
  const { code, assessmentTitle } = req.body;

  try {
    await sendNotification(code, assessmentTitle);
  } catch (err) {
    console.error("[ProctorNotify] email failed:", err.message);
  }

  res.json({ ok: true });
});

// ── POST /api/proctor/verify ─────────────────────────────────────────────────
router.post("/verify", requireAuth, (req, res) => {
  const { code, assessmentId } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Proctor code is required" });
  }

  const row = db.prepare(
    "SELECT * FROM proctor_codes WHERE code = ?"
  ).get(String(code).trim());

  if (!row) {
    return res.status(401).json({ error: "Invalid proctor code" });
  }

  if (row.expires_at && row.expires_at < Math.floor(Date.now() / 1000)) {
    return res.status(401).json({ error: "Proctor code has expired" });
  }

  if (assessmentId && row.assessment_id && row.assessment_id !== Number(assessmentId)) {
    return res.status(401).json({ error: "Proctor code is not valid for this assessment" });
  }

  res.json({ ok: true, assessmentId: row.assessment_id });
});

module.exports = router;