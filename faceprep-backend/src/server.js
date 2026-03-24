// src/server.js

require("dotenv").config();

const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const rateLimit = require("express-rate-limit");
const path      = require("path");

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
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Global rate limit
app.use(rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

// Stricter auth limits
app.use("/api/auth/login",
  rateLimit({ windowMs: 60_000, max: 10, message: { error: "Too many login attempts" } })
);

app.use("/api/auth/register",
  rateLimit({ windowMs: 60_000, max: 5, message: { error: "Too many register attempts" } })
);

app.use(express.json());

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/proctor",     proctorRoutes);
app.use("/api/sessions",    sessionRoutes);
app.use("/api/submit",      submitRoutes);

// ── HEALTH CHECK (IMPORTANT FOR RAILWAY) ──────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", ts: Date.now() });
});

// ── SERVE FRONTEND (FIXED PATH LOGIC) ─────────────────────────────────────────

// absolute safe path (works on Railway)
const frontendPath = path.resolve(__dirname, "../../faceprep/dist");

// debug log (VERY useful in Railway logs)
console.log("📦 Frontend path:", frontendPath);

// serve static files if build exists
app.use(express.static(frontendPath));

// fallback for React Router
app.get("*", (req, res, next) => {
  const indexFile = path.join(frontendPath, "index.html");

  // check if file exists to avoid crash
  if (require("fs").existsSync(indexFile)) {
    return res.sendFile(indexFile);
  } else {
    console.warn("⚠️ Frontend build not found, skipping static serve");
    return next();
  }
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("🔥 ERROR:", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

// ── START SERVER ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FacePrep running on port ${PORT}`);
});