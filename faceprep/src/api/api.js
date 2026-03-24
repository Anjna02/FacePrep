// src/api/api.js
// ─────────────────────────────────────────────────────────────────────────────
// All API calls go through this file.
// Set VITE_API_URL in your .env:
//   VITE_API_URL=http://localhost:4000         (local dev)
//   VITE_API_URL=https://your-app.railway.app  (production)
// ─────────────────────────────────────────────────────────────────────────────

const BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "http://localhost:4000";

// Token helpers — stored in memory (not localStorage) for security
let _token = null;

export function setToken(t)  { _token = t; }
export function getToken()   { return _token; }
export function clearToken() { _token = null; }

// Try to restore token from sessionStorage on page load
// (sessionStorage clears on tab close — safer than localStorage for auth tokens)
if (typeof sessionStorage !== "undefined") {
  const saved = sessionStorage.getItem("fp_token");
  if (saved) _token = saved;
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const get    = (path)        => request("GET",    path);
const post   = (path, body)  => request("POST",   path, body);
const del    = (path)        => request("DELETE", path);

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const auth = {
  login: async (email, password) => {
    const data = await post("/api/auth/login", { email, password });
    setToken(data.token);
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem("fp_token", data.token);
    return data;
  },
  register: async (name, email, password) => {
    const data = await post("/api/auth/register", { name, email, password });
    setToken(data.token);
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem("fp_token", data.token);
    return data;
  },
  // Returns { user } on success, null if no token / token expired
  me: () => {
    if (!_token) return Promise.resolve(null);
    return get("/api/auth/me").catch(err => {
      // 401 = no token or expired — clear stale token and return null
      if (err.status === 401) {
        clearToken();
        if (typeof sessionStorage !== "undefined") sessionStorage.removeItem("fp_token");
      }
      return null;
    });
  },
  logout: async () => {
    try { await post("/api/auth/logout"); } catch {}
    clearToken();
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem("fp_token");
  },
};

// ── ASSESSMENTS ───────────────────────────────────────────────────────────────
export const assessments = {
  list:      ()           => get("/api/assessments"),
  get:       (id)         => get(`/api/assessments/${id}`),
  questions: (id, secId)  => get(`/api/assessments/${id}/sections/${secId}/questions`),
};

// ── PROCTOR ───────────────────────────────────────────────────────────────────
export const proctor = {
  verify: (code, assessmentId) => post("/api/proctor/verify", { code, assessmentId }),
  notify: (code, assessmentTitle) => post("/api/proctor/notify", { code, assessmentTitle }),
};

// ── SESSIONS (in-progress answers) ───────────────────────────────────────────
export const sessions = {
  load:   (sectionId)                          => get(`/api/sessions/${sectionId}`).catch(() => null),
  save:   (sectionId, answers, statuses, time_left) =>
            post(`/api/sessions/${sectionId}`, { answers, statuses, time_left }),
  clear:  (sectionId)                          => del(`/api/sessions/${sectionId}`),
};

// ── SUBMIT ────────────────────────────────────────────────────────────────────
export const submit = {
  section: (sectionId, answers, time_taken) =>
             post(`/api/submit/${sectionId}`, { answers, time_taken }),
  result:  (sectionId) => get(`/api/submit/${sectionId}/result`),
};