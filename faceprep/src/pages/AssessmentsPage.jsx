import React, { useState } from "react";
import Navbar from "../components/Navbar";
import AssessmentCard from "../components/AssessmentCard";
import StartAssessmentModal from "../components/StartAssessmentModal";
import { activeAssessments, completedAssessments } from "../data/assessments";

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 14 }}>
      <svg width="90" height="90" viewBox="0 0 80 80" fill="none" style={{ opacity: 0.35 }}>
        <circle cx="52" cy="10" r="10" fill="#b0b8cc"/>
        <circle cx="48" cy="10" r="2.5" fill="#fff"/>
        <circle cx="52" cy="10" r="2.5" fill="#fff"/>
        <circle cx="56" cy="10" r="2.5" fill="#fff"/>
        <rect x="10" y="30" width="60" height="38" rx="4" fill="#c8cfe0"/>
        <rect x="18" y="22" width="44" height="28" rx="3" fill="#dce2f0"/>
        <rect x="24" y="30" width="32" height="3" rx="1.5" fill="#b0b8cc"/>
        <rect x="24" y="36" width="22" height="3" rx="1.5" fill="#b0b8cc"/>
        <path d="M10 52 Q40 62 70 52 L70 68 Q40 72 10 68 Z" fill="#aab2c8"/>
      </svg>
      <span style={{ fontSize: 13, color: "#aaa", fontStyle: "italic", fontFamily: "'Space Grotesk', sans-serif" }}>No Assessments Found.</span>
    </div>
  );
}

export default function AssessmentsPage({ onNavigate, onStartTest, username, onLogout }) {
  const [activeTab, setActiveTab] = useState("completed");

  // ── Modal state ──────────────────────────────────────────
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  function handleStartTest(assessment) {
    setSelectedAssessment(assessment);
    setShowStartModal(true);
  }

  function handleConfirmStart() {
    setShowStartModal(false);
    onStartTest(selectedAssessment); // continues to ProctorVerify → TestSections
  }
  // ─────────────────────────────────────────────────────────

  const tabStyle = (tab) => ({
    padding: "10px 20px 12px",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Space Grotesk', sans-serif",
    color: activeTab === tab ? "#1a5cff" : "#888",
    cursor: "pointer",
    border: "none",
    background: "none",
    borderBottom: activeTab === tab ? "3px solid #1a5cff" : "3px solid transparent",
  });

  const badgeStyle = {
    background: "#f5c518",
    color: "#111",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "'Space Grotesk', sans-serif",
    padding: "2px 8px",
    borderRadius: 10,
    minWidth: 28,
    textAlign: "center",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#e8eaed", fontFamily: "'Space Grotesk', sans-serif" }}>
      <Navbar activePage="assessments" onNavigate={onNavigate} username={username} onLogout={onLogout} />

      {/* Header */}
      <div style={{ background: "#fffbe6", borderBottom: "1px solid #e0ddd0", padding: "22px 48px 0" }}>
        <h2 style={{ fontSize: 32, fontWeight: 400, color: "#191919", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Assessments</h2>
        <div style={{ display: "flex", gap: 0 }}>
          <button style={tabStyle("active")} onClick={() => setActiveTab("active")}>Active</button>
          <button style={tabStyle("completed")} onClick={() => setActiveTab("completed")}>Completed</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "28px 48px" }}>
        {activeTab === "active" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 400, color: "#1a5cff", marginBottom: 24, fontFamily: "'Space Grotesk', sans-serif" }}>
              Active Assessments <span style={badgeStyle}>{activeAssessments.length}</span>
            </div>
            {activeAssessments.length === 0 ? (
              <EmptyState />
            ) : (
              <div style={gridStyle}>
                {activeAssessments.map(a => (
                  <AssessmentCard
                    key={a.id}
                    assessment={a}
                    onStartTest={() => handleStartTest(a)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 400, color: "#1a5cff", marginBottom: 24, fontFamily: "'Space Grotesk', sans-serif" }}>
              Completed Assessments <span style={badgeStyle}>{completedAssessments.length}</span>
            </div>
            {completedAssessments.length === 0 ? (
              <EmptyState />
            ) : (
              <div style={gridStyle}>
                {completedAssessments.map(a => (
                  <AssessmentCard key={a.id} assessment={a} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Start Assessment Modal ── */}
      <StartAssessmentModal
        open={showStartModal}
        onConfirm={handleConfirmStart}
        onCancel={() => setShowStartModal(false)}
      />
    </div>
  );
}