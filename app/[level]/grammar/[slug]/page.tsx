"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { AppFrame, PageHeader } from "../../../components/app-frame";
import { useLearning } from "../../../components/learning-state";
import { supabase } from "../../../lib/supabase";
import { slugifyGrammar } from "../grammar-content";
import { course, Level } from "../../../data";

export default function GrammarTopicPage() {
  return (
    <AppFrame>
      <GrammarTopicDetail />
    </AppFrame>
  );
}

function GrammarTopicDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLesson() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('grammar_lessons')
          .select('*');

        if (error) {
          setError(error.message);
        } else if (data) {
          const match = data.find(item => slugifyGrammar(item.topic) === slug);
          setLesson(match);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [slug]);

  if (loading) return <PageHeader eyebrow="Patterns" title="Loading..." text="Please wait." />;
  if (error) return <PageHeader eyebrow="Patterns" title="Error" text={error} />;
  
  if (!lesson) {
    return (
      <PageHeader
        eyebrow="Patterns"
        title="Lesson not found"
        text="That grammar topic is not available."
        action={<Link className="secondary-action" href="/grammar">Back to topics</Link>}
      />
    );
  }

  const topicData = course[lesson.level as Level]?.grammar.find((g: any) => g.pattern === lesson.pattern);

  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title={lesson.topic}
        text={lesson.brief}
        action={<Link className="secondary-action" href="/grammar"><ChevronLeft size={18} /> Back</Link>}
      />

      <section className="grammar-detail-layout panel">
        <article className="grammar-lesson-shell">
          <div className="grammar-hero">
            <code>{lesson.pattern}</code>
            <h2>{lesson.title}</h2>
            <p>{topicData?.meaning}</p>
          </div>

          <div className="grammar-detail-grid">
            <section className="grammar-detail-card">
              <span>How it works</span>
              <ul className="grammar-note-list">
                {lesson.notes.map((note: string) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>

            <section className="grammar-detail-card">
              <span>Core example</span>
              <p className="grammar-jp-example" lang="ja">{topicData?.example}</p>
              <p className="grammar-tip-text">{topicData?.tip}</p>
            </section>
          </div>

          <section className="grammar-detail-card">
            <span>Examples</span>
            <div className="grammar-example-stack">
              {lesson.examples.map((example: { jp: string; en: string }) => (
                <div className="grammar-example-row" key={example.jp}>
                  <p lang="ja">{example.jp}</p>
                  <small>{example.en}</small>
                </div>
              ))}
            </div>
          </section>

          {lesson.chart ? (
            <section className="grammar-detail-card">
              <span>Quick chart</span>
              <div className="grammar-chart-wrap">
                <table className="grammar-chart">
                  <thead>
                    <tr>
                      {lesson.chart.headers.map((header: string) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.chart.rows.map((row: string[], idx: number) => (
                      <tr key={idx}>
                        {row.map((cell: string, cidx: number) => (
                          <td key={cidx}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </article>
      </section>
    </>
  );
}
