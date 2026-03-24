// src/pages/CodingPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { sessions, submit as submitApi, assessments as api } from "../api/api";
import banner2 from "../assets/banner2.png";

const LANGUAGES = [
  { label: "C (GCC 9.2.0)",     value: "c" },
  { label: "C++ (GCC 9.2.0)",   value: "cpp" },
  { label: "Java (JDK 11)",     value: "java" },
  { label: "Python 3.8",        value: "python" },
  { label: "JavaScript (Node)", value: "js" },
];

const STARTER_CODE = {
  c:      "#include <stdio.h>\n\nint main() {\n    // write your code here\n    return 0;\n}\n",
  cpp:    "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // write your code here\n    return 0;\n}\n",
  java:   "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // write your code here\n    }\n}\n",
  python: "import sys\ninput = sys.stdin.readline\n\n# write your code here\n",
  js:     "const readline = require('readline');\n\n// write your code here\n",
};

function getBadgeStyle(status) {
  if (status === "answered") return { background: "#28a745", color: "#fff", border: "none" };
  if (status === "current")  return { background: "#1a5cff", color: "#fff", border: "none" };
  if (status === "revisit")  return { background: "#f5a623", color: "#fff", border: "none" };
  return { background: "#f0f2f7", color: "#444", border: "1.5px solid #d0d6e4" };
}

function CodeEditor({ code, onChange }) {
  const lineCount = (code.match(/\n/g) || []).length + 1;
  const taRef = useRef(null);
  const nuRef = useRef(null);

  function onScroll() {
    if (nuRef.current && taRef.current) nuRef.current.scrollTop = taRef.current.scrollTop;
  }

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", fontFamily: "'Consolas','JetBrains Mono','Fira Mono',monospace", fontSize: 13.5, background: "#fff" }}>
      {/* Line numbers */}
      <div ref={nuRef} style={{ padding: "12px 0", minWidth: 40, textAlign: "right", color: "#aab", lineHeight: "21px", userSelect: "none", overflowY: "hidden", background: "#f8f9fc", borderRight: "1px solid #e8ecf4", flexShrink: 0 }}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} style={{ height: 21, lineHeight: "21px", paddingRight: 10, fontSize: 12.5, color: "#bcc" }}>{i + 1}</div>
        ))}
      </div>
      {/* Editor */}
      <textarea
        ref={taRef}
        value={code}
        onChange={e => onChange(e.target.value)}
        onScroll={onScroll}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        style={{ flex: 1, background: "#fff", color: "#2d3748", border: "none", outline: "none", padding: "12px 14px", lineHeight: "21px", resize: "none", fontFamily: "inherit", fontSize: 13.5, caretColor: "#1a5cff", tabSize: 4 }}
        onKeyDown={e => {
          if (e.key === "Tab") {
            e.preventDefault();
            const el = e.target, s = el.selectionStart, end = el.selectionEnd;
            const newVal = el.value.substring(0, s) + "    " + el.value.substring(end);
            onChange(newVal);
            setTimeout(() => { el.selectionStart = el.selectionEnd = s + 4; }, 0);
          }
        }}
      />
    </div>
  );
}

// Accordion item for test cases panel
function AccordionItem({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #edf0f7" }}>
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", cursor: "pointer", userSelect: "none", fontSize: 13, color: "#333", fontWeight: 500 }}
      >
        <span style={{ fontSize: 11, color: "#888", transition: "transform 0.15s", display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
        {label}
      </div>
      {open && (
        <div style={{ padding: "0 16px 12px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function CodingPage({ section, startIndex = 0, userId, onBackToList, onSubmitSection }) {
  const sectionId    = section?.id;
  const assessmentId = section?.assessment_id ?? section?.assessmentId;
  const sectionTitle = section?.title || "Coding";
  const durationMins = section?.duration_mins || parseInt(section?.duration) || 60;

  const [loading,        setLoading]        = useState(true);
  const [questions,      setQuestions]      = useState([]);
  const [currentIdx,     setCurrentIdx]     = useState(startIndex ?? 0);
  const [statuses,       setStatuses]       = useState([]);
  const [timeLeft,       setTimeLeft]       = useState(durationMins * 60);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [codes,          setCodes]          = useState({});
  const [languages,      setLanguages]      = useState({});
  const [customInput,    setCustomInput]    = useState("");
  const [runState,       setRunState]       = useState("idle");
  const [runResults,     setRunResults]     = useState(null);
  const [submitCodeState, setSubmitCodeState] = useState("idle");
  const [warning,        setWarning]         = useState(null);

  const saveTimer = useRef(null);

  // Fullscreen & tab-switch monitoring
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) setWarning("We recommend to avoid the tab switch during the assessment session");
    }
    function handleFullscreenChange() {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFs) setWarning("We recommend to avoid exiting fullscreen during the assessment session");
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

  // ── Load questions + restore session ────────────────────────────────────
  useEffect(() => {
    if (!assessmentId || !sectionId) { setLoading(false); return; }

    api.questions(assessmentId, sectionId)
      .then(({ questions: qs }) => {
        setQuestions(qs);
        setStatuses(qs.map((_, i) => i === 0 ? "current" : "unanswered"));
        const initCodes = {}, initLangs = {};
        qs.forEach((_, i) => { initCodes[i] = STARTER_CODE.cpp; initLangs[i] = "cpp"; });
        setCodes(initCodes);
        setLanguages(initLangs);

        return sessions.load(sectionId).then(saved => {
          if (!saved) return;
          if (saved.statuses?.length === qs.length) setStatuses(saved.statuses);
          if (typeof saved.time_left === "number")  setTimeLeft(saved.time_left);
          if (Array.isArray(saved.answers)) {
            const sc = {}, sl = {};
            qs.forEach((_, i) => {
              if (saved.answers[i]?.code)     sc[i] = saved.answers[i].code;
              if (saved.answers[i]?.language) sl[i] = saved.answers[i].language;
            });
            setCodes(p => ({ ...p, ...sc }));
            setLanguages(p => ({ ...p, ...sl }));
          }
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sectionId, assessmentId]);

  // ── Persist (debounced 1s) ───────────────────────────────────────────────
  const persist = useCallback((c, l, s, t) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const payload = questions.map((_, i) => ({ code: c[i] || "", language: l[i] || "cpp" }));
      sessions.save(sectionId, payload, s, t).catch(() => {});
    }, 1000);
  }, [sectionId, questions]);

  useEffect(() => {
    if (!loading && questions.length > 0) persist(codes, languages, statuses, timeLeft);
  }, [codes, languages, statuses, timeLeft, loading]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || timeLeft <= 0) { if (timeLeft <= 0) onSubmitSection?.(); return; }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [loading, timeLeft]);

  const mins       = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secsStr    = String(timeLeft % 60).padStart(2, "0");
  const timerColor = timeLeft < 300 ? "#ffb3b3" : "#fff";

  const q           = questions[currentIdx];
  const currentCode = codes[currentIdx]     || STARTER_CODE.cpp;
  const currentLang = languages[currentIdx] || "cpp";
  const isRevisit   = statuses[currentIdx] === "revisit";
  const isLast      = currentIdx === questions.length - 1;

  const sampleTestCases = q?.test_cases ? JSON.parse(q.test_cases) : [
    { label: "Test Case - 1", input: "5\n10 20 30 40 50\n20 40", expected: "90" },
    { label: "Test Case - 2", input: "3\n100 200 300\n150 250", expected: "200" },
  ];

  const hiddenTestCases = [
    { label: "Hidden - 1", input: "4\n5 15 25 35\n10 30",              expected: "40" },
    { label: "Hidden - 2", input: "6\n100 200 300 400 500 600\n200 500", expected: "1400" },
    { label: "Hidden - 3", input: "1\n50\n50 50",                       expected: "50" },
  ];

  // ── Setters ──────────────────────────────────────────────────────────────
  function setCode(val) {
    setCodes(p => ({ ...p, [currentIdx]: val }));
    setStatuses(prev => {
      const n = [...prev];
      if (val.trim() && n[currentIdx] !== "revisit") n[currentIdx] = "answered";
      return n;
    });
    setSubmitCodeState("idle");
  }

  function setLanguage(val) {
    const prevLang  = languages[currentIdx] || "cpp";
    const isDefault = !codes[currentIdx]?.trim() || codes[currentIdx] === STARTER_CODE[prevLang];
    if (isDefault) setCodes(p => ({ ...p, [currentIdx]: STARTER_CODE[val] }));
    setLanguages(p => ({ ...p, [currentIdx]: val }));
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  function goToQuestion(idx) {
    setStatuses(prev => {
      const n = [...prev];
      if (n[currentIdx] === "current") n[currentIdx] = "unanswered";
      n[idx] = n[idx] === "answered" ? "answered" : "current";
      return n;
    });
    setCurrentIdx(idx);
    setRunResults(null);
    setRunState("idle");
    setSubmitCodeState("idle");
  }

  function handleSkip() {
    if (currentIdx < questions.length - 1) goToQuestion(currentIdx + 1);
    else onBackToList?.();
  }

  function handleRevisit() {
    setStatuses(prev => {
      const n = [...prev];
      n[currentIdx] = n[currentIdx] === "revisit"
        ? (codes[currentIdx]?.trim() ? "answered" : "current")
        : "revisit";
      return n;
    });
  }

  // ── Submit Code ──────────────────────────────────────────────────────────
  async function handleSubmitCode() {
    if (!currentCode.trim()) return;
    setSubmitCodeState("saving");

    const newStatuses = [...statuses];
    newStatuses[currentIdx] = "answered";
    setStatuses(newStatuses);

    const latestCodes = { ...codes, [currentIdx]: currentCode };
    const payload = questions.map((_, i) => ({ code: latestCodes[i] || "", language: languages[i] || "cpp" }));

    clearTimeout(saveTimer.current);
    try {
      await sessions.save(sectionId, payload, newStatuses, timeLeft);
      setSubmitCodeState("saved");
    } catch {
      setSubmitCodeState("idle");
      return;
    }

    setTimeout(() => {
      if (currentIdx < questions.length - 1) goToQuestion(currentIdx + 1);
      else onBackToList?.();
      setSubmitCodeState("idle");
    }, 600);
  }

  // ── Submit Section ───────────────────────────────────────────────────────
  async function handleSubmitSection() {
    if (!window.confirm("Submit this section? You cannot change your code after submission.")) return;
    const finalAnswers = questions.map((_, i) => ({ code: codes[i] || "", language: languages[i] || "cpp" }));
    const timeTaken = durationMins * 60 - timeLeft;
    try {
      await submitApi.section(sectionId, finalAnswers, timeTaken);
    } catch (err) {
      if (err.status !== 409) console.error("Submit error:", err);
    }
    onSubmitSection?.();
  }

  // ── Run Sample Cases ─────────────────────────────────────────────────────
  async function handleRunSample() {
    if (runState !== "idle") return;
    setRunState("running-sample");
    setRunResults(null);
    await new Promise(r => setTimeout(r, 1400));
    setRunResults({
      type: "sample",
      results: sampleTestCases.map((tc, i) => ({
        label: tc.label || `Test Case - ${i + 1}`,
        input: tc.input, expected: tc.expected, output: tc.expected,
        passed: true,
        time: `${(Math.random() * 0.2 + 0.05).toFixed(2)}s`,
        memory: `${(Math.random() * 4 + 2).toFixed(1)} MB`,
        hidden: false,
      })),
    });
    setRunState("idle");
  }

  // ── Run All Cases ────────────────────────────────────────────────────────
  async function handleRunAll() {
    if (runState !== "idle") return;
    setRunState("running-all");
    setRunResults(null);
    await new Promise(r => setTimeout(r, 2200));
    const allCases = [...sampleTestCases, ...hiddenTestCases];
    setRunResults({
      type: "all",
      results: allCases.map((tc, i) => ({
        label: tc.label || `Test Case - ${i + 1}`,
        input: i < sampleTestCases.length ? tc.input : "Hidden",
        expected: i < sampleTestCases.length ? tc.expected : "Hidden",
        output: tc.expected,
        passed: Math.random() > 0.2,
        time: `${(Math.random() * 0.3 + 0.05).toFixed(2)}s`,
        memory: `${(Math.random() * 6 + 2).toFixed(1)} MB`,
        hidden: i >= sampleTestCases.length,
      })),
    });
    setRunState("idle");
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Space Grotesk', sans-serif", color: "#888" }}>
      Loading coding questions…
    </div>
  );
  if (!q) return null;

  const passCount  = runResults?.results?.filter(r => r.passed).length ?? 0;
  const totalCount = runResults?.results?.length ?? 0;
  const allPassed  = passCount === totalCount && totalCount > 0;
  const isRunning  = runState !== "idle";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        .cp-root { height: 100vh; display: flex; flex-direction: column; font-family: 'Space Grotesk', sans-serif; background: #f0f2f7; overflow: hidden; }

        /* ── TOP NAV ── */
        .cp-nav {
          height: 56px; display: flex; align-items: center; justify-content: space-between;
          background: #fff; border-bottom: 2px solid #e0e4ed; flex-shrink: 0; z-index: 100;
        }
        .cp-logo { display: flex; align-items: center; height: 100%; background: #152d6e; padding: 0 20px; flex-shrink: 0; }
        .cp-logo img { height: 34px; object-fit: contain; }
        .cp-nav-center { font-size: 14px; font-weight: 600; color: #222; letter-spacing: 0.2px; flex: 1; padding: 0 24px; }
        .cp-warning-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999}
        .cp-warning-box{background:#fff;border-radius:12px;width:460px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.22);font-family:'Space Grotesk',sans-serif}
        .cp-warning-header{display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid #e8eaf0;font-size:16px;font-weight:700;color:#222}
        .cp-warning-body{padding:22px 20px 18px;font-size:14px;color:#444;line-height:1.6}
        .cp-warning-footer{display:flex;justify-content:flex-end;padding:10px 20px 18px}
        .cp-warning-continue{padding:11px 28px;background:#1a5cff;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;font-family:'Space Grotesk',sans-serif;cursor:pointer}
        .cp-warning-continue:hover{background:#0d47e0}
        .cp-nav-right { display: flex; align-items: center; gap: 16px; padding-right: 20px; }
        .cp-timer { font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: 1.5px; color: #152d6e; background: #f0f4ff; border: 1.5px solid #c5d3ff; border-radius: 7px; padding: 4px 14px; }
        .cp-timer.danger { color: #e53c2b; background: #fff0ee; border-color: #ffb8b0; }
        .cp-submit-section-btn { padding: 9px 22px; background: #e53c2b; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; cursor: pointer; }
        .cp-submit-section-btn:hover { background: #c42f1f; }

        /* ── BODY ── */
        .cp-body { display: flex; flex: 1; overflow: hidden; }

        /* ── SIDEBAR (collapsed by default) ── */
        .cp-sidebar {
          background: #fff; border-right: 1px solid #e4e8f0;
          display: flex; flex-direction: column; overflow-y: auto;
          position: relative; flex-shrink: 0; transition: width 0.2s;
        }
        .cp-sidebar.open   { width: 200px; padding: 12px 12px 20px; gap: 10px; }
        .cp-sidebar.closed { width: 68px; padding: 12px 8px 20px; gap: 10px; align-items: center; }
        .cp-sidebar-toggle {
          position: absolute; right: -13px; top: 50%; transform: translateY(-50%);
          width: 13px; height: 44px; background: #fff; border: 1px solid #d0d6e4;
          border-left: none; border-radius: 0 8px 8px 0; display: flex; align-items: center;
          justify-content: center; cursor: pointer; z-index: 20; color: #1a5cff;
          font-size: 9px; box-shadow: 3px 0 6px rgba(0,0,0,0.07); user-select: none;
        }
        .cp-sidebar-toggle:hover { background: #eef2ff; }
        .cp-sidebar-icon-btn {
          width: 44px; height: 44px; border-radius: 10px; border: 1.5px solid #dde2ec;
          background: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px; color: #555; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .cp-sidebar-icon-btn:hover { background: #f0f4ff; }
        .cp-sidebar-link {
          display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 10px;
          border-radius: 8px; font-size: 13px; color: #333; font-weight: 500; cursor: pointer;
          border: 1px solid #e8ecf4; background: #fff; font-family: 'Space Grotesk', sans-serif; text-align: left;
        }
        .cp-sidebar-link:hover { background: #f0f4ff; color: #1a5cff; border-color: #c5d3ff; }
        .cp-sec-label-col { font-size: 9.5px; font-weight: 700; color: #1a5cff; letter-spacing: 1px; text-transform: uppercase; text-align: center; line-height: 1.4; }
        .cp-sec-label-row { font-size: 11px; font-weight: 700; color: #1a5cff; letter-spacing: 1.2px; text-transform: uppercase; padding: 4px 4px 0; }
        .cp-q-col { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
        .cp-q-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        .cp-q-btn {
          width: 44px; height: 44px; border-radius: 10px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; transition: transform 0.1s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .cp-q-btn:hover { transform: scale(1.08); }

        /* ── MAIN SPLIT ── */
        .cp-main { flex: 1; display: flex; overflow: hidden; min-width: 0; }

        /* ── LEFT: QUESTION PANEL ── */
        .cp-question-panel {
          width: 46%; min-width: 300px; display: flex; flex-direction: column;
          background: #fff; border-right: 1px solid #dde2ec; overflow: hidden;
        }
        .cp-q-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px 14px; border-bottom: 1px solid #f0f2f8; flex-shrink: 0;
        }
        .cp-q-label { font-size: 14px; font-weight: 700; color: #111; }
        .cp-revisit-btn {
          display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 500;
          color: #888; cursor: pointer; border: none; background: none;
          font-family: 'Space Grotesk', sans-serif; padding: 4px 6px; border-radius: 6px;
        }
        .cp-revisit-btn:hover { color: #f5a623; background: #fff8ee; }
        .cp-revisit-btn.active { color: #f5a623; }
        .cp-q-scroll { flex: 1; overflow-y: auto; padding: 16px 22px 24px; }
        .cp-q-problem-title { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 14px; line-height: 1.45; }
        .cp-q-body { font-size: 13.5px; color: #333; line-height: 1.85; }
        .cp-q-body p { margin-bottom: 10px; }
        .cp-q-body strong { font-weight: 700; color: #111; }
        .cp-highlight { background: #e8f1ff; color: #0d47e0; padding: 1px 6px; border-radius: 4px; font-weight: 600; font-family: 'Consolas', monospace; font-size: 12.5px; }
        .cp-section-heading { font-size: 13px; font-weight: 700; color: #111; margin: 16px 0 8px; }
        .cp-bullet { display: flex; gap: 8px; margin-bottom: 7px; font-size: 13.5px; color: #333; line-height: 1.6; }
        .cp-bullet::before { content: "•"; color: #1a5cff; font-size: 16px; line-height: 1.4; flex-shrink: 0; }
        .cp-note { background: #fffbe6; border: 1px solid #f5c518; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #7a6200; margin-top: 16px; }

        /* ── BOTTOM ACTION BAR ── */
        .cp-q-actions {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 22px; border-top: 1px solid #edf0f7; background: #fff; flex-shrink: 0; gap: 10px;
        }
        .cp-skip-btn {
          font-size: 13px; font-weight: 500; color: #555; cursor: pointer;
          border: none; background: none; font-family: 'Space Grotesk', sans-serif; padding: 8px 4px;
        }
        .cp-skip-btn:hover { color: #111; text-decoration: underline; }
        .cp-submit-code-btn {
          padding: 10px 28px; border: none; border-radius: 8px; font-size: 13.5px;
          font-weight: 700; font-family: 'Space Grotesk', sans-serif; cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .cp-submit-code-btn.idle   { background: #1a5cff; color: #fff; box-shadow: 0 3px 12px rgba(26,92,255,0.3); }
        .cp-submit-code-btn.idle:hover { background: #0d47e0; }
        .cp-submit-code-btn.saving { background: #5a84ff; color: #fff; cursor: default; }
        .cp-submit-code-btn.saved  { background: #28a745; color: #fff; }
        .cp-submit-code-btn:disabled { opacity: 0.6; cursor: default; }

        /* ── RIGHT COLUMN: EDITOR + TEST PANEL (stacked) ── */
        .cp-right-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; background: #fff; }

        /* Editor top bar */
        .cp-editor-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 16px; background: #f8f9fc; border-bottom: 1px solid #e8ecf4;
          flex-shrink: 0;
        }
        .cp-lang-label { font-size: 12.5px; font-weight: 600; color: #555; }
        .cp-lang-select {
          margin-left: 8px; background: #fff; color: #222; border: 1.5px solid #dde2ec;
          border-radius: 6px; padding: 5px 10px; font-size: 13px;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer; outline: none;
        }
        .cp-lang-select:focus { border-color: #1a5cff; }
        .cp-editor-icons { display: flex; gap: 4px; }
        .cp-icon-btn {
          background: none; border: none; color: #888; cursor: pointer;
          font-size: 16px; padding: 4px 6px; border-radius: 5px; line-height: 1;
        }
        .cp-icon-btn:hover { color: #1a5cff; background: #eef2ff; }

        /* Editor area */
        .cp-editor-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; border-bottom: 1px solid #e8ecf4; }

        /* ── TEST PANEL (below editor) ── */
        .cp-test-panel { flex-shrink: 0; background: #fff; display: flex; flex-direction: column; max-height: 320px; overflow-y: auto; border-top: 2px solid #e4e8f0; }

        /* Run bar at top of test panel */
        .cp-run-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; background: #f8f9fc; border-bottom: 1px solid #eaecf4;
          flex-shrink: 0;
        }
        .cp-run-label { font-size: 13px; font-weight: 700; color: #333; display: flex; align-items: center; gap: 8px; }
        .cp-test-count-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 20px; height: 20px; background: #f5a623; color: #fff;
          border-radius: 50%; font-size: 11px; font-weight: 700;
        }
        .cp-run-btns { display: flex; gap: 8px; }
        .cp-run-btn {
          padding: 8px 18px; border: none; border-radius: 7px; font-size: 13px;
          font-weight: 700; font-family: 'Space Grotesk', sans-serif; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: background 0.15s, opacity 0.15s;
        }
        .cp-run-btn:disabled { opacity: 0.55; cursor: default; }
        .cp-run-btn.sample { background: #1a5cff; color: #fff; }
        .cp-run-btn.sample:not(:disabled):hover { background: #0d47e0; }
        .cp-run-btn.all    { background: #e8eaed; color: #555; border: 1.5px solid #d0d4dc; }
        .cp-run-btn.all:not(:disabled):hover { background: #dde0e8; }

        /* Test cases accordion area */
        .cp-test-body { flex: 1; overflow-y: auto; }

        /* Section group header (Custom Test Case / Sample Test Case) */
        .cp-tc-group-header {
          padding: 10px 16px 6px; font-size: 12px; font-weight: 700;
          color: #888; text-transform: uppercase; letter-spacing: 0.6px;
          border-bottom: 1px solid #f0f2f8;
        }

        /* Accordion row */
        .cp-tc-row {
          display: flex; align-items: center; gap: 8px; padding: 9px 16px;
          cursor: pointer; border-bottom: 1px solid #f3f4f8; font-size: 13.5px;
          color: #333; font-weight: 400; user-select: none;
          transition: background 0.12s;
        }
        .cp-tc-row:hover { background: #f7f9ff; }
        .cp-tc-arrow { font-size: 10px; color: #aaa; transition: transform 0.15s; flex-shrink: 0; }
        .cp-tc-arrow.open { transform: rotate(90deg); }

        /* Expanded test case content */
        .cp-tc-content { background: #f8f9fc; border-bottom: 1px solid #edf0f7; padding: 10px 16px 14px; }
        .cp-tc-label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; margin-top: 8px; }
        .cp-tc-label:first-child { margin-top: 0; }
        .cp-output-block {
          background: #fff; border: 1px solid #e4e8f0; border-radius: 7px;
          padding: 8px 12px; font-size: 12.5px; font-family: 'Consolas', monospace;
          color: #333; white-space: pre; overflow-x: auto;
        }
        .cp-custom-textarea {
          width: 100%; background: #fff; border: 1.5px solid #e4e8f0; border-radius: 7px;
          padding: 8px 12px; font-size: 12.5px; font-family: 'Consolas', monospace;
          color: #333; resize: vertical; outline: none; min-height: 60px;
        }
        .cp-custom-textarea:focus { border-color: #1a5cff; }

        /* Run output inline inside test case */
        .cp-run-result {
          display: flex; align-items: center; gap: 8px; margin-top: 10px;
          padding: 8px 12px; border-radius: 7px; font-size: 13px;
        }
        .cp-run-result.pass { background: #f0fff4; border: 1px solid #b7e4c7; color: #1a7a35; }
        .cp-run-result.fail { background: #fff5f5; border: 1px solid #fcc; color: #c0392b; }

        /* Results summary strip */
        .cp-results-strip {
          display: flex; align-items: center; gap: 12px; padding: 10px 16px;
          background: #f8f9fc; border-bottom: 1px solid #edf0f7; font-size: 13px; font-weight: 700;
        }

        /* spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        .spinner.dark {
          border-color: rgba(0,0,0,0.15); border-top-color: #555;
        }
      `}</style>

      <div className="cp-root">

        {/* WARNING MODAL */}
        {warning && (
          <div className="cp-warning-overlay">
            <div className="cp-warning-box">
              <div className="cp-warning-header"><span style={{fontSize:20}}>⚠️</span>Warning</div>
              <div className="cp-warning-body">{warning}</div>
              <div className="cp-warning-footer">
                <button className="cp-warning-continue" onClick={handleContinueTest}>Continue Test</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOP NAV ── */}
        <div className="cp-nav">
          <div className="cp-logo">
            <img src={banner2} alt="FacePrep" />
          </div>
          <div className="cp-nav-center">{sectionTitle} | PIET - 21 March 2026</div>
          <div className="cp-nav-right">
            <span className={`cp-timer ${timeLeft < 300 ? "danger" : ""}`}>{mins}:{secsStr}</span>
            <button className="cp-submit-section-btn" onClick={handleSubmitSection}>Submit Section</button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="cp-body">

          {/* ── SIDEBAR ── */}
          <div className={`cp-sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <div className="cp-sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}>
              {sidebarOpen ? "‹" : "›"}
            </div>

            {sidebarOpen ? (
              <>
                <button className="cp-sidebar-link" onClick={onBackToList}>← &nbsp;All Questions</button>
                <button className="cp-sidebar-link">ⓘ &nbsp;View Instructions</button>
                <div className="cp-sec-label-row">SECTION - CODING</div>
                <div className="cp-q-grid">
                  {questions.map((_, idx) => (
                    <button key={idx} className="cp-q-btn" style={getBadgeStyle(statuses[idx])} onClick={() => goToQuestion(idx)}>
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button className="cp-sidebar-icon-btn" onClick={onBackToList} title="All Questions">←</button>
                <button className="cp-sidebar-icon-btn" title="View Instructions">ⓘ</button>
                <div className="cp-sec-label-col">SEC<br/>- 5</div>
                <div className="cp-q-col">
                  {questions.map((_, idx) => (
                    <button key={idx} className="cp-q-btn" style={getBadgeStyle(statuses[idx])} onClick={() => goToQuestion(idx)}>
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── MAIN ── */}
          <div className="cp-main">

            {/* ── LEFT: QUESTION ── */}
            <div className="cp-question-panel">
              <div className="cp-q-header">
                <span className="cp-q-label">Section 5 | Question {currentIdx + 1}</span>
                <button className={`cp-revisit-btn ${isRevisit ? "active" : ""}`} onClick={handleRevisit}>
                  Revisit &nbsp;<span>{isRevisit ? "🔖" : "🏷️"}</span>
                </button>
              </div>

              <div className="cp-q-scroll">
                <div className="cp-q-problem-title">{q.text}</div>
                <div className="cp-q-body">
                  {q.description ? (
                    <div dangerouslySetInnerHTML={{ __html: q.description }} />
                  ) : (
                    <>
                      <p>
                        In a large company, each employee has a <strong>unique salary</strong>. The employees are
                        organized in a <span className="cp-highlight">Binary Search Tree (BST)</span> based on their
                        salaries, where each node contains the employee's salary. The left child of a node has a salary
                        smaller than the current node, and the right child contains salaries greater than the current node.
                      </p>
                      <p>
                        The HR department needs a way to calculate the <strong>sum of employee salaries</strong> that
                        fall within a specific range, i.e., between <span className="cp-highlight">Salary1</span> and{" "}
                        <span className="cp-highlight">Salary2</span> (both inclusive).
                      </p>
                      <div className="cp-section-heading">Input Format</div>
                      <div className="cp-bullet">The first line contains an integer <span className="cp-highlight">n</span>, representing the number of employees to be inserted into the BST.</div>
                      <div className="cp-bullet">The second line contains <span className="cp-highlight">n</span> space-separated integers, representing the employee salaries.</div>
                      <div className="cp-bullet">The third line contains two integers <span className="cp-highlight">Salary1</span> and <span className="cp-highlight">Salary2</span>, representing the range of salaries.</div>
                      <div className="cp-section-heading">Output Format</div>
                      <div className="cp-bullet">Print the <strong>sum</strong> of employee salaries within the range <span className="cp-highlight">[Salary1, Salary2]</span>.</div>
                      <div className="cp-section-heading">Constraints</div>
                      <div className="cp-bullet"><span className="cp-highlight">1 ≤ n ≤ 10⁵</span></div>
                      <div className="cp-bullet"><span className="cp-highlight">1 ≤ salary ≤ 10⁹</span></div>
                      <div className="cp-bullet"><span className="cp-highlight">Salary1 ≤ Salary2</span></div>
                      <div className="cp-note">
                        <strong>Note :</strong> Please Run the code before submitting.
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div className="cp-q-actions">
                <button className="cp-skip-btn" onClick={handleSkip}>Skip Question</button>
                <button
                  className={`cp-submit-code-btn ${submitCodeState}`}
                  onClick={handleSubmitCode}
                  disabled={submitCodeState === "saving" || !currentCode.trim()}
                >
                  {submitCodeState === "saving" && <span className="spinner" />}
                  {submitCodeState === "saved"   ? "✓ Saved!"
                    : submitCodeState === "saving" ? "Saving…"
                    : isLast ? "Submit Code" : "Submit Code →"}
                </button>
              </div>
            </div>

            {/* ── RIGHT: EDITOR + TEST PANEL ── */}
            <div className="cp-right-col">

              {/* Language selector bar */}
              <div className="cp-editor-topbar">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className="cp-lang-label">Select Language :</span>
                  <select className="cp-lang-select" value={currentLang} onChange={e => setLanguage(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div className="cp-editor-icons">
                  <button className="cp-icon-btn" title="Reset to starter code" onClick={() => setCode(STARTER_CODE[currentLang])}>↺</button>
                  <button className="cp-icon-btn" title="Fullscreen">⤢</button>
                  <button className="cp-icon-btn" title="Close">✕</button>
                </div>
              </div>

              {/* Code editor */}
              <div className="cp-editor-area">
                <CodeEditor code={currentCode} onChange={setCode} />
              </div>

              {/* ── TEST PANEL (below editor) ── */}
              <div className="cp-test-panel">

                {/* Run bar */}
                <div className="cp-run-bar">
                  <div className="cp-run-label">
                    Test Cases
                    <span className="cp-test-count-badge">{sampleTestCases.length}</span>
                  </div>
                  <div className="cp-run-btns">
                    <button className="cp-run-btn sample" onClick={handleRunSample} disabled={isRunning}>
                      {runState === "running-sample"
                        ? <><span className="spinner" />Running…</>
                        : <> ▶ &nbsp;Run Sample Cases</>
                      }
                    </button>
                    <button className="cp-run-btn all" onClick={handleRunAll} disabled={isRunning}>
                      {runState === "running-all"
                        ? <><span className="spinner dark" />Running…</>
                        : <>Run All Cases</>
                      }
                    </button>
                  </div>
                </div>

                {/* Results summary strip (when results available) */}
                {runResults && (
                  <div className="cp-results-strip">
                    <span style={{ color: allPassed ? "#28a745" : "#e53c2b" }}>
                      {allPassed ? "✓" : "✗"} {passCount}/{totalCount} test cases passed
                    </span>
                    {runResults.type === "all" && (
                      <span style={{ fontSize: 12, color: "#888", fontWeight: 400 }}>— including hidden cases</span>
                    )}
                  </div>
                )}

                {/* Accordion test cases */}
                <div className="cp-test-body">

                  {/* Custom Test Case */}
                  <div className="cp-tc-group-header">Custom Test Case</div>
                  <ExpandableTestRow label="Custom Test" defaultOpen={false}>
                    <div className="cp-tc-label">Input</div>
                    <textarea
                      className="cp-custom-textarea"
                      placeholder="Enter your custom input here…"
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                    />
                  </ExpandableTestRow>

                  {/* Sample Test Cases */}
                  <div className="cp-tc-group-header">Sample Test Case</div>
                  {sampleTestCases.map((tc, i) => {
                    const result = runResults?.results?.[i];
                    return (
                      <ExpandableTestRow key={i} label={tc.label || `Test Case - ${i + 1}`} defaultOpen={i === 0}>
                        <div style={{ display: "flex", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div className="cp-tc-label">Input</div>
                            <div className="cp-output-block">{tc.input}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="cp-tc-label">Expected Output</div>
                            <div className="cp-output-block">{tc.expected}</div>
                          </div>
                        </div>
                        {result && (
                          <div className={`cp-run-result ${result.passed ? "pass" : "fail"}`}>
                            <span>{result.passed ? "✅" : "❌"}</span>
                            <span style={{ fontWeight: 600 }}>{result.passed ? "Passed" : "Wrong Answer"}</span>
                            <span style={{ fontSize: 12, marginLeft: "auto", color: "#888" }}>{result.time} · {result.memory}</span>
                          </div>
                        )}
                      </ExpandableTestRow>
                    );
                  })}

                  {/* Hidden test results (only shown after Run All) */}
                  {runResults?.type === "all" && runResults.results.slice(sampleTestCases.length).map((r, i) => (
                    <ExpandableTestRow key={`h${i}`} label={r.label} defaultOpen={false}>
                      <div className={`cp-run-result ${r.passed ? "pass" : "fail"}`}>
                        <span>{r.passed ? "✅" : "❌"}</span>
                        <span style={{ fontWeight: 600 }}>{r.passed ? "Passed" : "Wrong Answer"}</span>
                        <span style={{ fontSize: 12, color: "#aaa", marginLeft: 8, fontStyle: "italic" }}>input/output hidden</span>
                      </div>
                    </ExpandableTestRow>
                  ))}

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Expandable test row ────────────────────────────────────────────────────
function ExpandableTestRow({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <div className="cp-tc-row" onClick={() => setOpen(v => !v)}>
        <span className={`cp-tc-arrow ${open ? "open" : ""}`}>▶</span>
        {label}
      </div>
      {open && <div className="cp-tc-content">{children}</div>}
    </>
  );
}