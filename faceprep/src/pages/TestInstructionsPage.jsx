import React, { useState } from "react";

const INSTRUCTIONS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: "Use Desktop or Laptop",
    desc: "Mobile devices aren't recommended for coding questions.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    title: "Latest Browser",
    desc: "Use the latest version of Google Chrome (v60+) or Firefox.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 8.5C5 5 9.5 3 12 3s7 2 10.5 5.5"/><path d="M5 12c1.8-1.8 4.3-3 7-3s5.2 1.2 7 3"/><path d="M8.5 15.5c1-1 2.2-1.5 3.5-1.5s2.5.5 3.5 1.5"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
      </svg>
    ),
    title: "Internet Speed",
    desc: "Minimum 2 Mbps (upload/download).",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Disable Antivirus",
    desc: "If you face login issues, temporarily disable it and retry.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><rect x="5" y="6" width="4" height="3" rx="0.5"/>
      </svg>
    ),
    title: "Full-screen mode",
    desc: "This is required — exiting full-screen will pause or end your session.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
    ),
    title: "Auto-save enabled",
    desc: "Your progress is saved periodically.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
    title: "Avoid tab switching",
    desc: "This will automatically submit your test and flag malpractice.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    title: "Disable pop-ups and notifications",
    desc: "These may interfere and be marked as malpractice.",
  },
];

export default function TestInstructionsPage({ assessment, onStart }) {
  const [agreed, setAgreed] = useState(false);

  const title     = assessment?.title          || "Ratio and proportion | PIET - 21 March 2026";
  const sections  = assessment?.totalSections  ?? 1;
  const questions = assessment?.totalQuestions ?? 10;
  const duration  = assessment?.duration       || "30 Mins";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ti-root {
          display: flex;
          align-items: stretch;
          min-height: 100vh;
          font-family: 'Space Grotesk', sans-serif;
          background: url('https://user.faceprep.online/stintcodebg.svg') center center / cover no-repeat;
          background-color: #071580;
        }

        /* LEFT */
        .ti-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 64px 56px 48px;
        }

        .ti-welcome h1 {
          font-size: 44px;
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -0.5px;
          margin-bottom: 14px;
        }

        .ti-welcome p {
          font-size: 14.5px;
          color: rgba(255,255,255,0.78);
          line-height: 1.65;
          max-width: 360px;
          font-weight: 400;
          margin-bottom: 36px;
        }

        .ti-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border-radius: 10px;
          padding: 13px 18px;
          margin-bottom: 10px;
        }

        .ti-info-label {
          font-size: 13px;
          color: #555;
          font-weight: 400;
        }

        .ti-info-value {
          font-size: 13.5px;
          color: #1a5cff;
          font-weight: 700;
          text-align: right;
          max-width: 260px;
        }

        .ti-powered {
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          font-weight: 400;
        }

        /* RIGHT — floating card aligned to right edge, filling full height */
        .ti-right-wrap {
          width: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: stretch;
          padding: 18px 18px 18px 0;
        }

        .ti-card {
          background: #f4f6f9;
          border-radius: 14px;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.28);
        }

        /* Scrollable instructions area */
        .ti-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 30px 30px 16px;
          scrollbar-width: thin;
          scrollbar-color: #c8cfe0 transparent;
        }

        .ti-scroll::-webkit-scrollbar { width: 6px; }
        .ti-scroll::-webkit-scrollbar-track { background: transparent; }
        .ti-scroll::-webkit-scrollbar-thumb { background: #c8cfe0; border-radius: 3px; }

        .ti-instr-label {
          font-size: 11px;
          font-weight: 700;
          color: #1a5cff;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .ti-instr-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ti-instr-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .ti-icon-wrap {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #e4e9f4;
          color: #3a4a6b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ti-instr-text h4 {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          margin-bottom: 3px;
          line-height: 1.3;
        }

        .ti-instr-text p {
          font-size: 12.5px;
          color: #888;
          line-height: 1.5;
          font-weight: 400;
        }

        /* Sticky bottom */
        .ti-bottom {
          flex-shrink: 0;
          padding: 16px 30px 22px;
          background: #f4f6f9;
          border-top: 1px solid #dde2ed;
        }

        .ti-checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          cursor: pointer;
          user-select: none;
        }

        .ti-checkbox-row input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #1a5cff;
          cursor: pointer;
          flex-shrink: 0;
        }

        .ti-checkbox-row span {
          font-size: 13px;
          color: #444;
          font-weight: 400;
        }

        .ti-start-btn {
          padding: 12px 36px;
          border: none;
          border-radius: 9px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
          min-width: 150px;
        }

        .ti-start-btn.disabled {
          background: #8e98b0;
          color: #fff;
          cursor: not-allowed;
        }

        .ti-start-btn.enabled {
          background: #1a5cff;
          color: #fff;
          box-shadow: 0 5px 18px rgba(26,92,255,0.38);
        }

        .ti-start-btn.enabled:hover {
          background: #0d47e0;
          transform: translateY(-1px);
          box-shadow: 0 7px 22px rgba(26,92,255,0.45);
        }

        .ti-start-btn.enabled:active { transform: translateY(0); }
      `}</style>

      <div className="ti-root">

        {/* LEFT */}
        <div className="ti-left">
          <div className="ti-welcome">
            <h1>Welcome Champ!</h1>
            <p>Please read the instructions carefully and give your best in the interview. All the Best!</p>

            <div className="ti-info-row">
              <span className="ti-info-label">Assessment</span>
              <span className="ti-info-value">{title}</span>
            </div>
            <div className="ti-info-row">
              <span className="ti-info-label">No. of Sections</span>
              <span className="ti-info-value">{sections}</span>
            </div>
            <div className="ti-info-row">
              <span className="ti-info-label">No. of Questions</span>
              <span className="ti-info-value">{questions}</span>
            </div>
            <div className="ti-info-row">
              <span className="ti-info-label">Total duration</span>
              <span className="ti-info-value">{duration}</span>
            </div>
          </div>

          <div className="ti-powered">Powered by Faceprep</div>
        </div>

        {/* RIGHT — floating card */}
        <div className="ti-right-wrap">
          <div className="ti-card">

            <div className="ti-scroll">
              <div className="ti-instr-label">Instructions</div>
              <div className="ti-instr-list">
                {INSTRUCTIONS.map((item, i) => (
                  <div className="ti-instr-item" key={i}>
                    <div className="ti-icon-wrap">{item.icon}</div>
                    <div className="ti-instr-text">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ti-bottom">
              <label className="ti-checkbox-row">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                />
                <span>I've reviewed the instructions and am ready to start the test.</span>
              </label>

              <button
                className={`ti-start-btn ${agreed ? "enabled" : "disabled"}`}
                onClick={() => agreed && onStart && onStart()}
                disabled={!agreed}
              >
                Start Test
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}