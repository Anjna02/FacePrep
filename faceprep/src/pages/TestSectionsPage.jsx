// src/pages/TestSectionsPage.jsx
import React, { useState, useEffect } from "react";
import SectionCard from "../components/SectionCard";
import { assessments as api } from "../api/api";
import banner2 from "../assets/banner2.png";

export default function TestSectionsPage({ assessment, onEndTest, onStartSection }) {
  const [sections,    setSections]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    if (!assessment?.id) return;
    api.get(assessment.id)
      .then(data => setSections(data.sections || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assessment?.id]);

  // Compute total answered across all sections from SectionCard completed state
  const totalQ        = sections.reduce((a, s) => a + (s.total_questions || 0), 0);
  const totalAnswered = sections.reduce((a, s) => a + (s.answered_count  || 0), 0);
  const totalSections = sections.length;

  function handleConfirmEnd() {
    // Exit fullscreen NOW — only on End Test confirm
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      try { document.exitFullscreen?.() || document.webkitExitFullscreen?.(); } catch {}
    }
    setShowEndModal(false);
    onEndTest();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .ts-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;font-family:'Space Grotesk',sans-serif}
        .ts-modal{background:#fff;border-radius:14px;width:480px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.22)}
        .ts-modal-title{font-size:17px;font-weight:700;color:#111;padding:22px 24px 6px}
        .ts-modal-sub{font-size:13px;color:#888;padding:0 24px 16px}
        .ts-modal-divider{height:1px;background:#f0f2f5;margin:0}
        .ts-modal-table{width:100%;border-collapse:collapse;padding:0 24px}
        .ts-modal-table tr td{padding:13px 24px;font-size:14px;color:#222;border-bottom:1px solid #f5f7fb}
        .ts-modal-table tr td:last-child{font-weight:700;text-align:right}
        .ts-modal-note{font-size:13px;color:#444;padding:14px 24px 4px}
        .ts-modal-footer{display:flex;justify-content:flex-end;gap:12px;padding:18px 24px}
        .ts-modal-cancel{padding:10px 22px;background:none;border:1.5px solid #dde1ea;border-radius:8px;font-size:14px;font-weight:600;color:#333;cursor:pointer;font-family:'Space Grotesk',sans-serif}
        .ts-modal-cancel:hover{background:#f5f6f9}
        .ts-modal-submit{padding:10px 28px;background:#1a5cff;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Space Grotesk',sans-serif}
        .ts-modal-submit:hover{background:#0d47e0}
      `}</style>

      {/* END TEST MODAL */}
      {showEndModal && (
        <div className="ts-modal-overlay">
          <div className="ts-modal">
            <div className="ts-modal-title">Are you sure you want to submit the test?</div>
            <div className="ts-modal-sub">Please review your attempt summary before submitting.</div>
            <div className="ts-modal-divider" />
            <table className="ts-modal-table">
              <tbody>
                <tr><td>Total Questions</td><td>{totalQ}</td></tr>
                <tr><td>Answered</td><td>{totalAnswered}</td></tr>
                <tr><td>Not Answered</td><td>{totalQ - totalAnswered}</td></tr>
              </tbody>
            </table>
            {totalAnswered === totalQ
              ? <div className="ts-modal-note" style={{color:"#28a745"}}>✅ All questions are answered. You can submit the test.</div>
              : <div className="ts-modal-note" style={{color:"#f5a623"}}>⚠️ {totalQ - totalAnswered} question(s) not answered.</div>
            }
            <div className="ts-modal-footer">
              <button className="ts-modal-cancel" onClick={() => setShowEndModal(false)}>Cancel</button>
              <button className="ts-modal-submit" onClick={handleConfirmEnd}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: "#dce8f5", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
        {/* NAV */}
        <div style={{ background: "#fff", borderBottom: "2px solid #e0e4ed", position: "sticky", top: 0, zIndex: 100 }}>
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
            <div style={{ display: "flex", alignItems: "center", height: "100%", background: "#152d6e", padding: "0 20px", flexShrink: 0 }}>
              <img src={banner2} alt="FacePrep" style={{ height: 34, objectFit: "contain" }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#222", flex: 1, paddingLeft: 28 }}>
              {assessment?.title || "Benchmark Test"}
            </div>
            <button
              onClick={() => setShowEndModal(true)}
              style={{ background: "#e53c2b", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", marginRight: 20 }}
              onMouseOver={e => e.currentTarget.style.background = "#c42f1f"}
              onMouseOut={e => e.currentTarget.style.background = "#e53c2b"}>
              End Test
            </button>
          </nav>
        </div>

        <div style={{ padding: "28px 32px" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 24 }}>All Sections</div>
          {loading ? (
            <div style={{ color: "#aaa", fontSize: 14 }}>Loading sections…</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
              {sections.map((section, i) => (
                <SectionCard
                  key={section.id}
                  section={{
                    ...section,
                    assessment_id:  section.assessment_id,
                    totalQuestions: section.total_questions,
                    totalMarks:     section.total_marks,
                    duration:       `${section.duration_mins} Mins`,
                    typeCount:      section.total_questions,
                  }}
                  index={i}
                  onStartSection={onStartSection}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}