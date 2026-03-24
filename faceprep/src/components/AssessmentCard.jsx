// src/components/AssessmentCard.jsx
import React from "react";

export default function AssessmentCard({ assessment, onStartTest }) {
  const isCompleted   = assessment.status === "Completed";
  // reportPending = test was just completed locally; report isn't ready yet
  const reportPending = isCompleted && assessment.reportPending;

  const outlineBtn = {
    flex: 1, padding: "12px 0",
    border: "1.5px solid #d0d0d0", borderRadius: 10,
    background: "#fff", color: "#007bff",
    fontWeight: 400, fontSize: 14, cursor: "pointer",
    fontFamily: "'Space Grotesk', sans-serif",
    transition: "border-color .15s",
  };

  const solidBtn = {
    flex: 1.5, padding: "12px 0",
    border: "none", borderRadius: 10,
    background: "#007bff", color: "#fff",
    fontWeight: 700, fontSize: 15, cursor: "pointer",
    fontFamily: "'Space Grotesk', sans-serif",
  };

  return (
    <div style={{
      background: "#E3EFFF", borderRadius: 16, padding: "18px 18px 0 18px",
      display: "flex", flexDirection: "column", gap: 14, maxWidth: 420,
      boxSizing: "border-box", fontFamily: "'Space Grotesk', sans-serif",
    }}>
      {/* Title + Type */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#111", lineHeight: 1.2, marginBottom: 6 }}>
          {assessment.title}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#007bff", letterSpacing: 0.6 }}>
          {assessment.type || "PRACTICE"}
        </div>
      </div>

      {/* White card */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: "14px 14px 18px",
        display: "flex", flexDirection: "column", gap: 14,
        marginLeft: -18, marginRight: -18,
      }}>
        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "stretch", padding: "4px 0" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, borderRight: "1px solid #e0e0e0", padding: "0 14px" }}>
            <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Total Sections</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{assessment.totalSections ?? "—"}</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, borderRight: "1px solid #e0e0e0", padding: "0 14px" }}>
            <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Total Questions</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{assessment.totalQuestions ?? "—"}</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "0 14px" }}>
            <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Duration</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{assessment.duration ?? "—"}</span>
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          display: "inline-flex", alignItems: "center",
          background: "#e4e4e4", borderRadius: 20, padding: "5px 14px",
          fontSize: 12, color: "#333", fontWeight: 400, width: "fit-content",
        }}>
          Status:&nbsp;<span style={{ fontWeight: 600, color: "#101828" }}>{assessment.status}</span>
        </div>

        {/* Dates — only for completed */}
        {isCompleted && (assessment.startedAt || assessment.completedAt) && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {assessment.startedAt && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Started Date &amp; Time</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#000E6A" }}>{assessment.startedAt}</span>
              </div>
            )}
            {assessment.completedAt && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Completed Date &amp; Time</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#000E6A" }}>{assessment.completedAt}</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {isCompleted ? (
          <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
            {/* Retake — always outline */}
            <button
              style={outlineBtn}
              onMouseOver={e => e.currentTarget.style.borderColor = "#007bff"}
              onMouseOut={e => e.currentTarget.style.borderColor = "#d0d0d0"}
            >
              Retake
            </button>

            {/* View Report — outline when report not ready, solid blue when ready */}
            {reportPending ? (
              <button
                style={{ ...outlineBtn, flex: 1.5, cursor: "not-allowed", opacity: 0.6 }}
                disabled
                title="Report will be available shortly"
              >
                View Report
              </button>
            ) : (
              <button style={solidBtn}>View Report</button>
            )}
          </div>
        ) : (
          <button onClick={onStartTest} style={{
            width: "100%", padding: "12px 0", border: "none", borderRadius: 10,
            background: "#007bff", color: "#fff", fontWeight: 600, fontSize: 15,
            cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Start Test
          </button>
        )}
      </div>
    </div>
  );
}