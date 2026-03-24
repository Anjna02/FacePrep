// src/server.js
require("dotenv").config();          // ← must be first — loads .env into process.env
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes        = require("./routes/auth");
const assessmentRoutes  = require("./routes/assessments");
const proctorRoutes     = require("./routes/proctor");
const sessionRoutes     = require("./routes/sessions");
const submitRoutes      = require("./routes/submit");

const app  = express();
const PORT = process.env.PORT || 4000;

// ── SECURITY MIDDLEWARE ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:  process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limit — 100 requests per minute per IP (relaxed for auth)
app.use(rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false }));

// Stricter rate limit on auth endpoints (prevent brute force)
app.use("/api/auth/login",    rateLimit({ windowMs: 60_000, max: 10, message: { error: "Too many login attempts" } }));
app.use("/api/auth/register", rateLimit({ windowMs: 60_000, max: 5,  message: { error: "Too many register attempts" } }));

app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/proctor",     proctorRoutes);
app.use("/api/sessions",    sessionRoutes);
app.use("/api/submit",      submitRoutes);

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  FacePrep backend running → http://localhost:${PORT}`);
  console.log(`   Seed the DB:  npm run seed`);
  console.log(`   Dev mode:     npm run dev\n`);
});