"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Download, X } from "lucide-react";

type QuestCompletePopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
  level: string;
};

export default function QuestCompletePopup({ isOpen, onClose, onDownload, downloading, level }: QuestCompletePopupProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      const colors = ["#e88ba1", "#f7a4b7", "#c96078", "#4dabf7", "#1ba37a", "#cca13d"];
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      }));
      setConfetti(newConfetti);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            padding: "20px"
          }}
          onClick={onClose}
        >
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.5],
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, -100 - Math.random() * 300]
              }}
              transition={{
                duration: 2,
                delay: c.delay,
                ease: "easeOut"
              }}
              style={{
                position: "absolute",
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: "10px",
                height: "10px",
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                background: c.color,
                pointerEvents: "none"
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--card-glass-bg)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              border: "1px solid var(--card-glass-border)",
              padding: "40px",
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: "4px"
              }}
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--green)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 24px"
              }}
            >
              <Trophy size={40} color="white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontSize: "1.8rem",
                fontWeight: "900",
                color: "var(--ink)",
                marginBottom: "8px"
              }}
            >
              Congratulations!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: "1rem",
                color: "var(--muted)",
                marginBottom: "8px"
              }}
            >
              You completed all {level} daily quests!
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              style={{
                fontSize: "0.9rem",
                color: "var(--muted)",
                marginBottom: "30px"
              }}
            >
              Claim your achievement badge to celebrate your progress.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onDownload}
              disabled={downloading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "none",
                background: "var(--green)",
                color: "white",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer"
              }}
            >
              <Download size={20} />
              {downloading ? "Generating badge..." : "Download Badge"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
