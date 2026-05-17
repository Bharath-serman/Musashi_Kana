"use client";

import { useEffect, useState, useRef } from "react";
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
  const [deck, setDeck] = useState<"vocab" | "kanji" | "numbers" | "particles" | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const isMounted = useRef(false);
  // Sound effect for flipping
  function playFlipSound() {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"); // Simple flip/click sound
    audio.play().catch(e => console.log("Audio play failed", e));
  }

  useEffect(() => {
    if (isMounted.current && deck) {
      playFlipSound();
    } else {
      isMounted.current = true;
    }
  }, [flipped]);

  useEffect(() => {
    setCardIndex(0);
    setFlipped(false);
  }, [level, deck]);

  function moveCard(direction: number) {
    if (!deck) return;
    const cards = data[deck];
    setCardIndex((current) => (current + direction + cards.length) % cards.length);
    setFlipped(false);
  }

  function markKnown() {
    setProgress((current) => ({ ...current, reviewed: current.reviewed + 1 }));
    moveCard(1);
  }

  function handleFlip() {
    setFlipped((current) => !current);
  }

  if (!deck) {
    return (
      <>
        <PageHeader
          eyebrow="Recall"
          title={`${level} flashcard trainer`}
          text="Select a topic to start your flashcard practice."
        />
        <style>{`
          .topics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-top: 20px;
          }
          .topic-button {
            padding: 24px;
            border: 1px solid var(--line);
            border-radius: 8px;
            background: var(--panel);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }
          .topic-button:hover {
            border-color: var(--blue);
            background: rgba(232, 139, 161, 0.05);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(42, 31, 38, 0.05);
          }
          .topic-button strong {
            font-size: 1.2rem;
            text-transform: capitalize;
            color: var(--ink);
          }
          .topic-button span {
            color: var(--muted);
            font-size: 0.9rem;
          }
        `}</style>
        <div className="topics-grid">
          {["vocab", "kanji", "numbers", "particles"].map((topic) => (
            <button
              key={topic}
              className="topic-button"
              onClick={() => setDeck(topic as any)}
            >
              <strong>{topic}</strong>
              <span>Practice</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  const cards = data[deck];
  const activeCard = cards[cardIndex % cards.length];

  return (
    <>
      <PageHeader
        eyebrow="Recall"
        title={`${level} ${deck} trainer`}
        text="Flip through cards, then mark known items to build your saved study momentum."
        action={
          <button className="secondary-action" onClick={() => setDeck(null)}>Change Topic</button>
        }
      />

      <section className="panel flashcard-panel">
        <div className={`study-card ${flipped ? "flipped" : ""}`} onClick={handleFlip} role="button" tabIndex={0}>
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
          <button onClick={handleFlip} type="button">Flip</button>
          <button className="success-button" onClick={markKnown} type="button"><Check size={18} /> I know this</button>
          <button onClick={() => moveCard(1)} type="button">Next <ChevronRight size={18} /></button>
        </div>
      </section>
    </>
  );
}
