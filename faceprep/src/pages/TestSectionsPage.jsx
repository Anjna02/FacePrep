import React from "react";
import SectionCard from "../components/SectionCard";
import { testSections } from "../data/assessments";

function safeExitFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) return;
  try {
    document.exitFullscreen?.() ?? document.webkitExitFullscreen?.() ?? document.mozCancelFullScreen?.() ?? document.msExitFullscreen?.();
  } catch (e) {}
}

export default function TestSectionsPage({ onNavigate, onEndTest, onStartSection }) {

  function handleEndTest() {
    if (window.confirm("Are you sure you want to end the test?")) {
      safeExitFullscreen();
      onEndTest();
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ background: "#dce8f5", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Navbar */}
        <div style={{ padding: "10px 16px", background: "#dce8f5", position: "sticky", top: 0, zIndex: 100 }}>
          <nav style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 24px", borderRadius: "999px",
            background: "#1a5cff", boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 32, height: 32, background: "#e53c2b",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 16,
                clipPath: "polygon(15% 0%,85% 0%,100% 15%,100% 85%,85% 100%,15% 100%,0% 85%,0% 15%)",
              }}>✕</div>
              <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>FACE</span>
              <span style={{ background: "#e53c2b", color: "#fff", fontSize: 22, fontWeight: 700, padding: "1px 8px" }}>Prep</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Benchmark Test | PIET | 20 Mar</div>
            <button
              onClick={handleEndTest}
              style={{
                background: "#e53c2b", color: "#fff", border: "none",
                padding: "8px 20px", borderRadius: 6, fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
              }}
              onMouseOver={e => e.currentTarget.style.background = "#c42f1f"}
              onMouseOut={e => e.currentTarget.style.background = "#e53c2b"}
            >
              End Test
            </button>
          </nav>
        </div>

        <div style={{ padding: "28px 32px" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 24 }}>All Sections</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {testSections.slice(0, 4).map((section, i) => (
              <SectionCard key={section.id} section={section} index={i} onStartSection={onStartSection} />
            ))}
          </div>

          {testSections.length > 4 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 18 }}>
              {testSections.slice(4).map((section, i) => (
                <SectionCard key={section.id} section={section} index={i + 4} onStartSection={onStartSection} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}