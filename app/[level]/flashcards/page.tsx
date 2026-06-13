"use client";

import { useEffect, useState, useRef } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AppFrame, PageHeader } from "../../components/app-frame";
import { useLearning } from "../../components/learning-state";
import { supabase } from "../../lib/supabase";

export default function FlashcardsPage() {
  return (
    <AppFrame>
      <Flashcards />
    </AppFrame>
  );
}

function Flashcards() {
  const { level, setProgress } = useLearning();
  const [deck, setDeck] = useState<"vocab" | "kanji" | "numbers" | "particles" | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isKnown, setIsKnown] = useState(false);

  const isMounted = useRef(false);
  
  function playFlipSound() {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
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
    async function fetchCards() {
      if (!deck) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('level', level)
          .eq('type', deck);

        if (error) {
          console.error(error);
        } else if (data) {
          setCards(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
    setCardIndex(0);
    setFlipped(false);
  }, [level, deck]);

  function moveCard(direction: number) {
    if (cards.length === 0) return;
    setCardIndex((current) => (current + direction + cards.length) % cards.length);
    setFlipped(false);
  }

  function markKnown() {
    setIsKnown(true);
    setProgress((current) => ({
      ...current,
      reviewed: current.reviewed + 1,
      dailyActions: {
        ...current.dailyActions,
        reviewed: current.dailyActions.reviewed + 1
      }
    }));
    
    setTimeout(() => {
      moveCard(1);
      setIsKnown(false);
    }, 500);
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

  const activeCard = cards[cardIndex];

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

      {loading && <p>Loading cards...</p>}
      
      {!loading && cards.length === 0 && (
        <p>No cards found for this topic. Add some in Supabase!</p>
      )}

      {!loading && cards.length > 0 && activeCard && (
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
            <button 
              className={isKnown ? "success-button" : "secondary-action"} 
              onClick={markKnown} 
              type="button"
              style={isKnown ? { backgroundColor: "var(--green)", color: "white" } : {}}
            >
              <Check size={18} /> I know this
            </button>
            <button onClick={() => moveCard(1)} type="button">Next <ChevronRight size={18} /></button>
          </div>
        </section>
      )}
    </>
  );
}
