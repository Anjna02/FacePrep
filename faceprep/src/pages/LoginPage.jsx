import React, { useState } from "react";
import bannerLogo from "../assets/banner.png";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(false);

  function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError(true);
      return;
    }
    setError(false);
    const username = email.includes("@") ? email.split("@")[0] : email;
    if (onLogin) onLogin(username);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: url('https://user.faceprep.online/stintcodebg.svg') center center / cover no-repeat;
          background-color: #071580;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 0 0 80px 64px;
          background: transparent;
        }

        .logo-area {
          position: absolute;
          top: 36px;
          left: 48px;
          z-index: 4;
        }

        .left-tagline {
          color: #fff;
          font-size: 52px;
          font-weight: 700;
          line-height: 1.2;
          text-shadow: 0 2px 20px rgba(0,0,0,0.25);
          font-family: 'Tenor sans', sans-serif;
        }

        /* ── RIGHT PANEL ── */
        .right-panel {
          width: 600px;
          flex-shrink: 0;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          position: relative;
        }

        /* Arch card — Login.svg is the background (arch shape + sparkle already inside) */
        .arch-card {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 30px 80px rgba(0,0,0,0.40);
          position: relative;
          background: url('https://user.faceprep.online/Login.svg') top center / 100% 100% no-repeat;
          border-radius: 230px 230px 16px 16px;
          overflow: hidden;
        }

        /* Form area */
        .form-area {
          width: 100%;
          padding: 72px 52px 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .welcome-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #111;
          text-align: center;
          letter-spacing: -0.5px;
        }

        .welcome-sub {
          font-size: 13px;
          color: #888;
          text-align: center;
          margin-top: -10px;
          line-height: 1.5;
        }

        .inputs-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 4px;
        }

        .input-field {
          width: 100%;
          background: #e2e5f0;
          border: 1.5px solid transparent;
          border-radius: 10px;
          padding: 16px 18px;
          font-size: 14px;
          color: #222;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, background 0.2s;
        }

        .input-field::placeholder { color: #9099b8; }

        .input-field:focus {
          border-color: #1a5cff;
          background: #d6daef;
        }

        .pwd-wrap {
          position: relative;
          width: 100%;
        }

        .pwd-wrap .input-field {
          padding-right: 64px;
        }

        .show-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          font-size: 13px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          padding: 4px;
        }

        .error-msg {
          color: #e53c2b;
          font-size: 13px;
          margin-top: -8px;
        }

        .signin-btn {
          width: 100%;
          padding: 16px;
          background: #1a5cff;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          letter-spacing: 0.5px;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(26,92,255,0.4);
        }

        .signin-btn:hover {
          background: #0d47e0;
          box-shadow: 0 6px 24px rgba(26,92,255,0.5);
          transform: translateY(-1px);
        }

        .signin-btn:active {
          transform: translateY(0);
        }

        .forgot-link {
          font-size: 13px;
          color: #1a5cff;
          text-decoration: none;
          font-weight: 500;
          margin-top: -6px;
          transition: text-decoration 0.2s;
        }

        .forgot-link:hover { text-decoration: underline; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; }
        }
      `}</style>

      <div className="login-root">

        {/* LEFT */}
        <div className="left-panel">
          <div className="logo-area">
            <img src={bannerLogo} alt="FACEPrep" style={{ marginTop: 150, height: 202, objectFit: "contain" }} />
          </div>
          <p className="left-tagline">Start your journey<br />with us!</p>
        </div>

        {/* RIGHT */}
        <div className="right-panel">
          <div className="arch-card">
            <div className="form-area">
              <h1 className="welcome-title">Welcome Champ!</h1>
              <p className="welcome-sub">Log in, Show up, and let your talent speak…</p>

              <div className="inputs-wrap">
                <input
                  className="input-field"
                  type="email"
                  placeholder="Enter email id"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <div className="pwd-wrap">
                  <input
                    className="input-field"
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="show-btn" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && <span className="error-msg">Please enter email and password.</span>}

              <button className="signin-btn" onClick={handleLogin}>Sign In</button>

              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}