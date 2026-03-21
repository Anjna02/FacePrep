import React from "react";

// Add this to your index.html <head> or global CSS:
// <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

export default function AssessmentCard({ assessment, onStartTest }) {
  const isCompleted = assessment.status === "Completed";

  return (
    <div style={{
      background: "#E3EFFF",
      borderRadius: 16,
      padding: "18px 18px 0px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      maxWidth: 420,
      boxSizing: "border-box",
      fontFamily: "'Space Grotesk', sans-serif",
    }}>

      {/* Title + Type — stays on blue bg */}
      <div>
        <div style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#111",
          lineHeight: 1.2,
          marginBottom: 6,
        }}>
          {assessment.title}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#007bff",
          letterSpacing: 0.6,
        }}>
          {assessment.type}
        </div>
      </div>

      {/* White section: stats + status + dates + button */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: "14px 14px 18px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        marginLeft: -18,
        marginRight: -18,
      }}>

        {/* Stats row with dividers */}
        <div style={{
          display: "flex",
          alignItems: "stretch",
          padding: "4px 0",
        }}>
          {/* Total Sections */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 4,
            borderRight: "1px solid #e0e0e0",
            padding: "0 14px",
          }}>
            <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Total Sections</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{assessment.totalSections}</span>
          </div>

          {/* Total Questions */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 4,
            borderRight: "1px solid #e0e0e0",
            padding: "0 14px",
          }}>
            <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Total Questions</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{assessment.totalQuestions}</span>
          </div>

          {/* Duration */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 4,
            padding: "0 14px",
          }}>
            <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Duration</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>
              {assessment.duration}
            </span>
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#e4e4e4",
          borderRadius: 20,
          padding: "5px 14px",
          fontSize: 12,
          color: "#333",
          fontWeight: 400,
          width: "fit-content",
        }}>
          Status:&nbsp;<span style={{ fontWeight: 600, color: "#101828" }}>{assessment.status}</span>
        </div>

        {/* Dates */}
        <div style={{ display: "flex", gap: 20 }}>
          {isCompleted ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Started Date &amp; Time</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#000E6A" }}>{assessment.startedAt}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400 }}>Completed Date &amp; Time</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#000E6A" }}>{assessment.completedAt}</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }} />
          )}
        </div>

        {/* Action buttons */}
        {isCompleted ? (
          <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
            <button
              style={{
                flex: 1,
                padding: "12px 0",
                border: "1.5px solid #d0d0d0",
                borderRadius: 10,
                background: "#fff",
                color: "#007bff",
                fontWeight: 400,
                fontSize: 14,
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = "#007bff"}
              onMouseOut={e => e.currentTarget.style.borderColor = "#d0d0d0"}
            >
              Retake
            </button>
            <button
              style={{
                flex: 1.5,
                padding: "12px 0",
                border: "none",
                borderRadius: 10,
                background: "#007bff",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              View Report
            </button>
          </div>
        ) : (
          <button
            onClick={onStartTest}
            style={{
              width: "100%",
              padding: "12px 0",
              border: "none",
              borderRadius: 10,
              background: "#007bff",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Start Test
          </button>
        )}
      </div>
    </div>
  );
}