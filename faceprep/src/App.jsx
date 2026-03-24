// src/App.jsx
import React, { useState, useEffect } from "react";
import "./styles/global.css";
import { auth } from "./api/api";

import LoginPage                  from "./pages/LoginPage";
import DashboardPage              from "./pages/DashboardPage";
import AssessmentsPage            from "./pages/AssessmentsPage";
import TestSectionsPage           from "./pages/TestSectionsPage";
import ProctorVerifyPage          from "./pages/ProctorVerifyPage";
import TestInstructionsPage       from "./pages/TestInstructionsPage";
import NavigationInstructionsPage from "./pages/NavigationInstructionsPage";
import SettleInPage               from "./pages/SettleInPage";
import QuestionListPage           from "./pages/QuestionListPage";
import MCQPage                    from "./pages/MCQPage";
import CodingPage                 from "./pages/CodingPage";

function fmtDateTime(d) {
  if (!d) return "";
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function fmtDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return "";
  const diffMs  = endedAt - startedAt;
  const totalSecs = Math.floor(diffMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export default function App() {
  const [page,               setPage]               = useState("loading");
  const [user,               setUser]               = useState(null);
  const [selectedAssessment, setSelectedAssessment]  = useState(null);
  const [selectedSection,    setSelectedSection]     = useState(null);
  const [startQuestionIdx,   setStartQuestionIdx]    = useState(0);
  const [testStartedAt,      setTestStartedAt]       = useState(null);
  // Array of completed assessment objects with full data
  const [completedTests,     setCompletedTests]      = useState([]);

  useEffect(() => {
    auth.me()
      .then(result => {
        if (result?.user) { setUser(result.user); setPage("dashboard"); }
        else setPage("login");
      })
      .catch(() => setPage("login"));
  }, []);

  function handleLogin(userData) { setUser(userData); setPage("dashboard"); }
  function handleLogout() {
    auth.logout().finally(() => { setUser(null); setPage("login"); });
  }
  function navigate(target) { setPage(target); }

  function handleStartTest(assessment) {
    setSelectedAssessment(assessment);
    setPage("proctor-verify");
  }

  // Called when proctor verified → record start time
  function handleProctorSuccess() {
    setTestStartedAt(new Date());
    navigate("instructions");
  }

  function handleStartSection(section) {
    const enrichedSection = { ...section, assessment_id: selectedAssessment?.id };
    setSelectedSection(enrichedSection);
    if (section.type === "Coding" || section.type === "CODE") setPage("coding");
    else setPage("question-list");
  }

  function handleOpenQuestion(section, questionIdx) {
    setSelectedSection(section);
    setStartQuestionIdx(questionIdx);
    if (section.type === "Coding" || section.type === "CODE") setPage("coding");
    else setPage("mcq");
  }

  function handleEndTest() {
    const endedAt = new Date();
    if (selectedAssessment) {
      const completedEntry = {
        ...selectedAssessment,
        id:           selectedAssessment.id,
        title:        selectedAssessment.title,
        type:         selectedAssessment.type || "PRACTICE",
        totalSections: selectedAssessment.total_sections || selectedAssessment.totalSections,
        totalQuestions: selectedAssessment.total_questions || selectedAssessment.totalQuestions,
        duration:     fmtDuration(testStartedAt, endedAt),
        status:       "Completed",
        startedAt:    fmtDateTime(testStartedAt),
        completedAt:  fmtDateTime(endedAt),
        _localCompleted: true,
      };
      setCompletedTests(prev => {
        // Replace if already exists, else prepend
        const exists = prev.find(t => t.id === completedEntry.id);
        if (exists) return prev.map(t => t.id === completedEntry.id ? completedEntry : t);
        return [completedEntry, ...prev];
      });
    }
    setPage("assessments");
  }

  if (page === "loading") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"'Space Grotesk',sans-serif", color:"#888" }}>Loading…</div>
  );

  if (page === "login")       return <LoginPage onLogin={handleLogin} />;
  if (page === "dashboard")   return <DashboardPage username={user?.name || "User"} onNavigate={navigate} onLogout={handleLogout} />;
  if (page === "assessments") return (
    <AssessmentsPage
      onNavigate={navigate}
      username={user?.name || "User"}
      onLogout={handleLogout}
      onStartTest={handleStartTest}
      localCompletedTests={completedTests}
    />
  );

  if (page === "proctor-verify") return (
    <ProctorVerifyPage
      assessment={selectedAssessment}
      onSuccess={handleProctorSuccess}
      onCancel={() => navigate("assessments")}
    />
  );

  if (page === "instructions") return (
    <TestInstructionsPage assessment={selectedAssessment} onStart={() => navigate("nav-instructions")} />
  );

  if (page === "nav-instructions") return (
    <NavigationInstructionsPage
      duration={selectedAssessment?.duration || "30 minutes"}
      onContinue={() => navigate("settle-in")}
    />
  );

  if (page === "settle-in") return (
    <SettleInPage seconds={3} onComplete={() => navigate("test-sections")} />
  );

  if (page === "test-sections") return (
    <TestSectionsPage
      assessment={selectedAssessment}
      onNavigate={navigate}
      onEndTest={handleEndTest}
      onStartSection={handleStartSection}
    />
  );

  if (page === "question-list") return (
    <QuestionListPage
      section={selectedSection}
      userId={user?.id}
      onOpenQuestion={(idx) => handleOpenQuestion(selectedSection, idx)}
      onSubmitSection={() => navigate("test-sections")}
      onEndTest={handleEndTest}
    />
  );

  if (page === "mcq") return (
    <MCQPage
      section={selectedSection}
      startIndex={startQuestionIdx}
      userId={user?.id}
      onBackToList={() => navigate("question-list")}
      onSubmitSection={() => navigate("test-sections")}
    />
  );

  if (page === "coding") return (
    <CodingPage
      section={selectedSection}
      startIndex={startQuestionIdx}
      userId={user?.id}
      onBackToList={() => navigate("question-list")}
      onSubmitSection={() => navigate("test-sections")}
    />
  );

  return null;
}