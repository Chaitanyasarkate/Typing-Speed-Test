
let passages = {}; 
let achievements = []; 
let currentLevel = JSON.parse(localStorage.getItem('progress'))?.level || 1;
let selectedLanguage = "en";
let startTime = null;
let currentWPM = 0;
let currentAccuracy = 0;

const levels = [
  { wpm: 10, accuracy: 80, words: 50 },
  { wpm: 15, accuracy: 85, words: 100 },
  { wpm: 20, accuracy: 90, words: 150 },
 
];

const sentenceElement = document.getElementById("sentence");
const inputBox = document.getElementById("inputBox");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const resultElement = document.getElementById("result");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const restartBtn = document.getElementById("restartBtn");
const criteriaElement = document.getElementById("criteria");
const currentLevelElement = document.getElementById("currentLevel");
const achievementsElement = document.getElementById('achievements');


const loadSentences = async () => {
  try {
    const response = await fetch('./data/sentences.json');
    passages = await response.json();
    loadPassage();
  } catch (error) {
    console.error("Error loading sentences.json:", error);
  }
};

const loadPassage = () => {
  const passage = passages[selectedLanguage]?.[currentLevel - 1] || "Keep practicing to improve your typing!";
  sentenceElement.textContent = passage;
  inputBox.value = '';
  resultElement.style.display = "none";
  nextLevelBtn.style.display = "none";
  startTime = null; 
  updateStats(0, 0);
  updateCriteria();
};


const updateCriteria = () => {
  const levelData = levels[currentLevel - 1];
  if (levelData) {
    criteriaElement.innerHTML = `Criteria: WPM >= ${levelData.wpm}, Accuracy >= ${levelData.accuracy}%`;
  }
  currentLevelElement.textContent = currentLevel;
};

const updateStats = (wpm, accuracy) => {
  currentWPM = wpm;
  currentAccuracy = accuracy;
  wpmElement.textContent = currentWPM;
  accuracyElement.textContent = `${currentAccuracy}%`;
};


const checkInput = () => {
  const sentenceText = sentenceElement.textContent;
  const userInput = inputBox.value;

  if (!startTime) startTime = new Date();

  const correctChars = sentenceText.substring(0, userInput.length);
  const incorrectChars = sentenceText.substring(userInput.length);

  if (userInput === sentenceText) {
    calculateResults();
    resultElement.style.display = "block";
    resultElement.textContent = checkCriteria() 
      ? "Level Complete! Well done!" 
      : "Level Complete! Try to improve.";
    nextLevelBtn.style.display = checkCriteria() ? "inline-block" : "none";
  }

  sentenceElement.innerHTML = `
    <span class="correct">${correctChars}</span><span class="incorrect">${incorrectChars}</span>
  `;
  
};
const calculateResults = () => {
  const sentenceText = sentenceElement.textContent;
  const userInput = inputBox.value;
  const endTime = new Date();

  const timeTaken = (endTime - startTime) / 1000 / 60; // Time in minutes
  const wordCount = sentenceText.split(' ').length;
  const wpm = Math.round(wordCount / timeTaken);

  const correctChars = sentenceText.split('').filter((char, index) => char === userInput[index]).length;
  const accuracy = Math.round((correctChars / sentenceText.length) * 100);

  updateStats(wpm, accuracy);

  const credits = calculateCredits(wpm, accuracy);
  achievements.push(`Level ${currentLevel}: ${credits} credits earned`);
  achievementsElement.innerHTML = achievements.map((achievement) => `<li>${achievement}</li>`).join('');
};

const calculateCredits = (wpm, accuracy) => {
  const baseCredits = 10;
  const speedBonus = Math.max(0, wpm - (currentLevel + 10));
  const accuracyBonus = Math.floor(accuracy / 10);
  return baseCredits + speedBonus + accuracyBonus;
};


const checkCriteria = () => {
  const levelData = levels[currentLevel - 1];
  return currentWPM >= levelData.wpm && currentAccuracy >= levelData.accuracy;
};


const saveResults = () => {
  const progress = {
    level: currentLevel,
    wpm: currentWPM,
    accuracy: currentAccuracy,
  };
  localStorage.setItem('progress', JSON.stringify(progress));
  alert("Results saved!");
};

const nextLevel = () => {
  if (currentLevel < levels.length) {
    currentLevel++;
    saveResults();
    loadPassage();
  } else {
    alert("Congratulations! You've completed all levels!");
  }
};


const restartProgress = () => {
  localStorage.setItem('progress', JSON.stringify({ level: 1 }));
  achievements = [];
  currentLevel = 1;
  loadPassage();
};


const generateRandomSentence = (wordCount) => {
  const words = ["example", "random", "typing", "test", "sentence", "practice", "speed", "accuracy"];
  return Array.from({ length: wordCount }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
};


inputBox.addEventListener("input", checkInput);
restartBtn.addEventListener("click", restartProgress);
nextLevelBtn.addEventListener("click", nextLevel);
document.getElementById('submitBtn').addEventListener('click', saveResults);
document.getElementById('languageSelector').addEventListener('change', (e) => {
  selectedLanguage = e.target.value;
  loadPassage();
});


loadSentences();