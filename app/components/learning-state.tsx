"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useParams } from "next/navigation";
import { Level, course } from "../data";
import { getTodayKey, getDailyTasks, type DailyTask } from "../lib/daily-tasks";

export type DailyActionTracker = {
  reviewed: number;
  arenaGames: number;
  writing: number;
  quizCompleted: number;
  readingPassages: number;
  grammarLessons: number;
  katakanaLearned: number;
  hiraganaLearned: number;
  vocabLearned: number;
};

export type Progress = {
  reviewed: number;
  writing: number;
  quizBest: number;
  streak: number;
  completedTasks: string[];
  dailyDate: string;
  dailyActions: DailyActionTracker;
  dailyQuestCompleteShown: boolean;
  dailyBadgeClaimed: boolean;
  completedDays: string[];
};

const defaultDailyActions: DailyActionTracker = {
  reviewed: 0,
  arenaGames: 0,
  writing: 0,
  quizCompleted: 0,
  readingPassages: 0,
  grammarLessons: 0,
  katakanaLearned: 0,
  hiraganaLearned: 0,
  vocabLearned: 0,
};

export const defaultProgress: Progress = {
  reviewed: 0,
  writing: 0,
  quizBest: 0,
  streak: 1,
  completedTasks: [],
  dailyDate: "",
  dailyActions: { ...defaultDailyActions },
  dailyQuestCompleteShown: false,
  dailyBadgeClaimed: false,
  completedDays: []
};

type LearningState = {
  level: Level;
  setLevel: (level: Level) => void;
  data: (typeof course)[Level];
  progress: Progress;
  setProgress: Dispatch<SetStateAction<Progress>>;
  progressPercent: number;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  dailyTasks: DailyTask[];
  getTaskProgress: (task: DailyTask) => number;
  isAllDailyTasksComplete: () => boolean;
  showQuestComplete: boolean;
  setShowQuestComplete: (show: boolean) => void;
};

const LearningContext = createContext<LearningState | null>(null);
const progressKey = "musashi-kana-progress";
const themeKey = "musashi-kana-theme";
const legacyProgressKey = "minato-progress";

export function LearningProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const levelParam = typeof params?.level === 'string' ? params.level.toLowerCase() : '';
  const level: Level = levelParam === 'n4' ? 'N4' : 'N5';

  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showQuestComplete, setShowQuestComplete] = useState(false);

  const dailyTasks = useMemo(() => getDailyTasks(4), []);

  const getTaskProgress = useCallback((task: DailyTask): number => {
    return progress.dailyActions[task.action as keyof DailyActionTracker] || 0;
  }, [progress.dailyActions]);

  const isAllDailyTasksComplete = useCallback((): boolean => {
    return dailyTasks.every((task) => {
      const current = progress.dailyActions[task.action as keyof DailyActionTracker] || 0;
      return current >= task.target;
    });
  }, [dailyTasks, progress.dailyActions]);

  useEffect(() => {
    const saved = window.localStorage.getItem(progressKey) ?? window.localStorage.getItem(legacyProgressKey);
    const savedTheme = window.localStorage.getItem(themeKey) as "light" | "dark" | null;

    if (saved) {
      const parsed = JSON.parse(saved);
      const todayKey = getTodayKey();

      if (parsed.dailyDate !== todayKey) {
        parsed.dailyActions = { ...defaultDailyActions };
        parsed.dailyDate = todayKey;
        parsed.dailyQuestCompleteShown = false;
        parsed.dailyBadgeClaimed = false;
      }

      if (!parsed.dailyActions) {
        parsed.dailyActions = { ...defaultDailyActions };
      }

      setProgress({ ...defaultProgress, ...parsed });
    }

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progress]);

  const setLevel = () => {};

  useEffect(() => {
    window.localStorage.setItem(themeKey, theme);
    const root = window.document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo<LearningState>(() => {
    const progressPercent = Math.min(
      100,
      Math.round(((progress.reviewed + progress.writing + progress.quizBest / 10) / 42) * 100)
    );

    return {
      level,
      setLevel,
      data: course[level],
      progress,
      setProgress,
      progressPercent,
      theme,
      setTheme,
      dailyTasks,
      getTaskProgress,
      isAllDailyTasksComplete,
      showQuestComplete,
      setShowQuestComplete
    };
  }, [level, progress, theme, dailyTasks, getTaskProgress, isAllDailyTasksComplete, showQuestComplete]);

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used inside LearningProvider");
  }
  return context;
}
