"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";

export default function FlashcardsPage() {
  return (
    <AppFrame>
      <Flashcards />
    </AppFrame>
  );
}

function Flashcards() {
  const { data, level, setProgress } = useLearning();
  const [deck, setDeck] = useState<"vocab" | "kanji">("vocab");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const cards = data[deck];
  const activeCard = cards[cardIndex % cards.length];

  useEffect(() => {
    setCardIndex(0);
    setFlipped(false);
  }, [level, deck]);

  function moveCard(direction: number) {
    setCardIndex((current) => (current + direction + cards.length) % cards.length);
    setFlipped(false);
  }

  function markKnown() {
    setProgress((current) => ({ ...current, reviewed: current.reviewed + 1 }));
    moveCard(1);
  }

  return (
    <>
      <PageHeader
        eyebrow="Recall"
        title={`${level} flashcard trainer`}
        text="Flip through vocabulary and kanji cards, then mark known items to build your saved study momentum."
        action={
          <div className="segmented">
            <button className={deck === "vocab" ? "active" : ""} onClick={() => setDeck("vocab")} type="button">Vocabulary</button>
            <button className={deck === "kanji" ? "active" : ""} onClick={() => setDeck("kanji")} type="button">Kanji</button>
          </div>
        }
      />

      <section className="panel flashcard-panel">
        <div className={`study-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((current) => !current)} role="button" tabIndex={0}>
          <div className="card-face">
            <span>{deck}</span>
            <strong>{activeCard.front}</strong>
            <p>{activeCard.reading}</p>
          </div>
          <div className="card-back">
            <span>{activeCard.note}</span>
            <strong>{activeCard.meaning}</strong>
            <p lang="ja">{activeCard.example}</p>
          </div>
        </div>
        <div className="control-row">
          <button onClick={() => moveCard(-1)} type="button"><ChevronLeft size={18} /> Previous</button>
          <button onClick={() => setFlipped((current) => !current)} type="button">Flip</button>
          <button className="success-button" onClick={markKnown} type="button"><Check size={18} /> I know this</button>
          <button onClick={() => moveCard(1)} type="button">Next <ChevronRight size={18} /></button>
        </div>
      </section>
    </>
  );
}
