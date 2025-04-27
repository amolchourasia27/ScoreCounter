// script.js
// Get elements
const setupSection = document.getElementById("setup-section");
const quizSection = document.getElementById("quiz-section");
const resultSection = document.getElementById("result-section");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const enableNegativeCheckbox = document.getElementById("enable-negative");
const penaltyGroup = document.getElementById("penalty-group");
const negativePenaltyInput = document.getElementById("negative-penalty");

const totalQuestionsInput = document.getElementById("total-questions");
const marksInput = document.getElementById("marks-per-question");
const partialInput = document.getElementById("partial-marks");

const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const questionLabel = document.getElementById("question-label");

const correctBtn = document.querySelector(".correct-btn");
const incorrectBtn = document.querySelector(".incorrect-btn");
const partialBtn = document.querySelector(".partial-btn");

const totalScoreElem = document.getElementById("total-score");
const totalCorrectElem = document.getElementById("total-correct");
const totalIncorrectElem = document.getElementById("total-incorrect");
const totalPartialElem = document.getElementById("total-partial");
const percentageElem = document.getElementById("percentage");
const summaryBody = document.getElementById("summary-body");

const themeToggle = document.getElementById("theme-toggle");
const confettiCanvas = document.getElementById("confetti-canvas");

let totalQuestions = 0;
let marksPerQuestion = 0;
let partialMarks = 0;
let negativeEnabled = false;
let negativePenalty = 0;

let currentQuestion = 0;
let responses = [];
let totalScore = 0;
let totalCorrect = 0;
let totalIncorrect = 0;
let totalPartial = 0;

// Toggle penalty input visibility
enableNegativeCheckbox.addEventListener("change", () => {
  if (enableNegativeCheckbox.checked) {
    penaltyGroup.classList.remove("hidden");
  } else {
    penaltyGroup.classList.add("hidden");
  }
});

// Toggle dark/light theme
themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark-mode");
  themeToggle.textContent = document.documentElement.classList.contains(
    "dark-mode"
  )
    ? "☀️"
    : "🌙";
});

// Start quiz
startButton.addEventListener("click", () => {
  totalQuestions = parseInt(totalQuestionsInput.value);
  marksPerQuestion = parseFloat(marksInput.value);
  partialMarks = parseFloat(partialInput.value);
  negativeEnabled = enableNegativeCheckbox.checked;
  negativePenalty = negativeEnabled
    ? parseFloat(negativePenaltyInput.value)
    : 0;

  // Input validation
  if (isNaN(totalQuestions) || totalQuestions < 1) {
    alert("Enter a valid number of questions.");
    return;
  }
  if (isNaN(marksPerQuestion) || marksPerQuestion <= 0) {
    alert("Enter valid marks per question.");
    return;
  }
  if (
    isNaN(partialMarks) ||
    partialMarks < 0 ||
    partialMarks > marksPerQuestion
  ) {
    alert("Enter valid partial marks (0 to marks per question).");
    return;
  }
  if (
    negativeEnabled &&
    (isNaN(negativePenalty) ||
      negativePenalty < 0 ||
      negativePenalty > marksPerQuestion)
  ) {
    alert("Enter a valid negative penalty (0 to marks per question).");
    return;
  }

  // Initialize counters
  currentQuestion = 0;
  responses = [];
  totalScore = 0;
  totalCorrect = 0;
  totalIncorrect = 0;
  totalPartial = 0;

  // Transition to quiz section
  fadeOut(setupSection, () => {
    setupSection.classList.add("hidden");
    showQuestion();
    showSection(quizSection);
  });
});

// Answer button listeners
correctBtn.addEventListener("click", () => handleAnswer("Correct"));
incorrectBtn.addEventListener("click", () => handleAnswer("Incorrect"));
partialBtn.addEventListener("click", () => handleAnswer("Partial"));

// Restart quiz
restartButton.addEventListener("click", () => {
  location.reload();
});

// Display question and update UI
function showQuestion() {
  questionLabel.textContent = `Question ${currentQuestion + 1}`;
  progressText.textContent = `Question ${
    currentQuestion + 1
  } of ${totalQuestions}`;
  // Update progress bar (percentage of questions completed)
  const progressPercent = (currentQuestion / totalQuestions) * 100;
  progressFill.style.width = progressPercent + "%";
}

// Handle answer click
function handleAnswer(type) {
  responses.push(type);
  if (type === "Correct") {
    totalScore += marksPerQuestion;
    totalCorrect++;
  } else if (type === "Partial") {
    totalScore += partialMarks;
    totalPartial++;
  } else if (type === "Incorrect") {
    totalIncorrect++;
    if (negativeEnabled) {
      totalScore -= negativePenalty;
      if (totalScore < 0) totalScore = 0;
    }
  }

  // Move to next question or show results
  if (currentQuestion < totalQuestions - 1) {
    currentQuestion++;
    fadeOut(quizSection, () => {
      quizSection.classList.add("hidden");
      showQuestion();
      showSection(quizSection);
    });
  } else {
    fadeOut(quizSection, () => {
      quizSection.classList.add("hidden");
      showResults();
    });
  }
}

// Show results
function showResults() {
  const maxScore = totalQuestions * marksPerQuestion;
  const percentage = Math.round((totalScore / maxScore) * 100);
  // Populate counters with animation
  animateValue(totalScoreElem, 0, totalScore, 1000);
  animateValue(totalCorrectElem, 0, totalCorrect, 1000);
  animateValue(totalIncorrectElem, 0, totalIncorrect, 1000);
  animateValue(totalPartialElem, 0, totalPartial, 1000);
  animateValue(percentageElem, 0, percentage, 1000);

  // Populate summary table
  summaryBody.innerHTML = "";
  responses.forEach((resp, index) => {
    const row = document.createElement("tr");
    const cellQ = document.createElement("td");
    cellQ.textContent = index + 1;
    const cellA = document.createElement("td");
    cellA.textContent = resp;
    row.appendChild(cellQ);
    row.appendChild(cellA);
    summaryBody.appendChild(row);
  });

  // Show result section
  showSection(resultSection);

  // Confetti for perfect score
  if (percentage === 100) {
    startConfetti();
  }
}

// Utility for fade animations
function fadeOut(element, callback) {
  element.classList.add("fade-out");
  element.addEventListener("animationend", function handler() {
    element.classList.remove("fade-out");
    element.removeEventListener("animationend", handler);
    if (callback) callback();
  });
}

function showSection(section) {
  section.classList.remove("hidden");
  section.classList.add("fade-in");
  section.addEventListener("animationend", function handler() {
    section.classList.remove("fade-in");
    section.removeEventListener("animationend", handler);
  });
}

// Animate counter value
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Confetti effect
let confettiParticles = [];

function startConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiParticles = [];
  const colors = ["#fcd26a", "#60a5fa", "#34d399", "#f87171", "#fbbf24"];
  const numParticles = 150;
  for (let i = 0; i < numParticles; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2,
    });
  }
  confettiCanvas.style.display = "block";
  drawConfetti();
  setTimeout(() => {
    confettiParticles = [];
    const ctx = confettiCanvas.getContext("2d");
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }, 5000);
}

function drawConfetti() {
  const ctx = confettiCanvas.getContext("2d");
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    // Update position
    p.y += p.speed;
    p.x += Math.sin(p.y * 0.01);
    if (p.y > confettiCanvas.height) {
      p.y = 0;
      p.x = Math.random() * confettiCanvas.width;
    }
  });
  if (confettiParticles.length > 0) {
    requestAnimationFrame(drawConfetti);
  } else {
    confettiCanvas.style.display = "none";
  }
}
