import React, { useState, useEffect } from "react";
import { sectionQuestions } from "../data/sectionQuestions";

function getOptions(questionText, qIndex) {
  const optionSets = [
    ["10", "8", "9", "7"],
    ["4:10", "10:4", "8:15", "15:8"],
    ["28", "56", "14", "7"],
    ["x=1, y=0.5", "x=2, y=1", "No solution", "x=0, y=1.25"],
    ["20", "30", "25", "35"],
    ["4:5", "5:4", "2:3", "3:2"],
    ["22", "16.5", "18", "24"],
    ["3, 2", "2, 1", "No solution", "Either 2 or 4"],
    ["Rs. 500", "Rs. 600", "Rs. 750", "Rs. 1000"],
    ["3", "Either 2 or 4", "4", "2"],
  ];
  return optionSets[qIndex % optionSets.length];
}

function getBadgeStyle(status) {
  if (status === "answered") return { background: "#28a745", color: "#fff", border: "none" };
  if (status === "current")  return { background: "#1a5cff", color: "#fff", border: "none" };
  if (status === "revisit")  return { background: "#f5a623", color: "#fff", border: "none" };
  return { background: "#fff", color: "#444", border: "1.5px solid #d0d6e4" };
}

// localStorage helpers — no backend needed
function loadSaved(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function savePersist(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function MCQPage({ section, startIndex = 0, onBackToList, onSubmitSection }) {
  const sectionTitle = section?.title || "Ratio and proportion";
  const questions    = sectionQuestions[sectionTitle] || sectionQuestions["Quantitative Aptitude"];
  const totalQ       = questions.length;
  const durationMins = parseInt(section?.duration) || 30;

  // localStorage keys scoped to section
  const STORAGE_KEY_ANSWERS  = `mcq_answers_${sectionTitle}`;
  const STORAGE_KEY_STATUSES = `mcq_statuses_${sectionTitle}`;
  const STORAGE_KEY_TIME     = `mcq_time_${sectionTitle}`;

  const defaultStatuses = Array(totalQ).fill("unanswered").map((s, i) => i === 0 ? "current" : s);

  const [currentIdx,  setCurrentIdx]  = useState(startIndex ?? 0);
  const [answers,     setAnswers]      = useState(() => loadSaved(STORAGE_KEY_ANSWERS,  Array(totalQ).fill(null)));
  const [statuses,    setStatuses]     = useState(() => loadSaved(STORAGE_KEY_STATUSES, defaultStatuses));
  const [timeLeft,    setTimeLeft]     = useState(() => loadSaved(STORAGE_KEY_TIME,     durationMins * 60));
  const [sidebarOpen, setSidebarOpen]  = useState(true);

  // Persist answers + statuses on every change
  useEffect(() => { savePersist(STORAGE_KEY_ANSWERS,  answers);  }, [answers]);
  useEffect(() => { savePersist(STORAGE_KEY_STATUSES, statuses); }, [statuses]);
  useEffect(() => { savePersist(STORAGE_KEY_TIME,     timeLeft); }, [timeLeft]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) { onSubmitSection?.(); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const timerColor = timeLeft < 120 ? "#e53c2b" : "#111";

  const q           = questions[currentIdx];
  const options     = getOptions(q.text, currentIdx);
  const selectedOpt = answers[currentIdx];

  // Legend counts
  const countAnswered    = statuses.filter(s => s === "answered").length;
  const countRevisit     = statuses.filter(s => s === "revisit").length;
  const countYetToAnswer = statuses.filter(s => s === "unanswered" || s === "current").length;

  function handleSelectOption(optIdx) {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optIdx;
    setAnswers(newAnswers);
    const newStatuses = [...statuses];
    if (newStatuses[currentIdx] !== "revisit") newStatuses[currentIdx] = "answered";
    setStatuses(newStatuses);
  }

  function goToQuestion(idx) {
    const newStatuses = [...statuses];
    if (newStatuses[currentIdx] === "current") newStatuses[currentIdx] = "unanswered";
    newStatuses[idx] = answers[idx] != null ? "answered" : "current";
    setStatuses(newStatuses);
    setCurrentIdx(idx);
  }

  function handleSubmitAnswer() {
    if (selectedOpt === null) return;
    const newStatuses = [...statuses];
    newStatuses[currentIdx] = "answered";
    if (currentIdx < totalQ - 1) {
      const nextIdx = currentIdx + 1;
      newStatuses[nextIdx] = answers[nextIdx] != null ? "answered" : "current";
      setStatuses([...newStatuses]);
      setCurrentIdx(nextIdx);
    } else {
      setStatuses([...newStatuses]);
      onBackToList?.();
    }
  }

  function handleSkip() {
    const newStatuses = [...statuses];
    if (newStatuses[currentIdx] === "current") newStatuses[currentIdx] = "unanswered";
    if (currentIdx < totalQ - 1) {
      const nextIdx = currentIdx + 1;
      newStatuses[nextIdx] = answers[nextIdx] != null ? "answered" : "current";
      setStatuses([...newStatuses]);
      setCurrentIdx(nextIdx);
    } else {
      onBackToList?.();
    }
  }

  function handleReset() {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = null;
    setAnswers(newAnswers);
    const newStatuses = [...statuses];
    newStatuses[currentIdx] = "current";
    setStatuses(newStatuses);
  }

  function handleRevisit() {
    const newStatuses = [...statuses];
    if (newStatuses[currentIdx] === "revisit") {
      newStatuses[currentIdx] = answers[currentIdx] != null ? "answered" : "current";
    } else {
      newStatuses[currentIdx] = "revisit";
    }
    setStatuses(newStatuses);
  }

  function handleSubmitSection() {
    if (window.confirm("Submit this section? You cannot change answers after submission.")) {
      // Clear saved state on submit
      try {
        localStorage.removeItem(STORAGE_KEY_ANSWERS);
        localStorage.removeItem(STORAGE_KEY_STATUSES);
        localStorage.removeItem(STORAGE_KEY_TIME);
      } catch {}
      onSubmitSection?.();
    }
  }

  const canSubmit = selectedOpt !== null;
  const isRevisit = statuses[currentIdx] === "revisit";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .mq-root {
          min-height: 100vh;
          background: #f0f2f7;
          font-family: 'Space Grotesk', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── TOP NAV ── */
        .mq-nav {
          display: flex; align-items: center; justify-content: space-between;
          height: 52px; background: #fff; border-bottom: 1px solid #e0e4ed;
          position: sticky; top: 0; z-index: 200; flex-shrink: 0;
        }
        .mq-nav-logo { display: flex; align-items: stretch; height: 100%; }
        .mq-logo-blue {
          background: #1a5cff; color: #fff; font-weight: 900; font-size: 17px;
          padding: 0 14px 0 10px; display: flex; align-items: center; gap: 7px;
        }
        .mq-logo-x {
          display: inline-flex; width: 24px; height: 24px; background: #e53c2b;
          align-items: center; justify-content: center; font-size: 11px;
          font-weight: 900; color: #fff;
          clip-path: polygon(15% 0%,85% 0%,100% 15%,100% 85%,85% 100%,15% 100%,0% 85%,0% 15%);
        }
        .mq-logo-red {
          background: #e53c2b; color: #fff; font-weight: 900; font-size: 17px;
          padding: 0 16px; display: flex; align-items: center;
        }
        .mq-nav-center { font-size: 14px; font-weight: 600; color: #222; }
        .mq-nav-right { display: flex; align-items: center; gap: 16px; padding-right: 20px; }
        .mq-timer { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 1.5px; }
        .mq-submit-section-btn {
          padding: 9px 22px; background: #e53c2b; color: #fff; border: none;
          border-radius: 6px; font-size: 13px; font-weight: 700;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
        }
        .mq-submit-section-btn:hover { background: #c42f1f; }

        /* ── LEGEND BAR ── */
        .mq-legend-bar {
          display: flex;
          align-items: center;
          gap: 0;
          background: #fff;
          border-bottom: 1px solid #e4e8f0;
          padding: 0 24px;
          height: 42px;
          flex-shrink: 0;
        }
        .mq-legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 500;
          color: #444;
          padding: 0 20px 0 0;
        }
        .mq-legend-item + .mq-legend-item {
          padding-left: 20px;
          border-left: 1px solid #e0e4ed;
        }
        .mq-legend-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .mq-legend-dot.grey   { background: #9aa0b0; }
        .mq-legend-dot.green  { background: #28a745; }
        .mq-legend-dot.orange { background: #f5a623; }

        /* ── BODY ── */
        .mq-body {
          display: flex; flex: 1; overflow: hidden; background: #f0f2f7;
        }

        /* ── COLLAPSED SIDEBAR ── */
        .mq-sidebar-collapsed {
          width: 90px; flex-shrink: 0; background: #f0f2f7;
          display: flex; flex-direction: column; align-items: center;
          padding: 16px 0 24px; gap: 10px; overflow-y: auto; position: relative;
        }

        /* ── EXPANDED SIDEBAR ── */
        .mq-sidebar-expanded {
          width: 260px; flex-shrink: 0; background: #fff;
          border-right: 1px solid #e4e8f0;
          display: flex; flex-direction: column;
          padding: 14px 14px 24px; gap: 10px; overflow-y: auto; position: relative;
        }

        /* ── TOGGLE ── */
        .mq-sidebar-toggle {
          position: absolute; right: -13px; top: 50%; transform: translateY(-50%);
          width: 13px; height: 44px; background: #fff;
          border: 1px solid #d0d6e4; border-left: none;
          border-radius: 0 8px 8px 0; display: flex; align-items: center;
          justify-content: center; cursor: pointer; z-index: 20;
          color: #1a5cff; font-size: 9px;
          box-shadow: 3px 0 6px rgba(0,0,0,0.07);
          user-select: none; transition: background 0.15s;
        }
        .mq-sidebar-toggle:hover { background: #eef2ff; }

        .mq-sidebar-link {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #333;
          font-weight: 500; cursor: pointer; border: 1px solid #e8ecf4;
          background: #fff; font-family: 'Space Grotesk', sans-serif;
          white-space: nowrap; text-align: left;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .mq-sidebar-link:hover { background: #f0f4ff; color: #1a5cff; border-color: #c5d3ff; }

        .mq-sidebar-icon-btn {
          width: 44px; height: 44px; border-radius: 10px;
          border: 1.5px solid #dde2ec; background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px; color: #555; flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: background 0.15s;
        }
        .mq-sidebar-icon-btn:hover { background: #f0f4ff; }

        .mq-sidebar-section-label-expanded {
          font-size: 11px; font-weight: 700; color: #1a5cff;
          letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 4px 0;
        }
        .mq-sidebar-section-label-collapsed {
          font-size: 9px; font-weight: 700; color: #1a5cff;
          letter-spacing: 1px; text-transform: uppercase;
          text-align: center; line-height: 1.4;
        }

        .mq-q-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 2px 0; }
        .mq-q-grid-col { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }

        .mq-q-btn {
          width: 44px; height: 44px; border-radius: 10px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          transition: transform 0.12s, box-shadow 0.12s;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .mq-q-btn:hover { transform: scale(1.07); box-shadow: 0 3px 10px rgba(0,0,0,0.16); }

        /* ── CENTER WHITE AREA ── */
        .mq-center {
          flex: 1; display: flex; background: #fff; overflow: hidden; min-width: 0;
        }

        /* ── QUESTION PANEL ── */
        .mq-question-panel {
          flex: 1; min-width: 0; display: flex; flex-direction: column;
          overflow-y: auto; border-right: 1px solid #e2e6f0;
        }
        .mq-q-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 28px 16px;
        }
        .mq-q-label { font-size: 14px; font-weight: 600; color: #222; }
        .mq-revisit-btn {
          display: flex; align-items: center; gap: 7px; font-size: 13px;
          font-weight: 500; color: #888; cursor: pointer; border: none;
          background: none; font-family: 'Space Grotesk', sans-serif;
          padding: 4px 6px; border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .mq-revisit-btn:hover { color: #f5a623; background: #fff8ee; }
        .mq-revisit-btn.active { color: #f5a623; }
        .mq-q-body { padding: 0 28px 32px; font-size: 14.5px; color: #222; line-height: 1.8; }

        /* ── OPTIONS PANEL ── */
        .mq-options-panel {
          width: 600px; flex-shrink: 0; display: flex; flex-direction: column;
          overflow-y: auto; background: #fff;
        }
        .mq-select-label {
          font-size: 15px; font-weight: 600; color: #111; padding: 22px 28px 18px;
        }
        .mq-options-list { display: flex; flex-direction: column; gap: 10px; padding: 0 28px; }

        .mq-option {
          display: flex; align-items: center; gap: 14px; padding: 15px 18px;
          border: 1.5px solid #e4e8f2; border-radius: 10px; cursor: pointer;
          background: #fff; transition: border-color 0.15s, background 0.15s;
        }
        .mq-option:hover { border-color: #1a5cff; background: #f5f8ff; }
        .mq-option.selected { border-color: #1a5cff; background: #e8f1ff; }

        .mq-radio {
          width: 18px; height: 18px; border-radius: 50%; border: 2px solid #bbb;
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          transition: border-color 0.15s;
        }
        .mq-option.selected .mq-radio { border-color: #1a5cff; }
        .mq-radio-inner { width: 10px; height: 10px; border-radius: 50%; background: #1a5cff; }
        .mq-option-text { font-size: 14px; color: #222; }

        /* ── ACTION ROW ── */
        .mq-action-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 28px 24px; margin-top: 14px; border-top: 1px solid #eaecf4;
        }
        .mq-action-left { display: flex; align-items: center; gap: 10px; }
        .mq-skip-btn {
          font-size: 13px; font-weight: 500; color: #333; cursor: pointer;
          border: 1.5px solid #dde1ea; background: #fff;
          font-family: 'Space Grotesk', sans-serif; padding: 9px 16px;
          border-radius: 8px; transition: background 0.15s, border-color 0.15s;
        }
        .mq-skip-btn:hover { background: #f5f6f9; border-color: #bcc2d0; }
        .mq-reset-btn {
          font-size: 13px; font-weight: 600; color: #1a5cff; cursor: pointer;
          border: none; background: none;
          font-family: 'Space Grotesk', sans-serif; padding: 9px 4px;
          transition: color 0.15s, text-decoration 0.15s;
        }
        .mq-reset-btn:hover { text-decoration: underline; }
        .mq-submit-answer-btn {
          display: flex; align-items: center; gap: 8px; padding: 11px 26px;
          border: none; border-radius: 9px; font-size: 14px; font-weight: 700;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .mq-submit-answer-btn.active {
          background: #1a5cff; color: #fff; box-shadow: 0 4px 16px rgba(26,92,255,0.35);
        }
        .mq-submit-answer-btn.active:hover { background: #0d47e0; }
        .mq-submit-answer-btn.inactive { background: none; color: #c0c4d0; cursor: default; }
      `}</style>

      <div className="mq-root">

        {/* TOP NAV */}
        <div className="mq-nav">
          <div className="mq-nav-logo">
            <div className="mq-logo-blue"><span className="mq-logo-x">✕</span>FACE</div>
            <div className="mq-logo-red">Prep</div>
          </div>
          <div className="mq-nav-center">{sectionTitle} | PIET - 21 March 2026</div>
          <div className="mq-nav-right">
            <span className="mq-timer" style={{ color: timerColor }}>{mins}:{secs}</span>
            <button className="mq-submit-section-btn" onClick={handleSubmitSection}>Submit Section</button>
          </div>
        </div>

        {/* ── LEGEND BAR ── */}
        <div className="mq-legend-bar">
          <div className="mq-legend-item">
            <span className="mq-legend-dot grey" />
            Yet-To-Answer ({countYetToAnswer})
          </div>
          <div className="mq-legend-item">
            <span className="mq-legend-dot green" />
            Answered ({countAnswered})
          </div>
          <div className="mq-legend-item">
            <span className="mq-legend-dot orange" />
            Revisit ({countRevisit})
          </div>
        </div>

        {/* BODY */}
        <div className="mq-body">

          {/* EXPANDED SIDEBAR */}
          {sidebarOpen ? (
            <div className="mq-sidebar-expanded">
              <div className="mq-sidebar-toggle" onClick={() => setSidebarOpen(false)} title="Collapse">‹</div>
              <button className="mq-sidebar-link" onClick={onBackToList}>← &nbsp;All Questions</button>
              <button className="mq-sidebar-link">ⓘ &nbsp;View Instructions</button>
              <div className="mq-sidebar-section-label-expanded">SECTION - 1</div>
              <div className="mq-q-grid">
                {questions.map((_, idx) => (
                  <button key={idx} className="mq-q-btn" style={getBadgeStyle(statuses[idx])} onClick={() => goToQuestion(idx)}>
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* COLLAPSED SIDEBAR */
            <div className="mq-sidebar-collapsed">
              <div className="mq-sidebar-toggle" onClick={() => setSidebarOpen(true)} title="Expand">›</div>
              <button className="mq-sidebar-icon-btn" onClick={onBackToList} title="All Questions">←</button>
              <button className="mq-sidebar-icon-btn" title="View Instructions">ⓘ</button>
              <div className="mq-sidebar-section-label-collapsed">SECTION<br/>- 1</div>
              <div className="mq-q-grid-col">
                {questions.map((_, idx) => (
                  <button key={idx} className="mq-q-btn" style={getBadgeStyle(statuses[idx])} onClick={() => goToQuestion(idx)}>
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WHITE CENTER */}
          <div className="mq-center">

            {/* QUESTION PANEL */}
            <div className="mq-question-panel">
              <div className="mq-q-header">
                <span className="mq-q-label">Section 1 | Question {currentIdx + 1}</span>
                <button className={`mq-revisit-btn ${isRevisit ? "active" : ""}`} onClick={handleRevisit}>
                  Revisit &nbsp;<span>{isRevisit ? "🔖" : "🏷️"}</span>
                </button>
              </div>
              <div className="mq-q-body">{q.text}</div>
            </div>

            {/* OPTIONS PANEL */}
            <div className="mq-options-panel">
              <div className="mq-select-label">Select a suitable answer.</div>

              <div className="mq-options-list">
                {options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    className={`mq-option ${selectedOpt === optIdx ? "selected" : ""}`}
                    onClick={() => handleSelectOption(optIdx)}
                  >
                    <div className="mq-radio">
                      {selectedOpt === optIdx && <div className="mq-radio-inner" />}
                    </div>
                    <span className="mq-option-text">{opt}</span>
                  </div>
                ))}
              </div>

              {/* ACTION ROW */}
              <div className="mq-action-row">
                <div className="mq-action-left">
                  <button className="mq-skip-btn" onClick={handleSkip}>Skip Question</button>
                  <button className="mq-reset-btn" onClick={handleReset}>Reset Answer</button>
                </div>
                <button
                  className={`mq-submit-answer-btn ${canSubmit ? "active" : "inactive"}`}
                  onClick={canSubmit ? handleSubmitAnswer : undefined}
                >
                  ✓ Submit Answer
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}