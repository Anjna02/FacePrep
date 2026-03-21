import React, { useState, useEffect } from "react";
import "./styles/global.css";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import TestSectionsPage from "./pages/TestSectionsPage";
import ProctorVerifyPage from "./pages/ProctorVerifyPage";
import TestInstructionsPage from "./pages/TestInstructionsPage";
import NavigationInstructionsPage from "./pages/NavigationInstructionsPage";
import SettleInPage from "./pages/SettleInPage";
import QuestionListPage from "./pages/QuestionListPage";
import MCQPage from "./pages/MCQPage";

export default function App() {
  const [page,               setPage]               = useState("login");
  const [username,           setUsername]            = useState("");
  const [selectedAssessment, setSelectedAssessment]  = useState(null);
  const [selectedSection,    setSelectedSection]     = useState(null);
  const [startQuestionIdx,   setStartQuestionIdx]    = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("fp_user");
    if (saved) { setUsername(saved); setPage("dashboard"); }
  }, []);

  function handleLogin(name) {
    localStorage.setItem("fp_user", name);
    setUsername(name);
    setPage("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("fp_user");
    setUsername("");
    setPage("login");
  }

  function navigate(target) { setPage(target); }

  function handleStartTest(assessment) {
    setSelectedAssessment(assessment);
    setPage("proctor-verify");
  }

  function handleStartSection(section) {
    setSelectedSection(section);
    setPage("question-list");
  }

  // Called from QuestionListPage row click — go to MCQ at specific question
  function handleOpenQuestion(section, questionIdx) {
    setSelectedSection(section);
    setStartQuestionIdx(questionIdx);
    setPage("mcq");
  }

  if (page === "login")
    return <LoginPage onLogin={handleLogin} />;

  if (page === "dashboard")
    return <DashboardPage username={username} onNavigate={navigate} onLogout={handleLogout} />;

  if (page === "assessments")
    return (
      <AssessmentsPage
        onNavigate={navigate}
        username={username}
        onLogout={handleLogout}
        onStartTest={handleStartTest}
      />
    );

  if (page === "proctor-verify")
    return (
      <ProctorVerifyPage
        onSuccess={() => navigate("instructions")}
        onCancel={() => navigate("assessments")}
      />
    );

  if (page === "instructions")
    return (
      <TestInstructionsPage
        assessment={selectedAssessment}
        onStart={() => navigate("nav-instructions")}
      />
    );

  if (page === "nav-instructions")
    return (
      <NavigationInstructionsPage
        duration={selectedAssessment?.duration || "30 minutes"}
        onContinue={() => navigate("settle-in")}
      />
    );

  if (page === "settle-in")
    return (
      <SettleInPage
        seconds={10}
        onComplete={() => navigate("test-sections")}
      />
    );

  if (page === "test-sections")
    return (
      <TestSectionsPage
        onNavigate={navigate}
        username={username}
        onLogout={handleLogout}
        onEndTest={() => navigate("assessments")}
        onStartSection={handleStartSection}
      />
    );

  if (page === "question-list")
    return (
      <QuestionListPage
        section={selectedSection}
        onOpenQuestion={(idx) => handleOpenQuestion(selectedSection, idx)}
        onSubmitSection={() => navigate("test-sections")}
        onEndTest={() => navigate("assessments")}
      />
    );

  if (page === "mcq")
    return (
      <MCQPage
        section={selectedSection}
        startIndex={startQuestionIdx}
        onBackToList={() => navigate("question-list")}
        onSubmitSection={() => navigate("test-sections")}
      />
    );

  return null;
}