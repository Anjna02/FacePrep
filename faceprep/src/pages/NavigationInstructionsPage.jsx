import React, { useState } from "react";

export default function NavigationInstructionsPage({ onContinue, duration = "30 minutes" }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ni-root {
          min-height: 100vh;
          background: url('https://user.faceprep.online/stintcodebg.svg') center center / cover no-repeat;
          background-color: #071580;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 36px 24px 48px;
          font-family: 'Space Grotesk', sans-serif;
        }

        .ni-tagline {
          font-size: 26px;
          font-weight: 700;
          color: #f5c518;
          text-align: center;
          max-width: 740px;
          line-height: 1.35;
          margin-bottom: 28px;
          letter-spacing: -0.3px;
        }

        /* Outer card — fixed max-height so it floats and scrolls */
        .ni-card {
          background: #fff;
          border-radius: 14px;
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.28);
          /* fixed height so content scrolls inside */
          max-height: 72vh;
          overflow: hidden;
        }

        /* Scrollable body */
        .ni-body {
          flex: 1;
          overflow-y: scroll;
          padding: 36px 48px 24px;
          /* always show scrollbar track so it looks like screenshot */
          scrollbar-width: auto;
          scrollbar-color: #b0b8cc #f0f0f0;
        }

        .ni-body::-webkit-scrollbar {
          width: 10px;
        }
        .ni-body::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 0 14px 0 0;
        }
        .ni-body::-webkit-scrollbar-thumb {
          background: #b0b8cc;
          border-radius: 5px;
        }

        .ni-label {
          font-size: 11px;
          font-weight: 700;
          color: #1a5cff;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .ni-heading {
          font-size: 15.5px;
          font-weight: 700;
          color: #111;
          text-decoration: underline;
          margin-bottom: 20px;
        }

        .ni-point {
          font-size: 14px;
          color: #333;
          margin-bottom: 14px;
          line-height: 1.65;
          font-weight: 400;
        }

        .ni-point strong {
          font-weight: 700;
          color: #111;
        }

        /* Legend */
        .ni-legend {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 8px 0 18px 18px;
        }

        .ni-legend-row {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 14px;
          color: #333;
        }

        .ni-badge {
          width: 34px;
          height: 34px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          position: relative;
        }

        .ni-badge.not-answered  { background: #e8eaed; color: #555; border: 1.5px solid #ccc; }
        .ni-badge.current       { background: #1a5cff; }
        .ni-badge.answered      { background: #28a745; }
        .ni-badge.marked-no-ans { background: #e8eaed; color: #555; border: 1.5px solid #ccc; }
        .ni-badge.marked-ans    { background: #28a745; }

        .ni-badge .dot {
          position: absolute;
          top: -4px; right: -4px;
          width: 11px; height: 11px;
          background: #f5a623;
          border-radius: 50%;
          border: 1.5px solid #fff;
        }

        /* Sub-bullets */
        .ni-sub-list {
          list-style: disc;
          padding-left: 26px;
          margin: 8px 0 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ni-sub-list li {
          font-size: 14px;
          color: #333;
          line-height: 1.65;
        }

        .ni-sub-list li strong {
          font-weight: 700;
          color: #111;
        }

        /* Fixed bottom strip */
        .ni-footer {
          flex-shrink: 0;
          padding: 16px 48px 24px;
          background: #fff;
          border-top: 1.5px solid #e4e6ea;
        }

        .ni-checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          cursor: pointer;
          user-select: none;
        }

        .ni-checkbox-row input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #1a5cff;
          cursor: pointer;
          flex-shrink: 0;
        }

        .ni-checkbox-row span {
          font-size: 13px;
          color: #444;
          font-weight: 400;
        }

        .ni-continue-btn {
          padding: 11px 32px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
          min-width: 130px;
        }

        .ni-continue-btn.disabled {
          background: #9db3d8;
          color: #fff;
          cursor: not-allowed;
        }

        .ni-continue-btn.enabled {
          background: #1a5cff;
          color: #fff;
          box-shadow: 0 4px 16px rgba(26,92,255,0.35);
        }

        .ni-continue-btn.enabled:hover {
          background: #0d47e0;
          transform: translateY(-1px);
        }

        .ni-continue-btn.enabled:active {
          transform: translateY(0);
        }
      `}</style>

      <div className="ni-root">

        {/* Yellow tagline above card */}
        <div className="ni-tagline">
          Read the short navigation guide below first—it'll make<br />
          moving through the application fast and stress-free.
        </div>

        {/* Floating card */}
        <div className="ni-card">

          {/* ── Scrollable content ── */}
          <div className="ni-body">
            <div className="ni-label">Navigation Instructions</div>
            <div className="ni-heading">Please read the following instructions carefully:</div>

            <p className="ni-point">1. Total duration of the assessment is {duration}.</p>

            <p className="ni-point">
              2. Time is server-controlled; the top-right countdown shows your remaining time
              and the assessment ends automatically at zero.
            </p>

            <p className="ni-point">3. Button colors indicate the status of each question; refer to the legend below:</p>
            <div className="ni-legend">
              <div className="ni-legend-row">
                <div className="ni-badge not-answered">1</div>
                <span>You have not answered the question</span>
              </div>
              <div className="ni-legend-row">
                <div className="ni-badge current">3</div>
                <span>This is your current question</span>
              </div>
              <div className="ni-legend-row">
                <div className="ni-badge answered">5</div>
                <span>You have answered the question</span>
              </div>
              <div className="ni-legend-row">
                <div className="ni-badge marked-no-ans">
                  7<span className="dot" />
                </div>
                <span>You have not answered the question and marked for re-visit</span>
              </div>
              <div className="ni-legend-row">
                <div className="ni-badge marked-ans">
                  9<span className="dot" />
                </div>
                <span>You have answered the question and marked for re-visit</span>
              </div>
            </div>

            <p className="ni-point">4. To answer a question, do the following:</p>
            <ul className="ni-sub-list">
              <li>Click on the question number in the Question Palette to go to that question directly.</li>
              <li>Click <strong>Submit Answer</strong> to save your answer for the current question and then go to the next question.</li>
              <li>Click <strong>Skip Question</strong> to skip the current question and go to the next question.</li>
              <li>Click <strong>Re-visit</strong> to return to a question and review your answer.</li>
              <li>Click <strong>Run Code</strong> to run the test cases.</li>
              <li>Click <strong>End Test</strong> to submit your test.</li>
            </ul>

            <p className="ni-point">
              5. You can view all the questions by clicking on the <strong>All Questions</strong> button.
            </p>

            <p className="ni-point">
              6. You can view these instructions by clicking on the <strong>View Instructions</strong> button.
            </p>
          </div>

          {/* ── Fixed footer: checkbox + button ── */}
          <div className="ni-footer">
            <label className="ni-checkbox-row">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <span>I've reviewed the instructions and am ready to start the test.</span>
            </label>

            <button
              className={`ni-continue-btn ${agreed ? "enabled" : "disabled"}`}
              onClick={() => agreed && onContinue && onContinue()}
              disabled={!agreed}
            >
              Continue
            </button>
          </div>

        </div>
      </div>
    </>
  );
}