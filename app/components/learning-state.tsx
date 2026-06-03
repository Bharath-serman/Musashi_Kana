"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useParams } from "next/navigation";
import { Level, course } from "../data";

export type Progress = {
  reviewed: number;
  writing: number;
  quizBest: number;
  streak: number;
  completedTasks: string[];
};

export const defaultProgress: Progress = {
  reviewed: 0,
  writing: 0,
  quizBest: 0,
  streak: 1,
  completedTasks: []
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

  // Load persistence on mount
  useEffect(() => {
    const saved = window.localStorage.getItem(progressKey) ?? window.localStorage.getItem(legacyProgressKey);
    const savedTheme = window.localStorage.getItem(themeKey) as "light" | "dark" | null;
    
    if (saved) setProgress({ ...defaultProgress, ...JSON.parse(saved) });
    
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  // Sync state to local storage and document element
  useEffect(() => {
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progress]);

  // no-op for setLevel since it's driven by URL now
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
      setTheme
    };
  }, [level, progress, theme]);

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used inside LearningProvider");
  }
  return context;
}
