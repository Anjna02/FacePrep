// src/pages/AssessmentsPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AssessmentCard from "../components/AssessmentCard";
import StartAssessmentModal from "../components/StartAssessmentModal";
import { assessments as api } from "../api/api";

// ── All completed tests — single source of truth ──────────────────────────────
const STATIC_COMPLETED_MAP = {
  "ratio and proportion | piet - 21 march 2026": {
    id: "static-1", title: "Ratio and proportion | PIET - 21 March 2026",
    type: "PRACTICE", total_sections: 1, total_questions: 10, duration: "5m 22s",
    startedAt: "Mar 21, 2026 5:18 PM", completedAt: "Mar 21, 2026 5:23 PM",
    _sortTs: new Date("2026-03-21T17:23:00"),
  },
  "benchmark test | piet | 20 mar": {
    id: "static-2", title: "Benchmark Test | PIET | 20 Mar",
    type: "PRACTICE", total_sections: 6, total_questions: 57, duration: "110m 13s",
    startedAt: "Mar 20, 2026 10:13 AM", completedAt: "Mar 20, 2026 12:04 PM",
    _sortTs: new Date("2026-03-20T12:04:00"),
  },
  "benchmark test | piet | 16 mar": {
    id: "static-3", title: "Benchmark Test | PIET | 16 Mar",
    type: "PRACTICE", total_sections: 6, total_questions: 57, duration: "114m 28s",
    startedAt: "Mar 16, 2026 10:31 AM", completedAt: "Mar 16, 2026 12:25 PM",
    _sortTs: new Date("2026-03-16T12:25:00"),
  },
  "weekly test | pu - 14 march 2026": {
    id: "static-4", title: "Weekly Test | PU - 14 March 2026",
    type: "PRACTICE", total_sections: 1, total_questions: 10, duration: "8m 48s",
    startedAt: "Mar 14, 2026 9:03 PM", completedAt: "Mar 14, 2026 9:12 PM",
    _sortTs: new Date("2026-03-14T21:12:00"),
  },
  "benchmark practice test - 15 | 1 mar": {
    id: "static-5", title: "Benchmark Practice Test - 15 | 1 MAR",
    type: "PRACTICE", total_sections: 6, total_questions: 57, duration: "81m 0s",
    startedAt: "Mar 13, 2026 7:48 PM", completedAt: "Mar 13, 2026 9:09 PM",
    _sortTs: new Date("2026-03-13T21:09:00"),
  },
  "benchmark practice test - 14 | 1 mar": {
    id: "static-6", title: "Benchmark Practice Test - 14 | 1 MAR",
    type: "PRACTICE", total_sections: 6, total_questions: 57, duration: "91m 2s",
    startedAt: "Mar 13, 2026 11:24 AM", completedAt: "Mar 13, 2026 12:55 PM",
    _sortTs: new Date("2026-03-13T12:55:00"),
  },
  "benchmark practice test - 13 | 1 mar": {
    id: "static-7", title: "Benchmark Practice Test - 13 | 1 MAR",
    type: "PRACTICE", total_sections: 6, total_questions: 57, duration: "76m 47s",
    startedAt: "Mar 12, 2026 9:32 PM", completedAt: "Mar 12, 2026 10:49 PM",
    _sortTs: new Date("2026-03-12T22:49:00"),
  },
  "benchmark practice test - 12 | 1 mar": {
    id: "static-8", title: "Benchmark Practice Test - 12 | 1 MAR",
    type: "PRACTICE", total_sections: 6, total_questions: 57, duration: "84m 39s",
    startedAt: "Mar 11, 2026 10:36 PM", completedAt: "Mar 12, 2026 12:00 AM",
    _sortTs: new Date("2026-03-12T00:00:00"),
  },
  "benchmark practice test - 11 | 1 mar": {
    id: "static-9", title: "Benchmark Practice Test - 11 | 1 MAR",
    type: "PRACTICE", total_sections: 6, total_questions: 57, duration: "88m 36s",
    startedAt: "Mar 10, 2026 9:46 PM", completedAt: "Mar 10, 2026 11:14 PM",
    _sortTs: new Date("2026-03-10T23:14:00"),
  },
  "benchmark practice test - 10 | 1 mar": {
    id: "static-10", title: "Benchmark Practice Test - 10 | 1 MAR",
    type: "PRACTICE", total_sections: 6, total_questions: 57, duration: "91m 53s",
    startedAt: "Mar 9, 2026 9:37 PM", completedAt: "Mar 9, 2026 11:09 PM",
    _sortTs: new Date("2026-03-09T23:09:00"),
  },
};

const STORAGE_KEY = "fp_local_completed_tests";

const normalise = (title = "") => title.trim().toLowerCase();

function buildCompletedList(serverCompleted) {
  const serverByTitle = {};
  (serverCompleted || []).forEach((item) => {
    serverByTitle[normalise(item.title)] = item;
  });

  return Object.entries(STATIC_COMPLETED_MAP)
    .map(([key, staticItem]) => {
      const serverItem = serverByTitle[key];
      if (!serverItem) return staticItem;
      return { ...staticItem, id: serverItem.id };
    })
    .sort((a, b) => b._sortTs - a._sortTs);
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadPersistedCompleted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePersistedCompleted(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // storage full or private mode — silently ignore
  }
}
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 14 }}>
      <svg width="90" height="90" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.35 }}>
        <circle cx="52" cy="10" r="10" fill="#b0b8cc" />
        <rect x="10" y="30" width="60" height="38" rx="4" fill="#c8cfe0" />
        <rect x="18" y="22" width="44" height="28" rx="3" fill="#dce2f0" />
        <rect x="24" y="30" width="32" height="3" rx="1.5" fill="#b0b8cc" />
        <rect x="24" y="36" width="22" height="3" rx="1.5" fill="#b0b8cc" />
      </svg>
      <span style={{ fontSize: 13, color: "#aaa", fontStyle: "italic", fontFamily: "'Space Grotesk',sans-serif" }}>No Assessments Found.</span>
    </div>
  );
}

export default function AssessmentsPage({ onNavigate, onStartTest, username, onLogout, localCompletedTests = [] }) {
  const [activeTab,           setActiveTab]           = useState("active");
  const [activeList,          setActiveList]          = useState([]);
  const [serverCompletedList, setServerCompletedList] = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [showStartModal,      setShowStartModal]      = useState(false);
  const [selectedAssessment,  setSelectedAssessment]  = useState(null);

  // ── Persist localCompletedTests to localStorage whenever the prop changes ──
  // Merge incoming prop with what's already persisted (in case of refresh)
  const [persistedCompleted, setPersistedCompleted] = useState(() => loadPersistedCompleted());

  useEffect(() => {
    if (localCompletedTests.length === 0) return;

    // Merge new local completions into persisted list (dedup by id)
    setPersistedCompleted(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const fresh = localCompletedTests.filter(t => !existingIds.has(t.id));
      if (fresh.length === 0) return prev;
      const merged = [...fresh, ...prev];
      savePersistedCompleted(merged);
      return merged;
    });
  }, [localCompletedTests]);

  useEffect(() => {
    api.list()
      .then(({ active, completed }) => {
        setActiveList(active || []);
        setServerCompletedList(buildCompletedList(completed));
      })
      .catch(() => {
        setServerCompletedList(buildCompletedList([]));
      })
      .finally(() => setLoading(false));
  }, []);

  // All locally completed IDs (prop + persisted across refreshes)
  const allLocalCompleted = (() => {
    const seen = new Set();
    return [...localCompletedTests, ...persistedCompleted].filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  })();

  const localIds     = new Set(allLocalCompleted.map(t => t.id));
  const serverTitles = new Set(serverCompletedList.map(t => normalise(t.title)));

  // Remove from Active any test completed locally (even after refresh)
  const mergedActiveList = activeList.filter(a => !localIds.has(a.id));

  // Prepend local completions (most recent first) before static/server list
  const dedupedLocal        = allLocalCompleted.filter(t => !serverTitles.has(normalise(t.title)));
  const mergedCompletedList = [...dedupedLocal, ...serverCompletedList];

  // IDs completed locally — these get the "no report yet" treatment in the card
  // We persist this set too so the button state survives refresh
  const locallyCompletedIds = new Set(allLocalCompleted.map(t => t.id));

  function handleStartTest(assessment) {
    setSelectedAssessment(assessment);
    setShowStartModal(true);
  }
  function handleConfirmStart() {
    setShowStartModal(false);
    onStartTest(selectedAssessment);
  }

  const tabStyle = (tab) => ({
    padding: "10px 20px 12px", fontSize: 14, fontWeight: 600,
    fontFamily: "'Space Grotesk',sans-serif",
    color: activeTab === tab ? "#1a5cff" : "#888",
    cursor: "pointer", border: "none", background: "none",
    borderBottom: activeTab === tab ? "3px solid #1a5cff" : "3px solid transparent",
  });
  const badgeStyle = {
    background: "#f5c518", color: "#111", fontWeight: 700, fontSize: 12,
    fontFamily: "'Space Grotesk',sans-serif", padding: "2px 8px",
    borderRadius: 10, minWidth: 28, textAlign: "center",
  };
  const gridStyle = {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#e8eaed", fontFamily: "'Space Grotesk',sans-serif" }}>
      <Navbar activePage="assessments" onNavigate={onNavigate} username={username} onLogout={onLogout} />

      <div style={{ background: "#fffbe6", borderBottom: "1px solid #e0ddd0", padding: "22px 48px 0" }}>
        <h2 style={{ fontSize: 32, fontWeight: 400, color: "#191919", marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Assessments</h2>
        <div style={{ display: "flex", gap: 0 }}>
          <button style={tabStyle("active")}    onClick={() => setActiveTab("active")}>Active</button>
          <button style={tabStyle("completed")} onClick={() => setActiveTab("completed")}>Completed</button>
        </div>
      </div>

      <div style={{ padding: "28px 48px" }}>
        {loading ? (
          <div style={{ color: "#aaa", fontFamily: "'Space Grotesk',sans-serif", fontSize: 14 }}>Loading assessments…</div>
        ) : activeTab === "active" ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 400, color: "#1a5cff", marginBottom: 24, fontFamily: "'Space Grotesk',sans-serif" }}>
              Active Assessments <span style={badgeStyle}>{mergedActiveList.length}</span>
            </div>
            {mergedActiveList.length === 0 ? <EmptyState /> : (
              <div style={gridStyle}>
                {mergedActiveList.map((a) => (
                  <AssessmentCard key={a.id} assessment={{
                    ...a,
                    totalSections:  a.total_sections,
                    totalQuestions: a.total_questions,
                    duration:       `${a.duration_mins}m`,
                    startDate:      a.start_date,
                    status:         "Active",
                  }} onStartTest={() => handleStartTest(a)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 400, color: "#1a5cff", marginBottom: 24, fontFamily: "'Space Grotesk',sans-serif" }}>
              Completed Assessments <span style={badgeStyle}>{mergedCompletedList.length}</span>
            </div>
            {mergedCompletedList.length === 0 ? <EmptyState /> : (
              <div style={gridStyle}>
                {mergedCompletedList.map((a) => (
                  <AssessmentCard key={a.id} assessment={{
                    ...a,
                    totalSections:  a.total_sections  || a.totalSections,
                    totalQuestions: a.total_questions || a.totalQuestions,
                    duration:       a.duration || `${a.duration_mins}m`,
                    status:         "Completed",
                    startedAt:      a.startedAt   || "",
                    completedAt:    a.completedAt || "",
                    // Flag: report not ready yet for locally-completed tests
                    reportPending:  locallyCompletedIds.has(a.id),
                  }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <StartAssessmentModal
        open={showStartModal}
        onConfirm={handleConfirmStart}
        onCancel={() => setShowStartModal(false)}
      />
    </div>
  );
}