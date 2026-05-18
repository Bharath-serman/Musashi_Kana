"use client";

import { useState, useEffect } from "react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";
import { supabase } from "../lib/supabase";

export default function ReadingPage() {
  return (
    <AppFrame>
      <Reading />
    </AppFrame>
  );
}

function Reading() {
  const { level } = useLearning();
  const [showTranslation, setShowTranslation] = useState(false);
  const [passages, setPassages] = useState<{
    title: string;
    japanese: string;
    translation: string;
    questions: string[][];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const { data: passagesData, error: passagesError } = await supabase
          .from('reading_passages')
          .select(`
            id,
            title,
            japanese,
            translation,
            reading_questions (
              question,
              answer
            )
          `)
          .eq('level', level);

        if (passagesError) {
          setError(passagesError.message);
          setLoading(false);
          return;
        }

        const transformedData = passagesData ? passagesData.map((p: any) => ({
          title: p.title,
          japanese: p.japanese,
          translation: p.translation,
          questions: p.reading_questions ? p.reading_questions.map((q: any) => [q.question, q.answer]) : []
        })) : [];

        setPassages(transformedData);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [level]);

  return (
    <>
      <PageHeader
        eyebrow="Comprehension"
        title={`${level} reading practice`}
        text="Read the passage first, answer the prompts, then reveal the translation when you are ready."
        action={<button onClick={() => setShowTranslation((current) => !current)} type="button">{showTranslation ? "Hide" : "Show"} translation</button>}
      />

      {loading && <p>Loading passages...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      
      {!loading && !error && passages.length === 0 && (
        <p>No passages found for this level. Add some in Supabase!</p>
      )}

      {!loading && !error && passages.length > 0 && (
        <div style={{ marginTop: "20px", display: "grid", gap: "16px" }}>
          {passages.map((passage, index) => (
            <details key={index} className="panel reading-panel">
              <summary className="section-heading" style={{ cursor: "pointer" }}>
                <div>
                  <span>Passage</span>
                  <h2>{passage.title}</h2>
                </div>
              </summary>
              <div style={{ marginTop: "16px" }}>
                <p className="reading-text" lang="ja">{passage.japanese}</p>
                {showTranslation && <p className="translation">{passage.translation}</p>}
                <div className="question-stack" style={{ marginTop: "16px" }}>
                  {passage.questions.map(([question, answer]) => (
                    <details key={question}>
                      <summary style={{ cursor: "pointer" }}>{question}</summary>
                      <p>{answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
