export type DailyTask = {
  id: string;
  title: string;
  action: string;
  target: number;
  icon: string;
  href: string;
};

const allTasks: DailyTask[] = [
  { id: "flashcards-2", title: "Review 2 flashcards", action: "reviewed", target: 2, icon: " cards", href: "/flashcards" },
  { id: "flashcards-5", title: "Review 5 flashcards", action: "reviewed", target: 5, icon: " cards", href: "/flashcards" },
  { id: "flashcards-10", title: "Review 10 flashcards", action: "reviewed", target: 10, icon: " cards", href: "/flashcards" },
  { id: "arena-1", title: "Complete 1 Arena game", action: "arenaGames", target: 1, icon: " arena", href: "/arena" },
  { id: "arena-2", title: "Complete 2 Arena games", action: "arenaGames", target: 2, icon: " arena", href: "/arena" },
  { id: "writing-3", title: "Practice 3 characters", action: "writing", target: 3, icon: " characters", href: "/writing" },
  { id: "writing-5", title: "Practice 5 characters", action: "writing", target: 5, icon: " characters", href: "/writing" },
  { id: "quiz-1", title: "Complete a Quiz", action: "quizCompleted", target: 1, icon: " quiz", href: "/quiz" },
  { id: "reading-1", title: "Read 1 passage", action: "readingPassages", target: 1, icon: " passage", href: "/reading" },
  { id: "grammar-1", title: "Study 1 grammar lesson", action: "grammarLessons", target: 1, icon: " lesson", href: "/grammar" },
  { id: "katakana-5", title: "Learn 5 Katakana characters", action: "katakanaLearned", target: 5, icon: " Katakana", href: "/writing" },
  { id: "hiragana-5", title: "Learn 5 Hiragana characters", action: "hiraganaLearned", target: 5, icon: " Hiragana", href: "/writing" },
  { id: "vocab-10", title: "Learn 10 new words", action: "vocabLearned", target: 10, icon: " words", href: "/flashcards" },
];

function dateSeed(date: Date): number {
  const str = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getDailyTasks(count: number = 4): DailyTask[] {
  const today = new Date();
  const seed = dateSeed(today);
  const rng = seededRandom(seed);

  const shuffled = [...allTasks];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export function getFormattedDate(): string {
  const today = new Date();
  return today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
