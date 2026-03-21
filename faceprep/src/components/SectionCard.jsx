import React from "react";

export default function SectionCard({ section, index, onStartSection }) {
  const animDelay = `${(index + 1) * 0.05}s`;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
      display: "flex",
      flexDirection: "column",
      animation: `fadeUp 0.4s ${animDelay} ease both`,
      border: "1px solid #e8edf5",
    }}>

      {/* Header — light blue */}
      <div style={{
        background: "#89b4f7",
        padding: "18px 20px 16px",
      }}>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#111",
          lineHeight: 1.3,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {section.title}
        </div>
      </div>

      {/* Body */}
      <div style={{
        padding: "18px 20px 14px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        fontFamily: "'Space Grotesk', sans-serif",
      }}>

        {/* Stats row with dividers */}
        <div style={{ display: "flex", alignItems: "stretch" }}>

          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            borderRight: "1px solid #e0e0e0",
            paddingRight: 16,
          }}>
            <span style={{ fontSize: 12, color: "#999", fontWeight: 400, lineHeight: 1.3 }}>
              Total<br />Questions
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
              {section.totalQuestions}
            </span>
          </div>

          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            borderRight: "1px solid #e0e0e0",
            padding: "0 16px",
          }}>
            <span style={{ fontSize: 12, color: "#999", fontWeight: 400 }}>Total Marks</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
              {section.totalMarks}
            </span>
          </div>

          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            paddingLeft: 16,
          }}>
            <span style={{ fontSize: 12, color: "#999", fontWeight: 400 }}>Duration</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
              {section.duration}
            </span>
          </div>

        </div>

        {/* Type pill */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#f0f0f0",
          borderRadius: 20,
          padding: "4px 12px",
          fontSize: 12,
          color: "#333",
          fontWeight: 400,
          width: "fit-content",
        }}>
          {section.type}:<strong style={{ marginLeft: 2, fontWeight: 700 }}>{section.typeCount}</strong>
        </div>

      </div>

      {/* Footer button */}
      <div style={{ padding: "0 20px 18px" }}>
        {section.completed ? (
          <button style={{
            width: "100%",
            padding: "12px 0",
            border: "1.5px solid #ccc",
            borderRadius: 9,
            background: "#f5f5f5",
            color: "#999",
            fontSize: 14,
            fontWeight: 600,
            cursor: "default",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Completed ✓
          </button>
        ) : (
          <button
            onClick={() => onStartSection && onStartSection(section)}
            style={{
              width: "100%",
              padding: "13px 0",
              border: "none",
              borderRadius: 9,
              background: "#1a5cff",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "background 0.15s, transform 0.1s, box-shadow 0.15s",
              boxShadow: "0 3px 10px rgba(26,92,255,0.28)",
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "#0d47e0";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 5px 14px rgba(26,92,255,0.4)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "#1a5cff";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 3px 10px rgba(26,92,255,0.28)";
            }}
          >
            Start Section
          </button>
        )}
      </div>

    </div>
  );
}