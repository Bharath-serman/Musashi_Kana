"use client";

import { Trophy } from "lucide-react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";

export default function GrammarPage() {
  return (
    <AppFrame>
      <Grammar />
    </AppFrame>
  );
}

function Grammar() {
  const { data, level } = useLearning();
  const weakPoints = level === "N5"
    ? ["Particles は / が", "Long vowels", "Time expressions"]
    : ["て-form chains", "ので vs から", "Plain-form grammar"];

  return (
    <>
      <PageHeader
        eyebrow="Patterns"
        title={`${level} grammar lab`}
        text="Study the core sentence patterns with examples and quick usage notes."
      />

      <section className="learning-grid">
        <article className="panel">
          <div className="grammar-list">
            {data.grammar.map((item) => (
              <div className="grammar-card" key={item.pattern}>
                <code>{item.pattern}</code>
                <h3>{item.meaning}</h3>
                <p lang="ja">{item.example}</p>
                <small>{item.tip}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel weak-panel">
          <div className="section-heading">
            <div>
              <span>Coach</span>
              <h2>Focus queue</h2>
            </div>
          </div>
          {weakPoints.map((item) => (
            <div className="focus-row" key={item}>
              <Trophy size={18} />
              <span>{item}</span>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
