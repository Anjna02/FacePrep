// src/routes/auth.js
const express = require("express");
const bcrypt  = require("bcryptjs");
const db      = require("../db");
const { requireAuth, signToken } = require("../middleware/auth");

const router = express.Router();

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// JWT is stateless — client just discards the token.
// This endpoint exists for clients that want server acknowledgment.
router.post("/logout", requireAuth, (_req, res) => {
  res.json({ ok: true, message: "Logged out — please discard your token" });
});

// ── POST /api/auth/register (admin only in production — open for dev) ────────
router.post("/register", (req, res) => {
  const { name, email, password, role = "student" } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email.trim());
  if (exists) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
  ).run(name.trim(), email.trim().toLowerCase(), hash, role === "admin" ? "admin" : "student");

  const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);
  const token = signToken(user);
  res.status(201).json({ token, user });
});

module.exports = router;