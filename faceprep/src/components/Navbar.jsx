import React, { useState, useRef, useEffect } from "react";

export default function Navbar({ activePage, onNavigate, username, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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

  return (
    <div style={{ padding: "10px 16px", background: "#e8eaed" }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 24px", borderRadius: "999px",
        background: "#1a5cff", boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}>
        {/* Logo */}
        <div
          onClick={() => onNavigate("dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
        >
          <div style={{
            width: 32, height: 32, background: "#e53c2b",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 16,
            clipPath: "polygon(15% 0%,85% 0%,100% 15%,100% 85%,85% 100%,15% 100%,0% 85%,0% 15%)",
          }}>✕</div>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>FACE</span>
          <span style={{ background: "#e53c2b", color: "#fff", fontSize: 22, fontWeight: 700, padding: "1px 8px" }}>Prep</span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => onNavigate("dashboard")}
            style={{
              background: activePage === "dashboard" ? "#f5c518" : "transparent",
              color: activePage === "dashboard" ? "#111" : "#fff",
              border: "none", borderRadius: 6, padding: "7px 16px",
              fontWeight: 700, cursor: "pointer", fontSize: 14,
            }}
          >
            ⊙ My Dashboard
          </button>
          <button
            onClick={() => onNavigate("assessments")}
            style={{
              background: activePage === "assessments" ? "#f5c518" : "transparent",
              color: activePage === "assessments" ? "#111" : "#fff",
              border: "none", borderRadius: 6, padding: "7px 16px",
              fontWeight: activePage === "assessments" ? 700 : 600,
              cursor: "pointer", fontSize: 14,
            }}
          >
            My Assessments
          </button>
          <button style={{
            background: "transparent", color: "#fff", border: "none",
            padding: "7px 14px", fontWeight: 600, cursor: "pointer", fontSize: 14, borderRadius: 6,
          }}>
            My Courses
          </button>
        </div>

        {/* Profile Badge + Dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          {/* Avatar circle */}
          <div
            onClick={() => setDropdownOpen(prev => !prev)}
            style={{
              width: 36, height: 36, background: "#f5c518", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, color: "#111", fontSize: 15,
              cursor: "pointer", userSelect: "none",
              boxShadow: dropdownOpen ? "0 0 0 3px rgba(245,197,24,0.45)" : "none",
              transition: "box-shadow 0.2s",
            }}
            title={username || "Profile"}
          >
            {initial}
          </div>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              background: "#fff", borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              minWidth: 210, zIndex: 999,
              overflow: "hidden",
              animation: "fadeSlideDown 0.15s ease",
            }}>
              <style>{`
                @keyframes fadeSlideDown {
                  from { opacity: 0; transform: translateY(-6px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
              `}</style>

              {/* User info header */}
              <div style={{
                padding: "16px 18px 12px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#1a5cff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {initial}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>
                    {username || "User"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Student</div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: "6px 0" }}>
                {[
                  { icon: "👤", label: "My Profile" },
                  { icon: "⚙️", label: "Settings" },
                ].map(item => (
                  <button
                    key={item.label}
                    style={{
                      width: "100%", background: "none", border: "none",
                      textAlign: "left", padding: "10px 18px",
                      fontSize: 14, color: "#333", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      transition: "background 0.15s",
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "#f5f7ff"}
                    onMouseOut={e => e.currentTarget.style.background = "none"}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}

                {/* Divider */}
                <div style={{ borderTop: "1px solid #f0f0f0", margin: "6px 0" }} />

                {/* Logout */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: "100%", background: "none", border: "none",
                    textAlign: "left", padding: "10px 18px",
                    fontSize: 14, color: "#e53c2b", fontWeight: 600,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "background 0.15s",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#fff5f5"}
                  onMouseOut={e => e.currentTarget.style.background = "none"}
                >
                  <span>🚪</span> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}