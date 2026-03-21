// src/db.js — SQLite setup via better-sqlite3
const Database = require("better-sqlite3");
const path     = require("path");
const fs       = require("fs");

// On Railway, use /tmp for writable storage; locally use project root
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "mcq.db"));

// Enable WAL for better concurrency
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── SCHEMA ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id            TEXT PRIMARY KEY,           -- e.g. "userId_sectionTitle"
    user_id       TEXT NOT NULL,
    section_title TEXT NOT NULL,
    answers       TEXT NOT NULL DEFAULT '[]', -- JSON array of selected option indices
    statuses      TEXT NOT NULL DEFAULT '[]', -- JSON array of status strings
    time_left     INTEGER NOT NULL DEFAULT 0,
    updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

module.exports = db;