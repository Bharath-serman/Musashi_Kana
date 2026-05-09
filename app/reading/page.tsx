"use client";

import { useState } from "react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";

export default function ReadingPage() {
  return (
    <AppFrame>
      <Reading />
    </AppFrame>
  );
}

function Reading() {
  const { data, level } = useLearning();
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Comprehension"
        title={`${level} reading practice`}
        text="Read the passage first, answer the prompts, then reveal the translation when you are ready."
        action={<button onClick={() => setShowTranslation((current) => !current)} type="button">{showTranslation ? "Hide" : "Show"} translation</button>}
      />

      <section className="panel reading-panel">
        <div className="section-heading">
          <div>
            <span>Passage</span>
            <h2>{data.reading.title}</h2>
          </div>
        </div>
        <p className="reading-text" lang="ja">{data.reading.japanese}</p>
        {showTranslation && <p className="translation">{data.reading.translation}</p>}
        <div className="question-stack">
          {data.reading.questions.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
