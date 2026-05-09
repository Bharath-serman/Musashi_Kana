"use client";

import Link from "next/link";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";
import { getGrammarLesson, getGrammarTopics } from "./grammar-content";

export default function GrammarPage() {
  return (
    <AppFrame>
      <GrammarIndex />
    </AppFrame>
  );
}

function GrammarIndex() {
  const { level } = useLearning();
  const topics = getGrammarTopics(level);

  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title={`${level} grammar lab`}
        text="Choose a grammar topic to open its full lesson page with explanation, examples, and a quick chart."
      />

      <section className="grammar-index-grid">
        {topics.map((topic) => {
          const lesson = getGrammarLesson(level, topic);
          return (
            <Link className="grammar-topic-link" href={`/grammar/${topic.slug}`} key={topic.slug}>
              <strong>{lesson.topic}</strong>
              <span>{topic.pattern}</span>
            </Link>
          );
        })}
      </section>
    </>
  );
}
