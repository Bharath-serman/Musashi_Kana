"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
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
};

const LearningContext = createContext<LearningState | null>(null);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<Level>("N5");
  const [progress, setProgress] = useState<Progress>(defaultProgress);

  useEffect(() => {
    const saved = window.localStorage.getItem("minato-progress");
    const savedLevel = window.localStorage.getItem("minato-level") as Level | null;
    if (saved) setProgress({ ...defaultProgress, ...JSON.parse(saved) });
    if (savedLevel === "N5" || savedLevel === "N4") setLevel(savedLevel);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("minato-progress", JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    window.localStorage.setItem("minato-level", level);
  }, [level]);

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
      progressPercent
    };
  }, [level, progress]);

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used inside LearningProvider");
  }
  return context;
}
