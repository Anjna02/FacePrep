import React, { useState, useRef } from "react";

const CODE_LENGTH = 6;
const CORRECT_CODE = "123456"; // replace with real proctor code

export default function ProctorVerifyPage({ onSuccess, onCancel }) {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  function handleChange(i, val) {
    if (!/^[a-zA-Z0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val.toUpperCase();
    setDigits(next);
    setError(false);
    if (val && i < CODE_LENGTH - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        setDigits(next);
      } else if (i > 0) {
        inputRefs.current[i - 1]?.focus();
        const next = [...digits];
        next[i - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
      inputRefs.current[i + 1]?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\s/g, "").toUpperCase().slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    setError(false);
  }

  function handleSubmit() {
    const code = digits.join("");
    if (code.length < CODE_LENGTH) { triggerError(); return; }
    if (code !== CORRECT_CODE) { triggerError(); return; }
    onSuccess();
  }

  function triggerError() {
    setError(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  const filled = digits.filter(Boolean).length;

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundImage: "url('https://user.faceprep.online/stintcodebg.svg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Space Grotesk', sans-serif",
      zIndex: 100,
    }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        .proctor-shake { animation: shake 0.45s ease; }
        .digit-input:focus {
          outline: none;
          border-color: #1a5cff !important;
          box-shadow: 0 0 0 3px rgba(26,92,255,0.18);
        }
      `}</style>

      {/* Card */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        padding: "48px 52px 40px",
        width: "100%",
        maxWidth: 500,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
      }}>

        {/* Title */}
        <div style={{ fontSize: 26, fontWeight: 700, color: "#111", marginBottom: 4 }}>
          Verify
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 13.5, color: "#666", fontWeight: 400, textAlign: "center", lineHeight: 1.5, marginBottom: 16 }}>
          Enter the Proctor Code given by your Administrator!
        </div>

        {/* OTP boxes */}
        <div
          className={shake ? "proctor-shake" : ""}
          style={{ display: "flex", gap: 10, marginBottom: 4 }}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              className="digit-input"
              type="text"
              inputMode="text"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
              style={{
                width: 56,
                height: 62,
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#111",
                background: "#f4f6fb",
                border: `2px solid ${error ? "#e53c2b" : d ? "#1a5cff" : "#dde1ed"}`,
                borderRadius: 10,
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            />
          ))}
        </div>

        {/* Error */}
        <div style={{
          fontSize: 12,
          color: "#e53c2b",
          fontWeight: 500,
          height: 18,
          marginBottom: 6,
          opacity: error ? 1 : 0,
          transition: "opacity 0.2s",
        }}>
          Incorrect code. Please try again.
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "14px 0",
            border: "none",
            borderRadius: 10,
            background: filled === CODE_LENGTH ? "#1a5cff" : "#c8d4f8",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            fontFamily: "'Space Grotesk', sans-serif",
            cursor: filled === CODE_LENGTH ? "pointer" : "default",
            transition: "background 0.2s",
            marginBottom: 4,
          }}
          onMouseOver={e => { if (filled === CODE_LENGTH) e.currentTarget.style.background = "#0d3aeb"; }}
          onMouseOut={e => { e.currentTarget.style.background = filled === CODE_LENGTH ? "#1a5cff" : "#c8d4f8"; }}
        >
          Submit
        </button>

        {/* Footer */}
        <div style={{ fontSize: 13, color: "#999", marginTop: 6, fontWeight: 400 }}>
          Code is Incorrect?{" "}
          <span style={{ color: "#1a5cff", cursor: "pointer", fontWeight: 600 }}>
            Contact Administrator
          </span>
        </div>

        <div
          onClick={onCancel}
          style={{ fontSize: 12, color: "#bbb", cursor: "pointer", marginTop: 4, fontWeight: 400 }}
        >
          ← Go Back
        </div>
      </div>
    </div>
  );
}