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
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      /\.vercel\.app$/,
      "http://localhost:5173",
    ];
    if (!origin) return callback(null, true);
    const ok = allowed.some(p =>
      typeof p === "string" ? p === origin : p.test(origin)
    );
    ok ? callback(null, true) : callback(new Error("CORS blocked: " + origin));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

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

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", ts: Date.now() });
});

// ── TEMP: one-time reseed endpoint (remove ENABLE_SEED env var after use) ─────
if (process.env.ENABLE_SEED === "true") {
  app.get("/api/admin/reseed", (_req, res) => {
    try {
      // Clear require cache so seed runs fresh every time
      delete require.cache[require.resolve("./seed")];
      require("./seed");
      res.json({ ok: true, message: "Database reseeded!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ── SERVE FRONTEND ────────────────────────────────────────────────────────────
const frontendPath = path.resolve(__dirname, "../../faceprep/dist");
console.log("📦 Frontend path:", frontendPath);

app.use(express.static(frontendPath));

app.get("*", (req, res, next) => {
  const indexFile = path.join(frontendPath, "index.html");
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

// ── AUTO-SEED IF DB IS EMPTY ──────────────────────────────────────────────────
const userCount = require("./db").prepare("SELECT COUNT(*) as n FROM users").get().n;
if (userCount === 0) {
  console.log("🌱 Empty DB detected — running seed...");
  require("./seed");
}

// ── START SERVER ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FacePrep running on port ${PORT}`);
});