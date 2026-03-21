import React, { useState, useEffect } from "react";
import manImage from "../assets/man1.png";

export default function SettleInPage({ onComplete, seconds = 10 }) {
  const [count, setCount] = useState(seconds);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (count <= 0) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const formatted = `00:${String(count).padStart(2, "0")}`;

  // Called on the user-gesture click — fullscreen + navigate
  function handleBegin() {
    const el = document.documentElement;
    const fsPromise =
      el.requestFullscreen?.()           ||
      el.webkitRequestFullscreen?.()     ||
      el.mozRequestFullScreen?.()        ||
      el.msRequestFullscreen?.();

    if (fsPromise && typeof fsPromise.then === "function") {
      fsPromise.then(() => onComplete?.()).catch(() => onComplete?.());
    } else {
      onComplete?.();
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .si-root {
          min-height: 100vh;
          background: url('https://user.faceprep.online/stintcodebg.svg') center center / cover no-repeat;
          background-color: #071580;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          padding: 24px;
        }

        .si-card {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          padding: 56px 48px 52px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.22);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .si-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a5cff;
          text-align: center;
          margin-bottom: 32px;
          letter-spacing: -0.5px;
        }

        .si-illustration {
          width: 260px;
          height: 260px;
          object-fit: contain;
          margin-bottom: 32px;
        }

        .si-footer {
          font-size: 15px;
          color: #444;
          font-weight: 400;
          text-align: center;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }

        .si-countdown {
          color: #1a5cff;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
          animation: pulse 1s ease-in-out infinite;
        }

        /* Begin button — shown after countdown hits 0 */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .si-begin-btn {
          margin-top: 28px;
          padding: 14px 48px;
          background: #1a5cff;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(26,92,255,0.38);
          animation: fadeIn 0.35s ease both;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
        }

        .si-begin-btn:hover {
          background: #0d47e0;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26,92,255,0.48);
        }

        .si-begin-btn:active {
          transform: translateY(0);
        }

        .si-ready-text {
          font-size: 15px;
          color: #28a745;
          font-weight: 600;
          margin-bottom: 4px;
          animation: fadeIn 0.3s ease both;
        }
      `}</style>

      <div className="si-root">
        <div className="si-card">
          <h1 className="si-title">Settle-In, Your assessment begins here</h1>

          <img
            className="si-illustration"
            src={manImage}
            alt="Settle in illustration"
          />

          {!done ? (
            /* Countdown phase */
            <p className="si-footer">
              Your assessment begins in{" "}
              <span className="si-countdown">{formatted} secs</span>
            </p>
          ) : (
            /* Ready phase — user must click to trigger fullscreen */
            <>
              <p className="si-ready-text">✓ You're all set!</p>
              <p className="si-footer">Click the button below to enter fullscreen and begin.</p>
              <button className="si-begin-btn" onClick={handleBegin}>
                Begin Test →
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}