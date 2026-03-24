// src/seed.js  — run once: node src/seed.js
const bcrypt = require("bcryptjs");
const db     = require("./db");

// ── Wipe existing data (clean seed) ─────────────────────────────────────────
db.exec(`
  DELETE FROM submissions;
  DELETE FROM exam_sessions;
  DELETE FROM proctor_codes;
  DELETE FROM questions;
  DELETE FROM sections;
  DELETE FROM assessments;
  DELETE FROM users;
`);

// ── USERS ────────────────────────────────────────────────────────────────────
const hash = (pwd) => bcrypt.hashSync(pwd, 10);

const insertUser = db.prepare(
  `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`
);

insertUser.run("Admin User",   "admin@faceprep.com",   hash("admin123"),   "admin");
insertUser.run("Test Student", "2023pietcddhwani011@poornima.org", hash("#Learning@2025"), "student");
insertUser.run("Test Student", "anjnajariwal02@gmail.com", hash("Anjna@2004"), "student");

// ── ASSESSMENTS ──────────────────────────────────────────────────────────────
const insertAssessment = db.prepare(`
  INSERT INTO assessments (title, type, total_sections, total_questions, duration_mins, status, start_date)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const assessment1 = insertAssessment.run(
  "Benchmark Test | PIET | 25 Mar", "PRACTICE", 6, 57, 130, "Active", "Mar 21, 2026 10:00 AM"
);
const assessment2 = insertAssessment.run(
  "Benchmark Test | PIET | 16 Mar", "PRACTICE", 6, 57, 130, "Completed", "Mar 16, 2026 10:00 AM"
);
const assessment3 = insertAssessment.run(
  "Weekly Test | PU - 14 March 2026", "PRACTICE", 1, 10, 30, "Completed", "Mar 14, 2026 9:00 PM"
);

// ── PROCTOR CODES ────────────────────────────────────────────────────────────
const insertCode = db.prepare(
  `INSERT INTO proctor_codes (code, assessment_id) VALUES (?, ?)`
);
insertCode.run("123456", assessment1.lastInsertRowid);
insertCode.run("654321", assessment2.lastInsertRowid);
insertCode.run("111111", assessment3.lastInsertRowid);

// ── SECTIONS + QUESTIONS ─────────────────────────────────────────────────────
const insertSection = db.prepare(`
  INSERT INTO sections (assessment_id, title, total_questions, total_marks, duration_mins, type, position)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertQuestion = db.prepare(`
  INSERT INTO questions (section_id, text, type, options, correct_idx, position)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const sectionDefs = [
  {
    title: "Quantitative Aptitude",
    totalQuestions: 10, totalMarks: 10, durationMins: 11, type: "MCQ",
    questions: [
      { text: "A is two years older than B, who is twice as old as C. If the sum of the ages of A, B and C is 27, then how old is B?", options: ["10","8","9","7"], correct: 0 },
      { text: "If a : b = 4 : 5 & b : c = 2 : 3, find the ratio between a and c.", options: ["4:3","4:2","1:2","8:15"], correct: 3 },
      { text: "If c varies directly as the square root of d, and c = 14 when d = 64, find c when d = 256.", options: ["32","20","28","38"], correct: 2 },
      { text: "Solve the two equations, find value of x & y: 3x + 4y = 5; 15x + 20y = 25.", options: ["x=1, y=0.5","x=2, y=1","No unique solution","x=0, y=1.25"], correct: 2 },
      { text: "Ten years ago, Priya's mother's age was four times that of her daughter. 10 years hence, the mother's age will be twice that of Priya. Then the present age of Priya is:", options: ["20","30","25","35"], correct: 1 },
      { text: "Two numbers are 20% and 50% more than a third number respectively. The ratio of the first two numbers is:", options: ["4:5","5:4","2:3","3:2"], correct: 0 },
      { text: "If Y varies directly as X, and X = 9 when Y = 6, find Y when X = 33.", options: ["22","16.5","18","24"], correct: 0 },
      { text: "Find the value of x and y, if 4x + 9y = 18; 16x + 36y = 70.", options: ["3,2","2,1","No solution","Either 2 or 4"], correct: 2 },
      { text: "A sum of money is to be distributed among A, B and C in the ratio 2 : 4 : 3. If B gets Rs.1000 more than C, what is A's share?", options: ["Rs. 500","Rs. 600","Rs. 750","Rs. 1000"], correct: 3 },
      { text: "If 3x + 2y = 16, 5x + 7y = 45, find the value of x.", options: ["3","Either 2 or 4","4","2"], correct: 3 },
    ],
  },
  {
    title: "Logical Reasoning",
    totalQuestions: 8, totalMarks: 8, durationMins: 10, type: "MCQ",
    questions: [
      { text: "Find the odd one out: 2, 5, 10, 17, 26, 37, 50, 64.", options: ["50","64","26","37"], correct: 1 },
      { text: "If FRIEND is coded as HUMJTK, how is CANDLE written in that code?", options: ["EDRIRL","DCQHQK","EDRJQM","EDRJRL"], correct: 0 },
      { text: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", options: ["Grandfather","Granddaughter","Daughter","Sister"], correct: 1 },
      { text: "In a row of 40 boys, Rajan is 11th from the left. What is his position from the right?", options: ["29","30","31","32"], correct: 1 },
      { text: "Which number should come next in the series: 1, 2, 4, 8, 16, ?", options: ["24","32","36","40"], correct: 1 },
      { text: "All cats are dogs. Some dogs are rats. Conclusion: Some cats are rats. Is this valid?", options: ["True","False","Maybe","Cannot say"], correct: 3 },
      { text: "If + means ÷, ÷ means −, − means ×, × means +, then 8 + 4 ÷ 2 − 3 × 2 = ?", options: ["-4","4","0","2"], correct: 0 },
      { text: "Pointing to a photograph, a man says 'I have no siblings. This man's father is my father's son.' Who is in the photograph?", options: ["His son","His nephew","His father","Himself"], correct: 0 },
    ],
  },
  {
    title: "Verbal Ability",
    totalQuestions: 8, totalMarks: 8, durationMins: 9, type: "MCQ",
    questions: [
      { text: "Choose the word most similar in meaning to 'CANDID':", options: ["Honest","Rude","Timid","Bright"], correct: 0 },
      { text: "Pick the correctly spelt word:", options: ["Accomodate","Accommodate","Acommodate","Acomodate"], correct: 1 },
      { text: "Fill in the blank: She _____ to the market before it rained.", options: ["go","went","gone","goes"], correct: 1 },
      { text: "Identify the error: He (A) is one of (B) those men who (C) follows the rules (D) strictly.", options: ["A","B","C","D"], correct: 2 },
      { text: "Select the antonym of 'ELOQUENT':", options: ["Fluent","Articulate","Incoherent","Expressive"], correct: 2 },
      { text: "Which sentence uses the passive voice correctly?", options: ["He done the work.","The work was done by him.","He doing the work.","He does work."], correct: 1 },
      { text: "The idiom 'To burn the midnight oil' means:", options: ["To work late into the night","To waste resources","To start a fire","To be angry"], correct: 0 },
      { text: "Choose the sentence with correct subject-verb agreement:", options: ["Each of the boys are here.","Each of the boys is here.","Each of the boys were here.","None of these."], correct: 1 },
    ],
  },
  {
    title: "Technical MCQ's",
    totalQuestions: 15, totalMarks: 15, durationMins: 20, type: "MCQ",
    questions: [
      { text: "What is the time complexity of binary search?", options: ["O(n)","O(log n)","O(n log n)","O(1)"], correct: 1 },
      { text: "Which data structure uses LIFO (Last In First Out) principle?", options: ["Queue","Stack","Linked List","Tree"], correct: 1 },
      { text: "What does HTML stand for?", options: ["HyperText Markup Language","HyperText Machine Language","HighText Markup Language","None of these"], correct: 0 },
      { text: "Which of the following is NOT an OOP principle?", options: ["Encapsulation","Inheritance","Compilation","Polymorphism"], correct: 2 },
      { text: "In SQL, which command removes all rows from a table without logging individual deletions?", options: ["DELETE","DROP","TRUNCATE","REMOVE"], correct: 2 },
      { text: "What is the output of: print(type([])) in Python?", options: ["<class 'tuple'>","<class 'list'>","<class 'dict'>","<class 'set'>"], correct: 1 },
      { text: "Which HTTP method is idempotent but NOT safe?", options: ["GET","PUT","POST","PATCH"], correct: 1 },
      { text: "What is the maximum number of nodes in a binary tree of height h?", options: ["2h","2h+1 - 1","2h - 1","h2"], correct: 1 },
      { text: "In networking, what does DNS stand for?", options: ["Dynamic Network Service","Domain Name System","Data Network Standard","Digital Name Server"], correct: 1 },
      { text: "Which sorting algorithm has the best average-case time complexity?", options: ["Bubble Sort","Insertion Sort","Merge Sort","Selection Sort"], correct: 2 },
      { text: "What is a foreign key?", options: ["A key from another table","A primary key used externally","A key referencing a primary key in another table","None of these"], correct: 2 },
      { text: "Which layer of the OSI model is responsible for routing?", options: ["Data Link","Network","Transport","Session"], correct: 1 },
      { text: "What does REST stand for?", options: ["Remote Execution State Transfer","Representational State Transfer","Resource Endpoint Standard Transfer","None of these"], correct: 1 },
      { text: "Which of these is a NoSQL database?", options: ["MySQL","PostgreSQL","MongoDB","SQLite"], correct: 2 },
      { text: "What is a deadlock in OS?", options: ["A process waiting forever","Two processes waiting on each other","Memory overflow","CPU starvation"], correct: 1 },
    ],
  },
  {
    title: "Coding",
    totalQuestions: 2, totalMarks: 45, durationMins: 60, type: "Coding",
    questions: [
      { text: "Write a function to reverse a string without using built-in reverse methods.", options: [], correct: null },
      { text: "Implement a function that returns the nth Fibonacci number using dynamic programming.", options: [], correct: null },
    ],
  },
  {
    title: "Situational Based",
    totalQuestions: 15, totalMarks: 15, durationMins: 20, type: "MCQ",
    questions: [
      { text: "You discover a colleague has been taking credit for your work in team meetings. What is the most professional course of action?", options: ["Confront publicly","Speak to them privately first","Report to HR immediately","Ignore it"], correct: 1 },
      { text: "Your manager assigns you a task with an unrealistic deadline. How do you respond?", options: ["Accept without question","Discuss concerns and negotiate","Refuse the task","Delegate to a colleague"], correct: 1 },
      { text: "A client is unhappy with the deliverable even though it matches the original specification. What do you do?", options: ["Point out the spec was followed","Listen and find middle ground","Escalate to legal","Ignore the complaint"], correct: 1 },
      { text: "Two team members have a heated disagreement during a meeting. As a peer, what is your best action?", options: ["Take sides","Suggest a break and mediate","Stay silent","Leave the meeting"], correct: 1 },
      { text: "You notice a senior colleague making a significant error in a presentation to leadership. What do you do?", options: ["Say nothing","Politely correct them on the spot","Tell them privately beforehand","Send an email after"], correct: 1 },
      { text: "You are given two high-priority tasks by different managers at the same time. How do you handle this?", options: ["Do neither until they decide","Pick the one you prefer","Communicate the conflict and ask for prioritization","Work overtime to do both"], correct: 2 },
      { text: "A new team member is struggling with onboarding and seems demotivated. What is your approach?", options: ["Ignore, they will figure it out","Offer help and check in regularly","Report to the manager","Assign them easier tasks"], correct: 1 },
      { text: "During a product launch, a critical bug is found. Your team lead is unreachable. What do you do?", options: ["Delay the launch alone","Escalate to the next available lead","Fix it yourself without telling anyone","Ignore it"], correct: 1 },
      { text: "You overhear a colleague sharing confidential company information with an outsider. What do you do?", options: ["Ignore it","Confront them publicly","Report it through proper channels","Share your own information too"], correct: 2 },
      { text: "You are asked to work overtime regularly without additional compensation. How do you address this?", options: ["Just comply","Raise it professionally with your manager","Quit immediately","Work less during regular hours"], correct: 1 },
      { text: "A client asks you to bypass a company policy to expedite their request. What do you do?", options: ["Comply to keep client happy","Explain the policy and offer alternatives","Escalate to your manager","Ignore the client"], correct: 1 },
      { text: "You receive negative feedback on your work. What is the best response?", options: ["Argue against it","Ignore it","Thank them and reflect on it","Complain to colleagues"], correct: 2 },
      { text: "A project is falling behind schedule due to unclear requirements. What do you do?", options: ["Continue and hope it works","Schedule a meeting to clarify","Blame the stakeholders","Submit incomplete work"], correct: 1 },
      { text: "You disagree with a decision made by leadership. How do you handle it?", options: ["Publicly criticize","Comply silently and do nothing","Express concerns through proper channels","Sabotage the initiative"], correct: 2 },
      { text: "You are asked to give feedback on a colleague's performance. What is the best approach?", options: ["Be vague to avoid conflict","Provide specific, balanced, constructive feedback","Only mention positives","Only highlight negatives"], correct: 1 },
    ],
  },
];

// Insert sections and questions for assessment 1
for (let i = 0; i < sectionDefs.length; i++) {
  const s = sectionDefs[i];
  const sectionRow = insertSection.run(
    assessment1.lastInsertRowid, s.title, s.totalQuestions, s.totalMarks, s.durationMins, s.type, i
  );
  for (let j = 0; j < s.questions.length; j++) {
    const q = s.questions[j];
    insertQuestion.run(
      sectionRow.lastInsertRowid,
      q.text,
      s.type,
      JSON.stringify(q.options),
      q.correct,
      j
    );
  }
}

// Insert same sections for assessment 2 (completed) and assessment 3 (first section only)
const completedSections = [sectionDefs[0]]; // just Quantitative for weekly test
for (let i = 0; i < sectionDefs.length; i++) {
  const s = sectionDefs[i];
  const sectionRow = insertSection.run(
    assessment2.lastInsertRowid, s.title, s.totalQuestions, s.totalMarks, s.durationMins, s.type, i
  );
  for (let j = 0; j < s.questions.length; j++) {
    const q = s.questions[j];
    insertQuestion.run(sectionRow.lastInsertRowid, q.text, s.type, JSON.stringify(q.options), q.correct, j);
  }
}

const qaSection = sectionDefs[0];
const weeklySectionRow = insertSection.run(
  assessment3.lastInsertRowid, qaSection.title, qaSection.totalQuestions, qaSection.totalMarks,
  qaSection.durationMins, qaSection.type, 0
);
for (let j = 0; j < qaSection.questions.length; j++) {
  const q = qaSection.questions[j];
  insertQuestion.run(weeklySectionRow.lastInsertRowid, q.text, qaSection.type, JSON.stringify(q.options), q.correct, j);
}

console.log("✅  Database seeded successfully!");
console.log("   Users:       admin@faceprep.com / admin123");
console.log("               student@faceprep.com / student123");
console.log("   Assessments: 3 created");
console.log("   Sections:    6 sections with full question sets");
console.log("   Proctor code for active assessment: 123456");