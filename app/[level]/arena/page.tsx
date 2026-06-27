"use client";

import { useEffect, useState, useMemo } from "react";
import { AlertCircle, ChevronRight, Home, Search, Star, Target, Volume2 } from "lucide-react";
import { AppFrame } from "../../components/app-frame";
import { useLearning } from "../../components/learning-state";
import Link from "next/link";

export default function ArenaPage() {
  return (
    <AppFrame>
      <Arena />
    </AppFrame>
  );
}

function Arena() {
  const { level, setProgress } = useLearning();
  const [gameState, setGameState] = useState<"landing" | "playing" | "results">("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAttemptsForCurrent, setWrongAttemptsForCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastSelectedWrongId, setLastSelectedWrongId] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [starredItems, setStarredItems] = useState<string[]>([]);

  // Load High Score & Starred Items
  useEffect(() => {
    const saved = localStorage.getItem(`arena-high-score-${level}`);
    if (saved) setHighScore(parseInt(saved, 10));

    const savedStars = localStorage.getItem("arena-starred-kana");
    if (savedStars) setStarredItems(JSON.parse(savedStars));
  }, [level]);

  function toggleStar(kana: string) {
    if (!kana) return;
    setStarredItems(prev => {
      const next = prev.includes(kana) ? prev.filter(x => x !== kana) : [...prev, kana];
      localStorage.setItem("arena-starred-kana", JSON.stringify(next));
      return next;
    });
  }

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setGameState("results");
      if (correctCount > highScore) {
        setHighScore(correctCount);
        localStorage.setItem(`arena-high-score-${level}`, String(correctCount));
      }
      setProgress((current) => ({
        ...current,
        dailyActions: {
          ...current.dailyActions,
          arenaGames: current.dailyActions.arenaGames + 1
        }
      }));
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, correctCount, highScore, level]);

  // Generate sequence of questions based on level
  const questions = useMemo(() => {
    const hiragana = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "ん"];
    const romaji = ["a", "i", "u", "e", "o", "ka", "ki", "ku", "ke", "ko", "sa", "shi", "su", "se", "so", "ta", "chi", "tsu", "te", "to", "na", "ni", "nu", "ne", "no", "ha", "hi", "fu", "he", "ho", "ma", "mi", "mu", "me", "mo", "ya", "yu", "yo", "ra", "ri", "ru", "re", "ro", "wa", "wo", "n"];
    
    // Shuffled pool
    const pool = hiragana.map((h, i) => ({ kana: h, romaji: romaji[i] })).sort(() => Math.random() - 0.5);
    return pool; // Use all for continuous play
  }, [level]);

  const currentQuestion = questions[currentIndex % questions.length];
  const isStarred = currentQuestion ? starredItems.includes(currentQuestion.kana) : false;
  
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    const others = questions.filter(q => q.kana !== currentQuestion.kana).sort(() => Math.random() - 0.5).slice(0, 8);
    return [...others, currentQuestion].sort(() => Math.random() - 0.5);
  }, [currentQuestion, questions]);

  function startGame() {
    setGameState("playing");
    setCorrectCount(0);
    setWrongCount(0);
    setWrongAttemptsForCurrent(0);
    setTimeLeft(60);
    setCurrentIndex(0);
    setLastSelectedWrongId(null);
  }

  function handleSelect(kana: string) {
    if (selectedId || gameState !== "playing" || lastSelectedWrongId === kana) return;
    
    if (kana === currentQuestion.kana) {
      setSelectedId(kana);
      setCorrectCount(prev => prev + 1);
      setWrongAttemptsForCurrent(0);
      setLastSelectedWrongId(null);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSelectedId(null);
      }, 200); 
    } else {
      setIsError(true);
      setWrongCount(prev => prev + 1);
      setLastSelectedWrongId(kana);
      const newWrongAttempts = wrongAttemptsForCurrent + 1;
      setWrongAttemptsForCurrent(newWrongAttempts);

      if (newWrongAttempts >= 2) {
        // Skip after 2 errors
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setWrongAttemptsForCurrent(0);
          setLastSelectedWrongId(null);
          setIsError(false);
        }, 600);
      } else {
        setTimeout(() => {
          setIsError(false);
          setLastSelectedWrongId(null);
        }, 500);
      }
    }
  }

  if (gameState === "landing") {
    return (
      <div className="arena-landing">
        <div className="arena-landing-content">
          <div className="arena-icon-splash"><Target size={48} /></div>
          <h1>Kana Arena</h1>
          <p>Match as many {level} characters as you can in 60 seconds.</p>
          <div className="high-score-badge">Personal Best: {highScore}</div>
          <button className="start-game-btn" onClick={startGame}>Start Challenge</button>
        </div>
      </div>
    );
  }

  if (gameState === "results") {
    const accuracy = Math.round((correctCount / (correctCount + wrongCount || 1)) * 100);
    return (
      <div className="arena-results">
        <div className="results-card">
          <Search size={32} />
          <h2>Session Report</h2>
          <div className="results-grid">
            <div className="result-metric">
              <span>Correct</span>
              <strong>{correctCount}</strong>
            </div>
            <div className="result-metric">
              <span>Wrong</span>
              <strong>{wrongCount}</strong>
            </div>
            <div className="result-metric">
              <span>Accuracy</span>
              <strong>{accuracy}%</strong>
            </div>
            <div className="result-metric highlighted">
              <span>Personal Best</span>
              <strong>{highScore}</strong>
            </div>
          </div>
          <div className="results-actions">
            <button className="primary-action" onClick={startGame}>Try Again</button>
            <Link href="/" className="secondary-action">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  function playAudio(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="arena-container">
      <div className="arena-header">
        <div className="arena-timer">
          <span className="timer-label">TIME</span>
          <span className={`timer-value ${timeLeft < 10 ? "urgent" : ""}`}>{timeLeft}s</span>
        </div>
        <div className="arena-stats-mini">
          <div className="stat-item wrong">
            <span className="stat-label">WRONG</span>
            <span className="stat-value">{wrongCount}</span>
          </div>
          <div className="stat-item correct">
            <span className="stat-label">CORRECT</span>
            <span className="stat-value">{correctCount}</span>
          </div>
        </div>
      </div>

      <div className="arena-game-card">
        <div className="card-header">
          <button className="icon-button" onClick={() => playAudio(currentQuestion?.kana)} aria-label="Play audio">
            <Volume2 size={20} />
          </button>
          <div className="card-indicator"><AlertCircle size={16} /></div>
          <button 
            className="icon-button" 
            onClick={() => toggleStar(currentQuestion?.kana)} 
            aria-label={isStarred ? "Unstar character" : "Star character"}
            style={{ color: isStarred ? "var(--blue)" : "inherit" }}
          >
            <Star size={20} fill={isStarred ? "var(--blue)" : "none"} />
          </button>
        </div>
        
        <div className="card-prompt">
          <h1>{currentQuestion?.romaji}</h1>
        </div>

        <div className={`arena-grid ${isError ? "shake" : ""}`}>
          {options.map((opt, i) => (
            <button 
              key={`${opt.kana}-${i}`}
              className={`arena-option ${selectedId === opt.kana ? "correct" : ""} ${lastSelectedWrongId === opt.kana ? "wrong" : ""}`}
              onClick={() => handleSelect(opt.kana)}
            >
              {opt.kana}
            </button>
          ))}
        </div>
      </div>

      <div className="arena-footer">
        <Link href="/${level}/" className="footer-btn">  //Returns to dashboard.
          <Home size={20} />
          <span>HOME</span>
        </Link>
        <button className="footer-btn main">
          <Search size={20} />
          <span>ANALYZE</span>
        </button>
        <button className="footer-btn" onClick={() => setCurrentIndex(prev => prev + 1)}>
          <ChevronRight size={20} />
          <span>NEXT</span>
        </button>
      </div>
    </div>
  );
}
