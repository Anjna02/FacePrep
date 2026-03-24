// src/db.js
const Database = require("better-sqlite3");
const path     = require("path");
const fs       = require("fs");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "faceprep.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  -- ── USERS ──────────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'student', -- student | admin
    created_at    INTEGER NOT NULL DEFAULT (unixepoch())
  );

  -- ── ASSESSMENTS ────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS assessments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    type            TEXT    NOT NULL DEFAULT 'PRACTICE',
    total_sections  INTEGER NOT NULL DEFAULT 1,
    total_questions INTEGER NOT NULL DEFAULT 0,
    duration_mins   INTEGER NOT NULL DEFAULT 30,
    status          TEXT    NOT NULL DEFAULT 'Active', -- Active | Completed
    start_date      TEXT,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );

  -- ── SECTIONS ───────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS sections (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id    INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    title            TEXT    NOT NULL,
    total_questions  INTEGER NOT NULL DEFAULT 0,
    total_marks      INTEGER NOT NULL DEFAULT 0,
    duration_mins    INTEGER NOT NULL DEFAULT 10,
    type             TEXT    NOT NULL DEFAULT 'MCQ',  -- MCQ | Coding
    position         INTEGER NOT NULL DEFAULT 0
  );

  -- ── QUESTIONS ──────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS questions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id  INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    text        TEXT    NOT NULL,
    type        TEXT    NOT NULL DEFAULT 'MCQ',
    options     TEXT    NOT NULL DEFAULT '[]',  -- JSON array of strings
    correct_idx INTEGER,                         -- 0-based index into options (NULL for coding)
    position    INTEGER NOT NULL DEFAULT 0
  );

  -- ── PROCTOR CODES ──────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS proctor_codes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    code          TEXT    NOT NULL UNIQUE,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE SET NULL,
    expires_at    INTEGER,                       -- unix timestamp, NULL = never expires
    created_at    INTEGER NOT NULL DEFAULT (unixepoch())
  );

  -- ── EXAM SESSIONS (in-progress answers) ────────────────────────────────────
  CREATE TABLE IF NOT EXISTS exam_sessions (
    id            TEXT    PRIMARY KEY,           -- "{user_id}__{section_id}"
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_id    INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    answers       TEXT    NOT NULL DEFAULT '[]', -- JSON: selected option indices
    statuses      TEXT    NOT NULL DEFAULT '[]', -- JSON: "unanswered"|"answered"|"revisit"|"current"
    time_left     INTEGER NOT NULL DEFAULT 0,    -- seconds remaining
    updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, section_id)
  );

  -- ── SUBMISSIONS (final submitted answers) ──────────────────────────────────
  CREATE TABLE IF NOT EXISTS submissions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    section_id    INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    answers       TEXT    NOT NULL DEFAULT '[]', -- JSON: final selected option indices
    score         INTEGER NOT NULL DEFAULT 0,
    total_marks   INTEGER NOT NULL DEFAULT 0,
    time_taken    INTEGER NOT NULL DEFAULT 0,    -- seconds
    submitted_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, section_id)
  );

  -- ── INDEXES ────────────────────────────────────────────────────────────────
  CREATE INDEX IF NOT EXISTS idx_sections_assessment ON sections(assessment_id);
  CREATE INDEX IF NOT EXISTS idx_questions_section   ON questions(section_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_user       ON exam_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_submissions_user    ON submissions(user_id);
  CREATE INDEX IF NOT EXISTS idx_submissions_assessment ON submissions(assessment_id);
`);

module.exports = db;