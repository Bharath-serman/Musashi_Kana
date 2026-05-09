"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";

export default function QuizPage() {
  return (
    <AppFrame>
      <Quiz />
    </AppFrame>
  );
}

function Quiz() {
  const { data, level, progress, setProgress } = useLearning();
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const quizQuestion = data.quiz[quizIndex % data.quiz.length];

  useEffect(() => {
    resetQuiz();
  }, [level]);

  function resetQuiz() {
    setQuizIndex(0);
    setQuizCorrect(0);
    setAnswered(null);
    setQuizComplete(false);
  }

  function answerQuiz(choice: string) {
    if (answered || quizComplete) return;
    setAnswered(choice);
    const nextCorrect = quizCorrect + (choice === quizQuestion.answer ? 1 : 0);

    window.setTimeout(() => {
      if (quizIndex === data.quiz.length - 1) {
        const score = Math.round((nextCorrect / data.quiz.length) * 100);
        setQuizCorrect(nextCorrect);
        setQuizComplete(true);
        setProgress((current) => ({ ...current, quizBest: Math.max(current.quizBest, score) }));
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
        action={<button onClick={resetQuiz} type="button">New quiz</button>}
      />

      <section className="panel quiz-panel">
        {quizComplete ? (
          <div className="quiz-complete">
            <Trophy size={42} />
            <h3>Quiz complete</h3>
            <p>Your score is {Math.round((quizCorrect / data.quiz.length) * 100)}%. Best saved score: {progress.quizBest}%.</p>
          </div>
        ) : (
          <div className="quiz-card">
            <span>Question {quizIndex + 1} / {data.quiz.length}</span>
            <h3>{quizQuestion.prompt}</h3>
            <div className="quiz-options">
              {quizQuestion.choices.map((choice) => {
                const isAnswer = choice === quizQuestion.answer;
                const picked = answered === choice;
                return (
                  <button
                    className={`${answered && isAnswer ? "correct" : ""} ${picked && !isAnswer ? "wrong" : ""}`}
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
        )}
      </section>
    </>
  );
}
