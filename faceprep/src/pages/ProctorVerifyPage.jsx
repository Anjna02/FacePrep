// src/pages/ProctorVerifyPage.jsx
import React, { useState, useRef } from "react";
import { proctor } from "../api/api";

const CODE_LENGTH = 6;

export default function ProctorVerifyPage({ assessment, onSuccess, onCancel }) {
  const [digits,  setDigits]  = useState(Array(CODE_LENGTH).fill(""));
  const [shake,   setShake]   = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  function handleChange(i, val) {
    if (!/^[a-zA-Z0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val.toUpperCase();
    setDigits(next);
    if (val && i < CODE_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits]; next[i] = ""; setDigits(next);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
        const next = [...digits]; next[i - 1] = ""; setDigits(next);
      }
    } else if (e.key === "ArrowLeft"  && i > 0)             inputRefs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) inputRefs.current[i + 1]?.focus();
    else if (e.key === "Enter")                              handleSubmit();
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\s/g, "").toUpperCase().slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  async function handleSubmit() {
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      // Fire email notification to backend — does NOT verify the code
      await proctor.notify(code, assessment?.title);
      console.log("Sent");
    } catch {
      // Silent fail — email is best-effort, we still proceed
    }
    setLoading(false);
    onSuccess();
  }

  const filled = digits.filter(Boolean).length;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundImage: "url('https://user.faceprep.online/stintcodebg.svg')", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", zIndex: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        .proctor-shake { animation: shake 0.45s ease; }
        .digit-input:focus { outline: none; border-color: #1a5cff !important; box-shadow: 0 0 0 3px rgba(26,92,255,0.18); }
        .proctor-submit-btn { width: 100%; padding: 14px 0; border: none; border-radius: 10px; color: #fff; font-weight: 700; font-size: 15px; font-family: 'Space Grotesk', sans-serif; transition: background 0.2s; margin-bottom: 4px; }
        .proctor-submit-btn:not(:disabled) { background: #1a5cff; cursor: pointer; }
        .proctor-submit-btn:not(:disabled):hover { background: #0d47e0; }
        .proctor-submit-btn:disabled { background: #c8d4f8; cursor: default; }
      `}</style>

      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 52px 40px", width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, boxShadow: "0 32px 80px rgba(0,0,0,0.22)" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#111", marginBottom: 4 }}>Verify</div>
        <div style={{ fontSize: 13.5, color: "#666", textAlign: "center", lineHeight: 1.5, marginBottom: 16 }}>
          Enter the Proctor Code given by your Administrator!
        </div>

        <div className={shake ? "proctor-shake" : ""} style={{ display: "flex", gap: 10, marginBottom: 4 }}>
          {digits.map((d, i) => (
            <input key={i} ref={el => inputRefs.current[i] = el} className="digit-input"
              type="text" inputMode="text" maxLength={1} value={d} autoFocus={i === 0}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste}
              style={{
                width: 56, height: 62, textAlign: "center", fontSize: 22, fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif", color: "#111", background: "#f4f6fb",
                border: `2px solid ${d ? "#1a5cff" : "#dde1ed"}`, borderRadius: 10,
                transition: "border-color 0.15s",
              }}
            />
          ))}
        </div>

        <button
          className="proctor-submit-btn"
          onClick={handleSubmit}
          disabled={loading || filled < CODE_LENGTH}
        >
          {loading ? "Submitting…" : "Submit"}
        </button>

        <div style={{ fontSize: 13, color: "#999", marginTop: 6, fontWeight: 400 }}>
          Code is Incorrect?{" "}
          <span style={{ color: "#1a5cff", cursor: "pointer", fontWeight: 600 }}>Contact Administrator</span>
        </div>
        <div onClick={onCancel} style={{ fontSize: 12, color: "#bbb", cursor: "pointer", marginTop: 4 }}>
          ← Go Back
        </div>
      </div>
    </div>
  );
}