"use client";

import { useState } from "react";
import { AppFrame, PageHeader } from "../../components/app-frame";
import { motion, AnimatePresence } from "framer-motion";
import { hiragana, katakana, n5Kanji, n4Kanji } from "./data";

export default function ReferencePage() {
  const [activeTab, setActiveTab] = useState("hiragana");

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AppFrame>
      <PageHeader
        eyebrow="Charts"
        title="Kana & Kanji Charts"
        text="Study the basic writing systems and characters for N5 and N4. Click any character to hear its pronunciation."
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
        {["hiragana", "katakana", "kanji"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              background: activeTab === tab ? "var(--ink)" : "var(--card-glass-bg)",
              color: activeTab === tab ? "var(--paper)" : "var(--ink)",
              fontWeight: "bold",
              boxShadow: activeTab === tab ? "0 4px 15px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.3s ease"
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "hiragana" && (
          <motion.div
            key="hiragana"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="panel"
            style={{ background: "var(--card-glass-bg)", backdropFilter: "blur(10px)", padding: "30px", borderRadius: "16px", border: "1px solid var(--line)" }}
          >
            <h2 style={{ marginBottom: "20px", fontWeight: "900" }}>Hiragana Chart</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px" }}>
              {hiragana.map((item, index) => (
                <motion.div
                  key={index}
                  style={{
                    background: item.kana ? "var(--paper)" : "transparent",
                    padding: "15px",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: item.kana ? "1px solid var(--line)" : "none",
                    boxShadow: item.kana ? "0 2px 5px rgba(0,0,0,0.02)" : "none",
                    cursor: item.kana ? "pointer" : "default"
                  }}
                  whileHover={item.kana ? { scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" } : {}}
                  onClick={() => item.kana && speak(item.kana)}
                >
                  <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--ink)" }}>{item.kana}</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: "4px" }}>{item.roma}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "katakana" && (
          <motion.div
            key="katakana"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="panel"
            style={{ background: "var(--card-glass-bg)", backdropFilter: "blur(10px)", padding: "30px", borderRadius: "16px", border: "1px solid var(--line)" }}
          >
            <h2 style={{ marginBottom: "20px", fontWeight: "900" }}>Katakana Chart</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "12px" }}>
              {katakana.map((item, index) => (
                <motion.div
                  key={index}
                  style={{
                    background: item.kana ? "var(--paper)" : "transparent",
                    padding: "15px",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: item.kana ? "1px solid var(--line)" : "none",
                    boxShadow: item.kana ? "0 2px 5px rgba(0,0,0,0.02)" : "none",
                    cursor: item.kana ? "pointer" : "default"
                  }}
                  whileHover={item.kana ? { scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" } : {}}
                  onClick={() => item.kana && speak(item.kana)}
                >
                  <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--ink)" }}>{item.kana}</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: "4px" }}>{item.roma}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "kanji" && (
          <motion.div
            key="kanji"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="panel"
            style={{ background: "var(--card-glass-bg)", backdropFilter: "blur(10px)", padding: "30px", borderRadius: "16px", border: "1px solid var(--line)" }}
          >
            <h2 style={{ marginBottom: "15px", fontWeight: "900" }}>N5 Kanji</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px", marginBottom: "40px" }}>
              {n5Kanji.map((kanji, index) => (
                <motion.div
                  key={index}
                  style={{
                    background: "var(--paper)",
                    padding: "15px",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: "1px solid var(--line)",
                    cursor: "pointer"
                  }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.05)", borderColor: "var(--blue)" }}
                  onClick={() => speak(kanji.character)}
                >
                  <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--ink)" }}>{kanji.character}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--blue)", marginTop: "4px" }}>{kanji.reading}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>{kanji.meaning}</div>
                </motion.div>
              ))}
            </div>

            <h2 style={{ marginBottom: "15px", fontWeight: "900" }}>N4 Kanji</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px" }}>
              {n4Kanji.map((kanji, index) => (
                <motion.div
                  key={index}
                  style={{
                    background: "var(--paper)",
                    padding: "15px",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: "1px solid var(--line)",
                    cursor: "pointer"
                  }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.05)", borderColor: "var(--blue)" }}
                  onClick={() => speak(kanji.character)}
                >
                  <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--ink)" }}>{kanji.character}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--blue)", marginTop: "4px" }}>{kanji.reading}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>{kanji.meaning}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppFrame>
  );
}
