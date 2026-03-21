// StartAssessmentModal.jsx
// Usage: place this overlay in AssessmentsPage (or App root) and toggle with state.
//
// Props:
//   open        {boolean}  — whether modal is visible
//   onConfirm   {function} — called when user clicks "Start Test"
//   onCancel    {function} — called when user clicks "Cancel" or backdrop

import React, { useEffect, useState } from "react";

export default function StartAssessmentModal({ open, onConfirm, onCancel }) {
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  // Mount → trigger entrance animation
  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)));
    } else {
      setAnimIn(false);
      const t = setTimeout(() => setVisible(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .sam-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.22s ease;
        }

        .sam-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 36px 36px 28px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: 'Space Grotesk', sans-serif;
          transition: transform 0.22s cubic-bezier(0.34,1.3,0.64,1), opacity 0.2s ease;
        }

        .sam-title {
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .sam-body {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
          margin: 0;
          font-weight: 400;
        }

        .sam-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }

        .sam-btn-cancel {
          background: none;
          border: none;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #555;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .sam-btn-cancel:hover {
          background: #f0f0f0;
          color: #111;
        }

        .sam-btn-confirm {
          background: #1a5cff;
          border: none;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(26, 92, 255, 0.35);
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
        }
        .sam-btn-confirm:hover {
          background: #0d47e0;
          box-shadow: 0 6px 20px rgba(26, 92, 255, 0.45);
          transform: translateY(-1px);
        }
        .sam-btn-confirm:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="sam-backdrop"
        style={{ opacity: animIn ? 1 : 0 }}
        onClick={onCancel}
      >
        {/* Card — stop propagation so clicking card doesn't close */}
        <div
          className="sam-card"
          style={{
            transform: animIn ? "scale(1) translateY(0)" : "scale(0.92) translateY(12px)",
            opacity: animIn ? 1 : 0,
          }}
          onClick={e => e.stopPropagation()}
        >
          <h2 className="sam-title">Start Assessment</h2>
          <p className="sam-body">
            Once you start the assessment, the timer may begin. Do you want to continue?
          </p>

          <div className="sam-actions">
            <button className="sam-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="sam-btn-confirm" onClick={onConfirm}>
              Start Test
            </button>
          </div>
        </div>
      </div>
    </>
  );
}