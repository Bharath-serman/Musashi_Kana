"use client";

import { useState, useEffect } from "react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

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
    id: string;
    title: string;
    japanese: string;
    translation: string;
    questions: string[][];
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          id: p.id,
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
        action={
          <button 
            onClick={() => setShowTranslation((current) => !current)} 
            type="button"
            className="cinematic-button"
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              padding: "0 20px",
              borderRadius: "999px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              transition: "transform 0.2s ease"
            }}
          >
            {showTranslation ? "Hide" : "Show"} translation
          </button>
        }
      />

      {loading && <p>Loading passages...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      
      {!loading && !error && passages.length === 0 && (
        <p>No passages found for this level. Add some in Supabase!</p>
      )}

      {!loading && !error && passages.length > 0 && (
        <div style={{ marginTop: "40px", display: "grid", gap: "24px" }}>
          {passages.map((passage) => (
            <PassageCard 
              key={passage.id} 
              passage={passage} 
              isExpanded={expandedId === passage.id}
              onToggle={() => setExpandedId(expandedId === passage.id ? null : passage.id)}
              showTranslation={showTranslation}
            />
          ))}
        </div>
      )}
    </>
  );
}

function PassageCard({ passage, isExpanded, onToggle, showTranslation }: { 
  passage: {
    id: string;
    title: string;
    japanese: string;
    translation: string;
    questions: string[][];
  }, 
  isExpanded: boolean, 
  onToggle: () => void,
  showTranslation: boolean
}) {
  return (
    <motion.div 
      className={`panel reading-panel ${isExpanded ? 'expanded' : ''}`}
      layout
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{ 
        cursor: "pointer",
        overflow: "hidden",
        border: "1px solid var(--line)",
        borderRadius: "12px",
        background: "var(--card-glass-bg)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        padding: "24px"
      }}
      onClick={onToggle}
      whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
    >
      <motion.div layout="position" className="section-heading" style={{ marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Passage</span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "900", marginTop: "4px" }}>{passage.title}</h2>
        </div>
        <motion.div 
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ marginTop: "24px" }}
          >
            <motion.p 
              className="reading-text" 
              lang="ja"
              style={{ 
                fontSize: "1.25rem", 
                lineHeight: "1.8", 
                color: "var(--ink)",
                fontFamily: "'Noto Serif JP', serif"
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {passage.japanese}
            </motion.p>
            
            {showTranslation && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="translation"
                style={{ color: "var(--muted)", marginTop: "12px", fontStyle: "italic" }}
              >
                {passage.translation}
              </motion.p>
            )}

            <div className="question-stack" style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
              {passage.questions.map(([question, answer], idx) => (
                <div key={idx} style={{ borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
                  <p style={{ fontWeight: "700" }}>{question}</p>
                  <p style={{ color: "var(--muted)", marginTop: "4px" }}>{answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
