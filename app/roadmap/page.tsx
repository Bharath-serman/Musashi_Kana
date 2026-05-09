"use client";

import Link from "next/link";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";

const resources = [
  ["Kana sprint", "Read kana aloud for five minutes, then write the symbols you missed."],
  ["Shadowing", "Use free audio sources and repeat short sentences rhythmically."],
  ["Notebook loop", "For each grammar pattern, write one true sentence and one question."],
  ["Exam rhythm", "Alternate vocabulary recall, reading, and grammar in 20-minute blocks."]
];

export default function RoadmapPage() {
  return (
    <AppFrame>
      <Roadmap />
    </AppFrame>
  );
}

function Roadmap() {
  const { data, level } = useLearning();

  return (
    <>
      <PageHeader
        eyebrow="Path"
        title={`${level} roadmap and resources`}
        text="Use this page as your study sequence, then jump into a focused room when you are ready."
        action={<Link className="primary-action" href="/flashcards">Begin recall</Link>}
      />

      <section className="dashboard-grid">
        <article className="panel">
          <div className="section-heading">
            <div>
              <span>Roadmap</span>
              <h2>{level} sequence</h2>
            </div>
          </div>
          <div className="roadmap">
            {data.roadmap.map(([title, text], index) => (
              <div className="roadmap-item" key={title}>
                <strong>{index + 1}</strong>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <span>Resources</span>
              <h2>Practice library</h2>
            </div>
          </div>
          <div className="resource-list">
            {resources.map(([title, text]) => (
              <div className="resource-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
