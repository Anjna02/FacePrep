import React from "react";
import Navbar from "../components/Navbar";

export default function DashboardPage({ onLogout, username, onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#e8eaed" }}>
      <Navbar activePage="dashboard" onNavigate={onNavigate} username={username} onLogout={onLogout} />

      <div style={{
        background: "#fffbe6", borderBottom: "1px solid #e8e4d0",
        padding: "20px 48px 18px",
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: "#111" }}>
          Hi There, <span style={{ color: "#1a5cff" }}>{username}</span> !
        </h2>
        <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>Ready to achieve more today? 😎</p>
      </div>

      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} style={{
              width: 10, height: 10, background: "#1a5cff", borderRadius: "50%",
              animation: `bounce 1.2s ${delay}s infinite ease-in-out`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}