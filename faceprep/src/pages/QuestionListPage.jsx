import React, { useState, useEffect } from "react";
import { sectionQuestions } from "../data/sectionQuestions";

const STATUS_COLORS = {
  unanswered: "#9e9e9e",
  current:    "#9e9e9e",   // treat "current" same as unanswered in list view
  answered:   "#28a745",
  revisit:    "#f5a623",
};

// Read statuses saved by MCQPage — falls back to all-unanswered
function loadStatuses(sectionTitle, totalQ) {
  try {
    const raw = localStorage.getItem(`mcq_statuses_${sectionTitle}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === totalQ) return parsed;
    }
  } catch {}
  return Array(totalQ).fill("unanswered");
}

export default function QuestionListPage({ section, onOpenQuestion, onSubmitSection }) {
  const sectionTitle = section?.title || "Ratio and proportion";
  const questions    = sectionQuestions[sectionTitle] || sectionQuestions["Quantitative Aptitude"];
  const totalQ       = questions.length;

  // Load from localStorage on mount, then poll for changes (e.g. back-navigation from MCQPage)
  const [statuses, setStatuses] = useState(() => loadStatuses(sectionTitle, totalQ));

  // Re-read localStorage every time the list page becomes visible
  useEffect(() => {
    function sync() {
      setStatuses(loadStatuses(sectionTitle, totalQ));
    }
    // Sync on mount
    sync();
    // Sync when user navigates back to this tab/window
    window.addEventListener("focus", sync);
    // Sync on localStorage changes from another tab
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sectionTitle, totalQ]);

  const answeredCount = statuses.filter(s => s === "answered").length;
  const revisitCount  = statuses.filter(s => s === "revisit").length;
  const yetCount      = statuses.filter(s => s === "unanswered" || s === "current").length;

  function handleRowClick(idx) {
    onOpenQuestion?.(idx);
  }

  function handleSubmitSection() {
    if (window.confirm(`Submit "${sectionTitle}"?`)) {
      // Clear saved state
      try {
        localStorage.removeItem(`mcq_answers_${sectionTitle}`);
        localStorage.removeItem(`mcq_statuses_${sectionTitle}`);
        localStorage.removeItem(`mcq_time_${sectionTitle}`);
      } catch {}
      onSubmitSection?.();
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ql-root {
          min-height: 100vh;
          background: #f0f2f5;
          font-family: 'Space Grotesk', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── NAV ── */
        .ql-nav {
          display: flex; align-items: center; justify-content: space-between;
          height: 52px; background: #fff; border-bottom: 1px solid #e0e4ed;
          position: sticky; top: 0; z-index: 100; flex-shrink: 0;
        }
        .ql-nav-logo { display: flex; align-items: stretch; height: 100%; }
        .ql-logo-blue {
          background: #1a5cff; color: #fff; font-weight: 900; font-size: 16px;
          padding: 0 14px; display: flex; align-items: center; gap: 6px;
        }
        .ql-logo-x {
          display: inline-flex; width: 22px; height: 22px; background: #e53c2b;
          align-items: center; justify-content: center; font-size: 12px;
          font-weight: 900; color: #fff;
          clip-path: polygon(15% 0%,85% 0%,100% 15%,100% 85%,85% 100%,15% 100%,0% 85%,0% 15%);
        }
        .ql-logo-red {
          background: #e53c2b; color: #fff; font-weight: 900; font-size: 16px;
          padding: 0 14px; display: flex; align-items: center;
        }
        .ql-nav-center { font-size: 14px; font-weight: 600; color: #222; }
        .ql-nav-right { display: flex; align-items: center; gap: 16px; padding-right: 20px; }
        .ql-submit-section-btn {
          padding: 8px 20px; background: #e53c2b; color: #fff; border: none;
          border-radius: 6px; font-size: 13px; font-weight: 700;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
        }
        .ql-submit-section-btn:hover { background: #c42f1f; }

        /* ── BODY ── */
        .ql-body {
          flex: 1; padding: 24px 28px 48px;
          max-width: 1100px; width: 100%; margin: 0 auto;
        }

        /* ── SECTION HEADER ── */
        .ql-section-head {
          display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
        }
        .ql-section-title { font-size: 22px; font-weight: 700; color: #111; }
        .ql-score-badge {
          background: #f5c518; color: #111; font-size: 13px;
          font-weight: 700; padding: 3px 12px; border-radius: 20px;
        }

        /* ── LEGEND BAR ── */
        .ql-legend {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid #e4e8f0; border-radius: 10px;
          padding: 10px 18px; margin-bottom: 18px;
          font-size: 13px; color: #444; flex-wrap: wrap;
        }
        .ql-legend-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
        .ql-legend-sep { color: #d0d4dc; margin: 0 4px; font-size: 16px; line-height: 1; }

        /* ── QUESTION ROWS ── */
        .ql-question-row {
          display: flex; align-items: center; gap: 14px;
          background: #fff; border: 1.5px solid #e8ecf4; border-radius: 10px;
          padding: 14px 18px; margin-bottom: 10px; cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .ql-question-row:hover {
          border-color: #1a5cff;
          box-shadow: 0 0 0 3px rgba(26,92,255,0.09);
          background: #f7f9ff;
        }

        /* Status dot — animated pulse on "current" */
        .ql-status-dot {
          width: 13px; height: 13px; border-radius: 50%; flex-shrink: 0;
          transition: background 0.3s;
        }
        .ql-status-dot.pulse {
          animation: ql-pulse 1.8s ease-in-out infinite;
        }
        @keyframes ql-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(26,92,255,0.5); }
          50%       { box-shadow: 0 0 0 5px rgba(26,92,255,0); }
        }

        .ql-type-tag {
          font-size: 11px; font-weight: 700; color: #1a5cff;
          letter-spacing: 0.5px; min-width: 36px; flex-shrink: 0;
        }
        .ql-q-text {
          font-size: 14px; color: #222; font-weight: 400;
          line-height: 1.5; flex: 1;
        }

        /* Status pill badge on the right */
        .ql-status-pill {
          font-size: 11px; font-weight: 600; padding: 3px 10px;
          border-radius: 20px; flex-shrink: 0; letter-spacing: 0.2px;
        }
        .ql-status-pill.answered  { background: #e6f9ec; color: #1a7a35; }
        .ql-status-pill.revisit   { background: #fff4e0; color: #b96d00; }
        .ql-status-pill.unanswered { display: none; }
        .ql-status-pill.current   { display: none; }

        .ql-footer {
          text-align: center; font-size: 13px; color: #aaa; margin-top: 32px;
        }
        .ql-footer strong { color: #555; font-weight: 600; }
      `}</style>

      <div className="ql-root">

        {/* NAV */}
        <div className="ql-nav">
          <div className="ql-nav-logo">
            <div className="ql-logo-blue"><span className="ql-logo-x">✕</span>FACE</div>
            <div className="ql-logo-red">Prep</div>
          </div>
          <div className="ql-nav-center">{sectionTitle} | PIET - 21 March 2026</div>
          <div className="ql-nav-right">
            <button className="ql-submit-section-btn" onClick={handleSubmitSection}>
              Submit Section
            </button>
          </div>
        </div>

        <div className="ql-body">

          {/* Section header */}
          <div className="ql-section-head">
            <span className="ql-section-title">{sectionTitle}</span>
            <span className="ql-score-badge">{answeredCount} / {totalQ}</span>
          </div>

          {/* Legend */}
          <div className="ql-legend">
            <span className="ql-legend-dot" style={{ background: STATUS_COLORS.unanswered }} />
            <span>Yet-To-Answer ({yetCount})</span>
            <span className="ql-legend-sep">|</span>
            <span className="ql-legend-dot" style={{ background: STATUS_COLORS.answered }} />
            <span>Answered ({answeredCount})</span>
            <span className="ql-legend-sep">|</span>
            <span className="ql-legend-dot" style={{ background: STATUS_COLORS.revisit }} />
            <span>Revisit ({revisitCount})</span>
          </div>

          {/* Question rows */}
          {questions.map((q, idx) => {
            const status   = statuses[idx] || "unanswered";
            const dotColor = STATUS_COLORS[status];
            const isPulse  = status === "current";

            return (
              <div
                key={q.id ?? idx}
                className="ql-question-row"
                onClick={() => handleRowClick(idx)}
              >
                {/* Color dot — grey / green / orange */}
                <span
                  className={`ql-status-dot${isPulse ? " pulse" : ""}`}
                  style={{ background: dotColor }}
                />

                {/* MCQ tag */}
                <span className="ql-type-tag">{q.type || "MCQ"}</span>

                {/* Question text */}
                <span className="ql-q-text">{q.text}</span>

                {/* Small status pill for answered / revisit */}
                <span className={`ql-status-pill ${status}`}>
                  {status === "answered" ? "Answered" : status === "revisit" ? "Revisit" : ""}
                </span>
              </div>
            );
          })}

          <div className="ql-footer">Powered by <strong>Faceprep</strong></div>
        </div>
      </div>
    </>
  );
}