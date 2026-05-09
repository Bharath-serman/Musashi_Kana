"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AppFrame, PageHeader } from "../../components/app-frame";
import { useLearning } from "../../components/learning-state";
import { getGrammarLesson, getGrammarTopicBySlug } from "../grammar-content";

export default function GrammarTopicPage() {
  return (
    <AppFrame>
      <GrammarTopicDetail />
    </AppFrame>
  );
}

function GrammarTopicDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { level } = useLearning();
  const topic = getGrammarTopicBySlug(level, slug);

  if (!topic) {
    return (
      <>
        <PageHeader
          eyebrow="Patterns"
          title={`${level} grammar lab`}
          text="That grammar topic is not available for the current level."
          action={<Link className="secondary-action" href="/grammar">Back to topics</Link>}
        />
      </>
    );
  }

  const lesson = getGrammarLesson(level, topic);

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
            <code>{topic.pattern}</code>
            <h2>{lesson.title}</h2>
            <p>{topic.meaning}</p>
          </div>

          <div className="grammar-detail-grid">
            <section className="grammar-detail-card">
              <span>How it works</span>
              <ul className="grammar-note-list">
                {lesson.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>

            <section className="grammar-detail-card">
              <span>Core example</span>
              <p className="grammar-jp-example" lang="ja">{topic.example}</p>
              <p className="grammar-tip-text">{topic.tip}</p>
            </section>
          </div>

          <section className="grammar-detail-card">
            <span>Examples</span>
            <div className="grammar-example-stack">
              {lesson.examples.map((example) => (
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
                      {lesson.chart.headers.map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.chart.rows.map((row) => (
                      <tr key={row.join("-")}>
                        {row.map((cell) => (
                          <td key={cell}>{cell}</td>
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
