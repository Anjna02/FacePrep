// src/pages/MCQPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { sessions, submit, assessments as api } from "../api/api";
import banner2 from "../assets/banner2.png";

function getBadgeStyle(status) {
  if (status === "answered") return { background: "#28a745", color: "#fff", border: "none" };
  if (status === "current")  return { background: "#1a5cff", color: "#fff", border: "none" };
  if (status === "revisit")  return { background: "#f5a623", color: "#fff", border: "none" };
  return { background: "#e8eaf0", color: "#444", border: "1.5px solid #d0d6e4" };
}

export default function MCQPage({ section, startIndex = 0, userId, onBackToList, onSubmitSection }) {
  const sectionId    = section?.id;
  const sectionTitle = section?.title || "Section";
  const durationMins = section?.duration_mins || parseInt(section?.duration) || 30;

  const [loading,     setLoading]     = useState(true);
  const [questions,   setQuestions]   = useState([]);
  const [currentIdx,  setCurrentIdx]  = useState(startIndex ?? 0);
  const [answers,     setAnswers]     = useState([]);
  const [statuses,    setStatuses]    = useState([]);
  const [timeLeft,    setTimeLeft]    = useState(durationMins * 60);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [warning,          setWarning]          = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const saveTimer = useRef(null);
  const totalQ    = questions.length;

  // Fullscreen & tab-switch monitoring
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        setWarning("We recommend to avoid the tab switch during the assessment session");
      }
    }
    function handleFullscreenChange() {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFs) {
        setWarning("We recommend to avoid exiting fullscreen during the assessment session");
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  function handleContinueTest() {
    setWarning(null);
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      try { document.documentElement.requestFullscreen?.() || document.documentElement.webkitRequestFullscreen?.(); } catch {}
    }
  }

  useEffect(() => {
    if (!section?.assessment_id || !sectionId) return;
    api.questions(section.assessment_id, sectionId)
      .then(({ questions: qs }) => {
        setQuestions(qs);
        const defaultStatuses = qs.map((_, i) => i === 0 ? "current" : "unanswered");
        setAnswers(Array(qs.length).fill(null));
        setStatuses(defaultStatuses);
        return sessions.load(sectionId).then(saved => {
          if (saved && saved.answers?.length === qs.length) {
            setAnswers(saved.answers); setStatuses(saved.statuses); setTimeLeft(saved.time_left);
          }
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sectionId]);

  const persist = useCallback((a, s, t) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaving(true);
      sessions.save(sectionId, a, s, t).finally(() => setSaving(false));
    }, 800);
  }, [sectionId]);

  useEffect(() => {
    if (!loading && totalQ > 0) persist(answers, statuses, timeLeft);
  }, [answers, statuses, timeLeft, loading]);

  useEffect(() => {
    if (loading || timeLeft <= 0) { if (timeLeft <= 0) handleAutoSubmit(); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [loading, timeLeft]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const countAnswered    = statuses.filter(s => s === "answered").length;
  const countRevisit     = statuses.filter(s => s === "revisit").length;
  const countYetToAnswer = statuses.filter(s => s === "unanswered" || s === "current").length;

  const q           = questions[currentIdx];
  const selectedOpt = answers[currentIdx] ?? null;
  const canSubmit   = selectedOpt !== null;
  const isRevisit   = statuses[currentIdx] === "revisit";

  function handleSelectOption(optIdx) {
    const newAnswers = [...answers]; newAnswers[currentIdx] = optIdx;
    const newStatuses = [...statuses];
    if (newStatuses[currentIdx] !== "revisit") newStatuses[currentIdx] = "answered";
    setAnswers(newAnswers); setStatuses(newStatuses);
  }

  function goToQuestion(idx) {
    const newStatuses = [...statuses];
    if (newStatuses[currentIdx] === "current") newStatuses[currentIdx] = "unanswered";
    newStatuses[idx] = answers[idx] != null ? "answered" : "current";
    setStatuses(newStatuses); setCurrentIdx(idx);
  }

  function handleSubmitAnswer() {
    if (selectedOpt === null) return;
    const newStatuses = [...statuses]; newStatuses[currentIdx] = "answered";
    if (currentIdx < totalQ - 1) {
      const nextIdx = currentIdx + 1;
      newStatuses[nextIdx] = answers[nextIdx] != null ? "answered" : "current";
      setStatuses([...newStatuses]); setCurrentIdx(nextIdx);
    } else { setStatuses([...newStatuses]); onBackToList?.(); }
  }

  function handleSkip() {
    const newStatuses = [...statuses];
    if (newStatuses[currentIdx] === "current") newStatuses[currentIdx] = "unanswered";
    if (currentIdx < totalQ - 1) {
      const nextIdx = currentIdx + 1;
      newStatuses[nextIdx] = answers[nextIdx] != null ? "answered" : "current";
      setStatuses([...newStatuses]); setCurrentIdx(nextIdx);
    } else { onBackToList?.(); }
  }

  function handleReset() {
    const newAnswers = [...answers]; newAnswers[currentIdx] = null;
    const newStatuses = [...statuses]; newStatuses[currentIdx] = "current";
    setAnswers(newAnswers); setStatuses(newStatuses);
  }

  function handleRevisit() {
    const newStatuses = [...statuses];
    newStatuses[currentIdx] = newStatuses[currentIdx] === "revisit"
      ? (answers[currentIdx] != null ? "answered" : "current") : "revisit";
    setStatuses(newStatuses);
  }

  async function doSubmit() {
    const timeTaken = durationMins * 60 - timeLeft;
    try { await submit.section(sectionId, answers, timeTaken); }
    catch (err) { if (err.status !== 409) console.error("Submit error:", err); }
    await sessions.clear(sectionId);
    onSubmitSection?.();
  }

  function handleSubmitSection() { setShowSubmitConfirm(true); }

  async function handleAutoSubmit() { await doSubmit(); }

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"'Space Grotesk',sans-serif", color:"#888", fontSize:16 }}>
      Loading questions…
    </div>
  );

  if (!q) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .mq-root{min-height:100vh;background:#f0f2f7;font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column}
        .mq-nav{display:flex;align-items:center;justify-content:space-between;height:56px;background:#fff;border-bottom:2px solid #e0e4ed;position:sticky;top:0;z-index:200;flex-shrink:0}
        .mq-nav-logo{display:flex;align-items:center;height:100%;background:#152d6e;padding:0 20px;flex-shrink:0}
        .mq-nav-logo img{height:34px;object-fit:contain}
        .mq-nav-center{font-size:14px;font-weight:600;color:#222;display:flex;align-items:center;gap:8px;flex:1;padding:0 28px}
        .mq-save-dot{width:7px;height:7px;border-radius:50%;background:#28a745;opacity:0;transition:opacity .4s}
        .mq-save-dot.visible{opacity:1}
        .mq-nav-right{display:flex;align-items:center;gap:14px;padding-right:20px;flex-shrink:0}
        .mq-timer{font-size:16px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:1.5px;color:#152d6e;background:#f0f4ff;border:1.5px solid #c5d3ff;border-radius:7px;padding:4px 14px}
        .mq-timer.danger{color:#e53c2b;background:#fff0ee;border-color:#ffb8b0}
        .mq-submit-section-btn{padding:9px 20px;background:#e53c2b;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;font-family:'Space Grotesk',sans-serif;cursor:pointer}
        .mq-submit-section-btn:hover{background:#c42f1f}
        .mq-legend-bar{display:flex;align-items:center;background:#fff;border-bottom:1px solid #e4e8f0;padding:0 24px;height:42px;flex-shrink:0}
        .mq-legend-item{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:500;color:#444;padding:0 20px 0 0}
        .mq-legend-item+.mq-legend-item{padding-left:20px;border-left:1px solid #e0e4ed}
        .mq-legend-dot{width:11px;height:11px;border-radius:50%;flex-shrink:0}
        .mq-legend-dot.grey{background:#9aa0b0}
        .mq-legend-dot.green{background:#28a745}
        .mq-legend-dot.orange{background:#f5a623}
        .mq-body{display:flex;flex:1;overflow:hidden;background:#f0f2f7}
        .mq-sidebar-expanded{width:260px;flex-shrink:0;background:#fff;border-right:1px solid #e4e8f0;display:flex;flex-direction:column;padding:14px 14px 24px;gap:10px;overflow-y:auto;position:relative}
        .mq-sidebar-collapsed{width:70px;flex-shrink:0;background:#fff;border-right:1px solid #e4e8f0;display:flex;flex-direction:column;align-items:center;padding:14px 0 24px;gap:10px;overflow-y:auto;position:relative}
        .mq-sidebar-toggle{position:absolute;right:-13px;top:50%;transform:translateY(-50%);width:13px;height:44px;background:#1a5cff;border:none;border-radius:0 8px 8px 0;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:20;color:#fff;font-size:11px;box-shadow:3px 0 8px rgba(26,92,255,.25);user-select:none;transition:background .15s}
        .mq-sidebar-toggle:hover{background:#0d47e0}
        .mq-sidebar-link{display:flex;align-items:center;gap:8px;width:100%;padding:10px 12px;border-radius:8px;font-size:13px;color:#333;font-weight:500;cursor:pointer;border:1px solid #e8ecf4;background:#f8f9fb;font-family:'Space Grotesk',sans-serif;white-space:nowrap;text-align:left;transition:background .15s,color .15s}
        .mq-sidebar-link:hover{background:#f0f4ff;color:#1a5cff;border-color:#c5d3ff}
        .mq-sidebar-icon-btn{width:44px;height:44px;border-radius:10px;border:1.5px solid #dde2ec;background:#f8f9fb;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:#555;flex-shrink:0;transition:background .15s}
        .mq-sidebar-icon-btn:hover{background:#f0f4ff}
        .mq-sidebar-section-label{font-size:11px;font-weight:700;color:#1a5cff;letter-spacing:1.2px;text-transform:uppercase;padding:4px 4px 0}
        .mq-sidebar-section-label-col{font-size:9px;font-weight:700;color:#1a5cff;letter-spacing:1px;text-transform:uppercase;text-align:center;line-height:1.4}
        .mq-q-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:2px 0}
        .mq-q-grid-col{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}
        .mq-q-btn{width:44px;height:44px;border-radius:10px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:transform .12s,box-shadow .12s;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,.08)}
        .mq-q-btn:hover{transform:scale(1.07);box-shadow:0 3px 10px rgba(0,0,0,.16)}
        .mq-center{flex:1;display:flex;background:#fff;overflow:hidden;min-width:0}
        .mq-question-panel{flex:1;min-width:0;display:flex;flex-direction:column;overflow-y:auto;border-right:1px solid #e2e6f0}
        .mq-q-header{display:flex;align-items:center;justify-content:space-between;padding:20px 28px 16px}
        .mq-q-label{font-size:14px;font-weight:600;color:#222}
        .mq-revisit-btn{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:500;color:#888;cursor:pointer;border:none;background:none;font-family:'Space Grotesk',sans-serif;padding:4px 6px;border-radius:6px;transition:color .15s,background .15s}
        .mq-revisit-btn:hover{color:#f5a623;background:#fff8ee}
        .mq-revisit-btn.active{color:#f5a623}
        .mq-q-body{padding:0 28px 32px;font-size:14.5px;color:#222;line-height:1.8}
        .mq-options-panel{width:600px;flex-shrink:0;display:flex;flex-direction:column;overflow-y:auto;background:#fff}
        .mq-select-label{font-size:15px;font-weight:600;color:#111;padding:22px 28px 18px}
        .mq-options-list{display:flex;flex-direction:column;gap:10px;padding:0 28px}
        .mq-option{display:flex;align-items:center;gap:14px;padding:15px 18px;border:1.5px solid #e4e8f2;border-radius:10px;cursor:pointer;background:#fff;transition:border-color .15s,background .15s}
        .mq-option:hover{border-color:#1a5cff;background:#f5f8ff}
        .mq-option.selected{border-color:#1a5cff;background:#e8f1ff}
        .mq-radio{width:18px;height:18px;border-radius:50%;border:2px solid #bbb;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .15s}
        .mq-option.selected .mq-radio{border-color:#1a5cff}
        .mq-radio-inner{width:10px;height:10px;border-radius:50%;background:#1a5cff}
        .mq-option-text{font-size:14px;color:#222}
        .mq-action-row{display:flex;align-items:center;justify-content:space-between;padding:16px 28px 24px;margin-top:14px;border-top:1px solid #eaecf4}
        .mq-action-left{display:flex;align-items:center;gap:10px}
        .mq-skip-btn{font-size:13px;font-weight:500;color:#333;cursor:pointer;border:1.5px solid #dde1ea;background:#fff;font-family:'Space Grotesk',sans-serif;padding:9px 16px;border-radius:8px;transition:background .15s}
        .mq-skip-btn:hover{background:#f5f6f9}
        .mq-reset-btn{font-size:13px;font-weight:600;color:#1a5cff;cursor:pointer;border:none;background:none;font-family:'Space Grotesk',sans-serif;padding:9px 4px}
        .mq-reset-btn:hover{text-decoration:underline}
        .mq-submit-answer-btn{display:flex;align-items:center;gap:8px;padding:11px 26px;border:none;border-radius:9px;font-size:14px;font-weight:700;font-family:'Space Grotesk',sans-serif;cursor:pointer;transition:background .15s,box-shadow .15s}
        .mq-submit-answer-btn.active{background:#1a5cff;color:#fff;box-shadow:0 4px 16px rgba(26,92,255,.35)}
        .mq-submit-answer-btn.active:hover{background:#0d47e0}
        .mq-submit-answer-btn.inactive{background:none;color:#c0c4d0;cursor:default}
        .mq-warning-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999}
        .mq-warning-box{background:#fff;border-radius:12px;width:460px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.22);font-family:'Space Grotesk',sans-serif}
        .mq-warning-header{display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid #e8eaf0;font-size:16px;font-weight:700;color:#222}
        .mq-warning-body{padding:22px 20px 18px;font-size:14px;color:#444;line-height:1.6}
        .mq-warning-footer{display:flex;justify-content:flex-end;padding:10px 20px 18px}
        .mq-warning-continue{padding:11px 28px;background:#1a5cff;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;font-family:'Space Grotesk',sans-serif;cursor:pointer}
        .mq-warning-continue:hover{background:#0d47e0}
        .mq-confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9998}
        .mq-confirm-box{background:#fff;border-radius:14px;width:460px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.22);font-family:'Space Grotesk',sans-serif}
        .mq-confirm-title{font-size:16px;font-weight:700;color:#111;padding:20px 22px 4px}
        .mq-confirm-sub{font-size:13px;color:#888;padding:0 22px 14px}
        .mq-confirm-table{width:100%;border-collapse:collapse}
        .mq-confirm-table td{padding:11px 22px;font-size:14px;color:#222;border-bottom:1px solid #f5f7fb}
        .mq-confirm-table td:last-child{font-weight:700;text-align:right}
        .mq-confirm-note{font-size:12.5px;padding:12px 22px 6px;color:#888}
        .mq-confirm-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 22px}
        .mq-confirm-cancel{padding:9px 20px;background:none;border:1.5px solid #dde1ea;border-radius:8px;font-size:13px;font-weight:600;color:#333;cursor:pointer;font-family:'Space Grotesk',sans-serif}
        .mq-confirm-cancel:hover{background:#f5f6f9}
        .mq-confirm-submit{padding:9px 24px;background:#e53c2b;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Space Grotesk',sans-serif}
        .mq-confirm-submit:hover{background:#c42f1f}
      `}</style>

      <div className="mq-root">

        {/* WARNING MODAL */}
        {warning && (
          <div className="mq-warning-overlay">
            <div className="mq-warning-box">
              <div className="mq-warning-header"><span style={{fontSize:20}}>⚠️</span>Warning</div>
              <div className="mq-warning-body">{warning}</div>
              <div className="mq-warning-footer">
                <button className="mq-warning-continue" onClick={handleContinueTest}>Continue Test</button>
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT SECTION CONFIRM MODAL */}
        {showSubmitConfirm && (
          <div className="mq-confirm-overlay">
            <div className="mq-confirm-box">
              <div className="mq-confirm-title">Submit this section?</div>
              <div className="mq-confirm-sub">You cannot change your answers after submission.</div>
              <table className="mq-confirm-table">
                <tbody>
                  <tr><td>Total Questions</td><td>{totalQ}</td></tr>
                  <tr><td>Answered</td><td>{countAnswered}</td></tr>
                  <tr><td>Not Answered</td><td>{countYetToAnswer}</td></tr>
                  <tr><td>Marked for Revisit</td><td>{countRevisit}</td></tr>
                </tbody>
              </table>
              {countYetToAnswer === 0
                ? <div className="mq-confirm-note" style={{color:"#28a745"}}>✅ All questions answered.</div>
                : <div className="mq-confirm-note" style={{color:"#f5a623"}}>⚠️ {countYetToAnswer} question(s) unanswered.</div>
              }
              <div className="mq-confirm-footer">
                <button className="mq-confirm-cancel" onClick={() => setShowSubmitConfirm(false)}>Cancel</button>
                <button className="mq-confirm-submit" onClick={() => { setShowSubmitConfirm(false); doSubmit(); }}>Submit Section</button>
              </div>
            </div>
          </div>
        )}

        {/* NAV */}
        <div className="mq-nav">
          <div className="mq-nav-logo">
            <img src={banner2} alt="FacePrep" />
          </div>
          <div className="mq-nav-center">
            {sectionTitle} | PIET - 21 March 2026
            <span className={`mq-save-dot ${saving ? "visible" : ""}`} title="Saving…" />
          </div>
          <div className="mq-nav-right">
            <span className={`mq-timer ${timeLeft < 120 ? "danger" : ""}`}>{mins}:{secs}</span>
            <button className="mq-submit-section-btn" onClick={handleSubmitSection}>Submit Section</button>
          </div>
        </div>

        {/* LEGEND BAR */}
        <div className="mq-legend-bar">
          <div className="mq-legend-item"><span className="mq-legend-dot grey"/>Yet-To-Answer ({countYetToAnswer})</div>
          <div className="mq-legend-item"><span className="mq-legend-dot green"/>Answered ({countAnswered})</div>
          <div className="mq-legend-item"><span className="mq-legend-dot orange"/>Revisit ({countRevisit})</div>
        </div>

        {/* BODY */}
        <div className="mq-body">

          {/* SIDEBAR */}
          {sidebarOpen ? (
            <div className="mq-sidebar-expanded">
              <button className="mq-sidebar-toggle" onClick={() => setSidebarOpen(false)}>‹</button>
              <button className="mq-sidebar-link" onClick={onBackToList}>← &nbsp;All Questions</button>
              <button className="mq-sidebar-link">ⓘ &nbsp;View Instructions</button>
              <div className="mq-sidebar-section-label">SECTION - 1</div>
              <div className="mq-q-grid">
                {questions.map((_, idx) => (
                  <button key={idx} className="mq-q-btn" style={getBadgeStyle(statuses[idx])} onClick={() => goToQuestion(idx)}>
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mq-sidebar-collapsed">
              <button className="mq-sidebar-toggle" onClick={() => setSidebarOpen(true)}>›</button>
              <button className="mq-sidebar-icon-btn" onClick={onBackToList}>←</button>
              <button className="mq-sidebar-icon-btn">ⓘ</button>
              <div className="mq-sidebar-section-label-col">SEC<br/>-1</div>
              <div className="mq-q-grid-col">
                {questions.map((_, idx) => (
                  <button key={idx} className="mq-q-btn" style={getBadgeStyle(statuses[idx])} onClick={() => goToQuestion(idx)}>
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CENTER */}
          <div className="mq-center">
            <div className="mq-question-panel">
              <div className="mq-q-header">
                <span className="mq-q-label">Section 1 | Question {currentIdx + 1}</span>
                <button className={`mq-revisit-btn ${isRevisit ? "active" : ""}`} onClick={handleRevisit}>
                  Revisit &nbsp;<span>{isRevisit ? "🔖" : "🏷️"}</span>
                </button>
              </div>
              <div className="mq-q-body">{q.text}</div>
            </div>

            <div className="mq-options-panel">
              <div className="mq-select-label">Select a suitable answer.</div>
              <div className="mq-options-list">
                {(q.options || []).map((opt, optIdx) => (
                  <div key={optIdx} className={`mq-option ${selectedOpt === optIdx ? "selected" : ""}`} onClick={() => handleSelectOption(optIdx)}>
                    <div className="mq-radio">{selectedOpt === optIdx && <div className="mq-radio-inner"/>}</div>
                    <span className="mq-option-text">{opt}</span>
                  </div>
                ))}
              </div>
              <div className="mq-action-row">
                <div className="mq-action-left">
                  <button className="mq-skip-btn" onClick={handleSkip}>Skip Question</button>
                  <button className="mq-reset-btn" onClick={handleReset}>Reset Answer</button>
                </div>
                <button className={`mq-submit-answer-btn ${canSubmit ? "active" : "inactive"}`} onClick={canSubmit ? handleSubmitAnswer : undefined}>
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