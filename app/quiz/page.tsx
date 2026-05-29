"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";
import { supabase } from "../lib/supabase";
import type { QuizQuestion } from "../data";

export default function QuizPage() {
  return (
    <AppFrame>
      <Quiz />
    </AppFrame>
  );
}

/** Fisher-Yates shuffle – returns a new shuffled array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Quiz() {
  const { data, level, progress, setProgress } = useLearning();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);

  /** Fetch questions from Supabase; fall back to local data.ts on error */
  async function fetchQuestions() {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("quiz_questions")
      .select("prompt, choice_1, choice_2, choice_3, choice_4, answer")
      .eq("level", level);

    if (error || !rows || rows.length === 0) {
      // Fall back to local data
      setQuestions(shuffle(data.quiz));
    } else {
      const mapped: QuizQuestion[] = rows.map((r: any) => ({
        prompt: r.prompt,
        choices: [r.choice_1, r.choice_2, r.choice_3, r.choice_4],
        answer: r.answer,
      }));
      setQuestions(shuffle(mapped));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchQuestions();
  }, [level]);

  function resetQuiz() {
    setQuizIndex(0);
    setQuizCorrect(0);
    setAnswered(null);
    setQuizComplete(false);
    fetchQuestions(); // Re-fetch & re-shuffle on every new quiz
  }

  /** Shuffle choices for the current question on each render cycle */
  const currentQuestion = questions[quizIndex];
  const shuffledChoices = useMemo(
    () => (currentQuestion ? shuffle(currentQuestion.choices) : []),
    [quizIndex, questions] // re-shuffle when question changes
  );

  function answerQuiz(choice: string) {
    if (answered || quizComplete || !currentQuestion) return;
    setAnswered(choice);
    const nextCorrect = quizCorrect + (choice === currentQuestion.answer ? 1 : 0);

    window.setTimeout(() => {
      if (quizIndex === questions.length - 1) {
        const score = Math.round((nextCorrect / questions.length) * 100);
        setQuizCorrect(nextCorrect);
        setQuizComplete(true);
        setProgress((current) => ({
          ...current,
          quizBest: Math.max(current.quizBest, score),
        }));
      } else {
        setQuizCorrect(nextCorrect);
        setQuizIndex((current) => current + 1);
        setAnswered(null);
      }
    }, 850);
  }

  return (
    <>
      <PageHeader
        eyebrow="Checkpoint"
        title={`${level} mini quiz`}
        text="Answer a short mixed quiz from the active level. Your best score is saved locally."
        action={
          <button onClick={resetQuiz} type="button">
            New quiz
          </button>
        }
      />

      <section className="panel quiz-panel">
        {loading ? (
          <div className="quiz-card" style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            Loading questions…
          </div>
        ) : quizComplete ? (
          <div className="quiz-complete">
            <Trophy size={42} />
            <h3>Quiz complete</h3>
            <p>
              Your score is {Math.round((quizCorrect / questions.length) * 100)}%.{" "}
              Best saved score: {progress.quizBest}%.
            </p>
          </div>
        ) : currentQuestion ? (
          <div className="quiz-card">
            <span>
              Question {quizIndex + 1} / {questions.length}
            </span>
            <h3>{currentQuestion.prompt}</h3>
            <div className="quiz-options">
              {shuffledChoices.map((choice) => {
                const isAnswer = choice === currentQuestion.answer;
                const picked = answered === choice;
                return (
                  <button
                    className={`${answered && isAnswer ? "correct" : ""} ${
                      picked && !isAnswer ? "wrong" : ""
                    }`}
                    disabled={answered !== null}
                    key={choice}
                    onClick={() => answerQuiz(choice)}
                    type="button"
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
