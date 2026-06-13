"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame, PageHeader } from "../../components/app-frame";
import { useLearning } from "../../components/learning-state";
import { supabase } from "../../lib/supabase";
import { slugifyGrammar } from "./grammar-content";

export default function GrammarPage() {
  return (
    <AppFrame>
      <GrammarIndex />
    </AppFrame>
  );
}

function GrammarIndex() {
  const { level, setProgress } = useLearning();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGrammar() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('grammar_lessons')
          .select('*')
          .eq('level', level);

        if (error) {
          setError(error.message);
        } else if (data) {
          setTopics(data.map(item => ({
            ...item,
            slug: slugifyGrammar(item.topic)
          })));
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchGrammar();
  }, [level]);

  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title={`${level} grammar lab`}
        text="Choose a grammar topic to open its full lesson page with explanation, examples, and a quick chart."
      />

      {loading && <p>Loading grammar topics...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && topics.length === 0 && (
        <p>No grammar topics found for this level. Add some in Supabase!</p>
      )}

      {!loading && !error && topics.length > 0 && (
        <section className="grammar-index-grid">
          {topics.map((topic) => (
            <Link 
              className="grammar-topic-link" 
              href={`/${level.toLowerCase()}/grammar/${topic.slug}`} 
              key={topic.slug}
              onClick={() => {
                setProgress((current) => ({
                  ...current,
                  dailyActions: {
                    ...current.dailyActions,
                    grammarLessons: current.dailyActions.grammarLessons + 1
                  }
                }));
              }}
            >
              <strong>{topic.topic}</strong>
              <span>{topic.pattern}</span>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
