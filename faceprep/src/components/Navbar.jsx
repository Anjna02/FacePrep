// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import banner2 from "../assets/banner2.png";

export default function Navbar({ activePage, onNavigate, username, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = username ? username.charAt(0).toUpperCase() : "U";

  const linkBase = {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 14, fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 500, padding: "7px 18px", borderRadius: 8,
    display: "flex", alignItems: "center", gap: 7,
    transition: "background 0.15s, color 0.15s",
    whiteSpace: "nowrap",
  };

  const activeLink = {
    ...linkBase,
    background: "#f5c518",
    color: "#111",
    fontWeight: 700,
  };

  const inactiveLink = {
    ...linkBase,
    color: "#fff",
  };

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      background: "#1a5cff",
      height: 56,
      padding: "0 20px",
      gap: 0,
      position: "relative",
    }}>
      {/* Logo */}
      <div
        onClick={() => onNavigate("dashboard")}
        style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0, marginRight: 8 }}
      >
        <img src={banner2} alt="FacePrep" style={{ height: 34, objectFit: "contain" }} />
      </div>

      {/* Nav links — centered */}
      <div style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <button
          onClick={() => onNavigate("dashboard")}
          style={activePage === "dashboard" ? activeLink : inactiveLink}
          onMouseOver={e => { if (activePage !== "dashboard") e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
          onMouseOut={e => { if (activePage !== "dashboard") e.currentTarget.style.background = "none"; }}
        >
          {/* compass/dashboard icon */}
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <circle cx="10" cy="10" r="2" fill="currentColor"/>
            <line x1="10" y1="1" x2="10" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="10" y1="15" x2="10" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="1" y1="10" x2="5" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="15" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          My Dashboard
        </button>

        <button
          onClick={() => onNavigate("assessments")}
          style={activePage === "assessments" ? activeLink : inactiveLink}
          onMouseOver={e => { if (activePage !== "assessments") e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
          onMouseOut={e => { if (activePage !== "assessments") e.currentTarget.style.background = "none"; }}
        >
          My Assessments
        </button>

        <button
          style={inactiveLink}
          onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
          onMouseOut={e => { e.currentTarget.style.background = "none"; }}
        >
          My Courses
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Avatar + Dropdown */}
      <div ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <div
          onClick={() => setDropdownOpen(prev => !prev)}
          style={{
            width: 36, height: 36, background: "#f5c518", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, color: "#111", fontSize: 15,
            cursor: "pointer", userSelect: "none",
            boxShadow: dropdownOpen ? "0 0 0 3px rgba(245,197,24,0.4)" : "none",
            transition: "box-shadow 0.2s",
          }}
          title={username || "Profile"}
        >
          {initial}
        </div>

        {dropdownOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            background: "#fff", borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            minWidth: 210, zIndex: 999, overflow: "hidden",
            animation: "fadeSlideDown 0.15s ease",
          }}>
            <style>{`
              @keyframes fadeSlideDown {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <div style={{
              padding: "16px 18px 12px", borderBottom: "1px solid #f0f0f0",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: "#f5c518",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#111", fontWeight: 700, fontSize: 16, flexShrink: 0,
              }}>
                {initial}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{username || "User"}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Student</div>
              </div>
            </div>

            <div style={{ padding: "6px 0" }}>
              {[{ icon: "", label: "My Profile" }, { icon: "", label: "Settings" }].map(item => (
                <button
                  key={item.label}
                  style={{
                    width: "100%", background: "none", border: "none",
                    textAlign: "left", padding: "10px 18px", fontSize: 14,
                    color: "#333", cursor: "pointer", display: "flex",
                    alignItems: "center", gap: 10, fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#f5f7ff"}
                  onMouseOut={e => e.currentTarget.style.background = "none"}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}

              <div style={{ borderTop: "1px solid #f0f0f0", margin: "6px 0" }} />

              <button
                onClick={() => { setDropdownOpen(false); onLogout(); }}
                style={{
                  width: "100%", background: "none", border: "none",
                  textAlign: "left", padding: "10px 18px", fontSize: 14,
                  color: "#e53c2b", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onMouseOver={e => e.currentTarget.style.background = "#fff5f5"}
                onMouseOut={e => e.currentTarget.style.background = "none"}
              >
                <span></span> Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}