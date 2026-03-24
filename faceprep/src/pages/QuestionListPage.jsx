// src/pages/QuestionListPage.jsx
import React, { useState, useEffect } from "react";
import { sessions, submit, assessments as api } from "../api/api";
import banner2 from "../assets/banner2.png";

const STATUS_COLORS = {
  unanswered: "#9e9e9e",
  current:    "#9e9e9e",
  answered:   "#28a745",
  revisit:    "#f5a623",
};

export default function QuestionListPage({ section, userId, onOpenQuestion, onSubmitSection }) {
  const sectionId    = section?.id;
  const sectionTitle = section?.title || "Section";

  const [questions,    setQuestions]    = useState([]);
  const [statuses,     setStatuses]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showOverview, setShowOverview] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  useEffect(() => {
    if (!sectionId || !section?.assessment_id) return;
    setLoading(true);
    Promise.all([
      api.questions(section.assessment_id, sectionId),
      sessions.load(sectionId),
    ])
      .then(([{ questions: qs }, saved]) => {
        setQuestions(qs);
        setStatuses(saved?.statuses?.length === qs.length
          ? saved.statuses
          : Array(qs.length).fill("unanswered"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sectionId]);

  const answeredCount = statuses.filter(s => s === "answered").length;
  const revisitCount  = statuses.filter(s => s === "revisit").length;
  const yetCount      = statuses.filter(s => s === "unanswered" || s === "current").length;
  const totalQ        = questions.length;

  async function doSubmit() {
    setSubmitting(true);
    const saved     = await sessions.load(sectionId);
    const answers   = saved?.answers || Array(totalQ).fill(null);
    const timeTaken = saved?.time_left != null
      ? ((section?.duration_mins || 30) * 60 - saved.time_left) : 0;
    try {
      await submit.section(sectionId, answers, timeTaken);
    } catch (err) {
      if (err.status !== 409) { alert("Submission failed: " + err.message); setSubmitting(false); return; }
    }
    await sessions.clear(sectionId);
    setSubmitting(false);
    setShowOverview(false);
    onSubmitSection?.();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .ql-root{min-height:100vh;background:#f0f2f5;font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column}
        .ql-nav{display:flex;align-items:center;justify-content:space-between;height:56px;background:#fff;border-bottom:2px solid #e0e4ed;position:sticky;top:0;z-index:100;flex-shrink:0}
        .ql-nav-logo{display:flex;align-items:center;height:100%;background:#152d6e;padding:0 20px;flex-shrink:0}
        .ql-nav-logo img{height:34px;object-fit:contain}
        .ql-nav-center{font-size:14px;font-weight:600;color:#222;flex:1;padding:0 24px}
        .ql-nav-right{display:flex;align-items:center;gap:16px;padding-right:20px}
        .ql-submit-section-btn{padding:8px 20px;background:#e53c2b;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;font-family:'Space Grotesk',sans-serif;cursor:pointer}
        .ql-submit-section-btn:hover{background:#c42f1f}
        .ql-page-body{flex:1;display:flex;overflow:hidden}
        .ql-body{flex:1;padding:24px 28px 48px;overflow-y:auto}
        .ql-section-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
        .ql-section-title{font-size:22px;font-weight:700;color:#111}
        .ql-score-badge{background:#f5c518;color:#111;font-size:13px;font-weight:700;padding:3px 12px;border-radius:20px}
        .ql-legend{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e4e8f0;border-radius:10px;padding:10px 18px;margin-bottom:18px;font-size:13px;color:#444;flex-wrap:wrap}
        .ql-legend-dot{width:11px;height:11px;border-radius:50%;flex-shrink:0}
        .ql-legend-sep{color:#d0d4dc;margin:0 4px}
        .ql-skeleton{background:linear-gradient(90deg,#f0f2f5 25%,#e4e8f0 50%,#f0f2f5 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:10px;height:52px;margin-bottom:10px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .ql-question-row{display:flex;align-items:center;gap:14px;background:#fff;border:1.5px solid #e8ecf4;border-radius:10px;padding:14px 18px;margin-bottom:10px;cursor:pointer;transition:border-color .15s,box-shadow .15s,background .15s}
        .ql-question-row:hover{border-color:#1a5cff;box-shadow:0 0 0 3px rgba(26,92,255,.09);background:#f7f9ff}
        .ql-status-dot{width:13px;height:13px;border-radius:50%;flex-shrink:0;transition:background .4s}
        .ql-type-tag{font-size:11px;font-weight:700;color:#1a5cff;letter-spacing:.5px;min-width:36px;flex-shrink:0}
        .ql-q-text{font-size:14px;color:#222;line-height:1.5;flex:1}
        .ql-status-pill{font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;flex-shrink:0}
        .ql-status-pill.answered{background:#e6f9ec;color:#1a7a35}
        .ql-status-pill.revisit{background:#fff4e0;color:#b96d00}
        .ql-footer{text-align:center;font-size:13px;color:#aaa;margin-top:32px}
        .ql-footer strong{color:#555;font-weight:600}

        /* OVERVIEW SIDEBAR */
        .ql-overview-sidebar{width:420px;flex-shrink:0;background:#fff;border-left:1px solid #e4e8f0;display:flex;flex-direction:column;overflow-y:auto}
        .ql-overview-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px;border-bottom:1px solid #e8eaf0}
        .ql-overview-title{font-size:16px;font-weight:700;color:#111}
        .ql-overview-close{width:28px;height:28px;border-radius:50%;border:none;background:#f0f2f5;color:#555;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .ql-overview-close:hover{background:#e0e4ed}
        .ql-overview-table{width:100%;border-collapse:collapse;margin:0}
        .ql-overview-table th{font-size:12px;font-weight:700;color:#888;text-align:left;padding:10px 16px;border-bottom:1px solid #f0f2f5;white-space:nowrap}
        .ql-overview-table td{font-size:13px;font-weight:500;color:#222;padding:12px 16px;border-bottom:1px solid #f5f7fb}
        .ql-overview-footer{padding:20px 24px;border-top:1px solid #e8eaf0;display:flex;align-items:center;justify-content:space-between;margin-top:auto}
        .ql-overview-cancel{font-size:14px;font-weight:600;color:#1a5cff;background:none;border:none;cursor:pointer;font-family:'Space Grotesk',sans-serif}
        .ql-overview-submit{padding:12px 32px;background:#e53c2b;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;font-family:'Space Grotesk',sans-serif;cursor:pointer}
        .ql-overview-submit:hover{background:#c42f1f}
        .ql-overview-submit:disabled{background:#f5a0a0;cursor:default}
        .ql-overview-note{font-size:12px;color:#888;padding:0 24px 16px;line-height:1.5}
      `}</style>

      <div className="ql-root">
        {/* NAV */}
        <div className="ql-nav">
          <div className="ql-nav-logo"><img src={banner2} alt="FacePrep" /></div>
          <div className="ql-nav-center">{sectionTitle} | PIET - 21 March 2026</div>
          <div className="ql-nav-right">
            <button className="ql-submit-section-btn" onClick={() => setShowOverview(true)}>Submit Section</button>
          </div>
        </div>

        <div className="ql-page-body">
          {/* MAIN CONTENT */}
          <div className="ql-body">
            <div className="ql-section-head">
              <span className="ql-section-title">{sectionTitle}</span>
              <span className="ql-score-badge">{answeredCount} / {totalQ}</span>
            </div>

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

            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="ql-skeleton" />)
            ) : (
              questions.map((q, idx) => {
                const status   = statuses[idx] || "unanswered";
                const dotColor = STATUS_COLORS[status];
                return (
                  <div key={q.id ?? idx} className="ql-question-row" onClick={() => onOpenQuestion?.(idx)}>
                    <span className="ql-status-dot" style={{ background: dotColor }} />
                    <span className="ql-type-tag">{q.type || "MCQ"}</span>
                    <span className="ql-q-text">{q.text}</span>
                    {(status === "answered" || status === "revisit") && (
                      <span className={`ql-status-pill ${status}`}>
                        {status === "answered" ? "Answered" : "Revisit"}
                      </span>
                    )}
                  </div>
                );
              })
            )}
            <div className="ql-footer">Powered by <strong>Faceprep</strong></div>
          </div>

          {/* OVERVIEW SIDEBAR */}
          {showOverview && (
            <div className="ql-overview-sidebar">
              <div className="ql-overview-header">
                <span className="ql-overview-title">Assessment Overview</span>
                <button className="ql-overview-close" onClick={() => setShowOverview(false)}>✕</button>
              </div>

              <table className="ql-overview-table">
                <thead>
                  <tr>
                    <th>Sections</th>
                    <th>Total Questions</th>
                    <th>Yet-To-Answer</th>
                    <th>Answered</th>
                    <th>Revisit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Current Section</td>
                    <td>{totalQ}</td>
                    <td>{yetCount}</td>
                    <td>{answeredCount}</td>
                    <td>{revisitCount}</td>
                  </tr>
                </tbody>
              </table>

              {yetCount > 0 && (
                <div className="ql-overview-note">
                  ⚠️ You have {yetCount} unanswered question{yetCount > 1 ? "s" : ""}. You can still go back and answer them.
                </div>
              )}
              {yetCount === 0 && (
                <div className="ql-overview-note" style={{ color: "#28a745" }}>
                  ✅ All questions are answered. You can submit the section.
                </div>
              )}

              <div className="ql-overview-footer">
                <button className="ql-overview-cancel" onClick={() => setShowOverview(false)}>Cancel</button>
                <button className="ql-overview-submit" onClick={doSubmit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Section"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}