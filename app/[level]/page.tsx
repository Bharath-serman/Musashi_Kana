"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Brain, Check, Flame, GraduationCap, Sparkles, Trophy, Download, ArrowRight } from "lucide-react";
import { AppFrame, Metric } from "../components/app-frame";
import { defaultProgress, useLearning } from "../components/learning-state";
import { motion, AnimatePresence } from "framer-motion";
import { getTodayKey, getFormattedDate } from "../lib/daily-tasks";
import QuestCompletePopup from "../components/quest-complete-popup";

export default function DashboardPage() {
  return (
    <AppFrame>
      <Dashboard />
    </AppFrame>
  );
}

function Dashboard() {
  const { data, level, progress, progressPercent, setProgress, theme, dailyTasks, getTaskProgress, isAllDailyTasksComplete, showQuestComplete, setShowQuestComplete } = useLearning();
  const [downloading, setDownloading] = useState(false);

  const todayKey = getTodayKey();
  const allDone = isAllDailyTasksComplete();
  const formattedDate = getFormattedDate();

  useEffect(() => {
    if (allDone && !progress.dailyQuestCompleteShown) {
      setShowQuestComplete(true);
      setProgress((current) => ({ ...current, dailyQuestCompleteShown: true }));
    }
  }, [allDone, progress.dailyQuestCompleteShown, setProgress, setShowQuestComplete]);

  function generateBadge(): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext("2d")!;

      const isDark = theme === "dark";
      const bg = isDark ? "#1c1418" : "#ffffff";
      const ink = isDark ? "#f5f0f2" : "#2a1f26";
      const muted = isDark ? "#b09ba4" : "#857078";
      const accent = isDark ? "#f7a4b7" : "#e88ba1";
      const accentDark = isDark ? "#e88ba1" : "#c96078";

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 800, 500);

      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 760, 460);

      ctx.strokeStyle = accentDark;
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 740, 440);

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(400, 110, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = bg;
      ctx.font = "bold 48px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("学", 400, 112);

      ctx.fillStyle = ink;
      ctx.font = "bold 36px Inter, sans-serif";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("Musashi_Kana", 400, 195);

      ctx.fillStyle = accentDark;
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.fillText(`${level} Daily Quest Complete`, 400, 235);

      ctx.fillStyle = muted;
      ctx.font = "16px Inter, sans-serif";
      ctx.fillText(formattedDate, 400, 270);

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(300, 295);
      ctx.lineTo(500, 295);
      ctx.stroke();

      ctx.fillStyle = ink;
      ctx.font = "bold 18px Inter, sans-serif";
      ctx.fillText("Daily Achievement Unlocked!", 400, 330);

      ctx.fillStyle = muted;
      ctx.font = "14px Inter, sans-serif";
      ctx.fillText("All daily tasks completed successfully", 400, 360);

      ctx.fillStyle = accentDark;
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillText("musashi-kana.app", 400, 450);

      canvas.toBlob((blob) => resolve(blob!), "image/png");
    });
  }

  const handleDownloadBadge = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await generateBadge();
      setProgress((current) => ({ ...current, dailyBadgeClaimed: true }));

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `musashi-kana-${level}-badge-${todayKey}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [level, todayKey, theme, data.theme, setProgress]);

  return (
    <>
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          alignItems: "center",
          marginBottom: "60px"
        }}
      >
        <div className="hero-copy">
          <motion.div 
            className="pill"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(232, 139, 161, 0.1)",
              color: "var(--blue)",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}
          >
            <Sparkles size={14} /> {data.theme} track
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontSize: "clamp(3rem, 6vw, 5rem)",
              fontWeight: "900",
              lineHeight: "0.9",
              marginTop: "20px",
              marginBottom: "20px",
              color: "var(--ink)"
            }}
          >
            {data.headline}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: "1.2rem",
              color: "var(--muted)",
              maxWidth: "500px",
              lineHeight: "1.6"
            }}
          >
            {data.description}
          </motion.p>
          
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "30px"
            }}
          >
            <Link 
              className="primary-action" 
              href={`/${level.toLowerCase()}/flashcards`}
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                padding: "14px 28px",
                borderRadius: "8px",
                fontWeight: "bold",
                textDecoration: "none",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                transition: "transform 0.2s"
              }}
            >
              Start flashcards
            </Link>
            <Link 
              className="secondary-action" 
              href={`/${level.toLowerCase()}/roadmap`}
              style={{
                background: "var(--card-glass-bg)",
                color: "var(--ink)",
                padding: "14px 28px",
                borderRadius: "8px",
                fontWeight: "bold",
                textDecoration: "none",
                border: "1px solid var(--line)",
                transition: "background 0.2s"
              }}
            >
              View roadmap
            </Link>
          </motion.div>
        </div>
        
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            position: "relative"
          }}
        >
          <div style={{
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
            background: "var(--glass-bg)",
            backdropFilter: "blur(10px)",
            padding: "10px"
          }}>
            <Image 
              src={theme === "dark" ? "/study-scene-dark.png" : "/study-scene.png"} 
              alt="Japanese study desk with flashcards and notebook" 
              width={1200} 
              height={800} 
              priority 
              style={{
                borderRadius: "16px",
                display: "block",
                width: "100%",
                height: "auto"
              }}
            />
          </div>
          
          <motion.div 
            className="mission-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              position: "absolute",
              bottom: "30px",
              right: "-20px",
              background: "var(--card-glass-bg)",
              backdropFilter: "blur(10px)",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              maxWidth: "280px",
              border: "1px solid var(--card-glass-border)"
            }}
          >
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--blue)", fontWeight: "bold" }}>Smart session</span>
            <strong style={{ display: "block", marginTop: "6px", fontSize: "1rem", color: "var(--ink)" }}>{data.mission}</strong>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section 
        className="metrics" 
        aria-label="Learning overview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px"
        }}
      >
        <Metric icon={<GraduationCap />} label="Target words" value={data.stats.words.toLocaleString()} />
        <Metric icon={<BookOpen />} label="Kanji scope" value={data.stats.kanji.toString()} />
        <Metric icon={<Brain />} label="Grammar points" value={data.stats.grammar.toString()} />
        <Metric icon={<Flame />} label="Saved streak" value={`${progress.streak} day`} />
      </motion.section>

      <section 
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "30px"
        }}
      >
        <motion.article 
          className="panel progress-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          style={{
            background: "var(--card-glass-bg)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid var(--card-glass-border)"
          }}
        >
          <div className="section-heading" style={{ marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Progress</span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "900" }}>Study cockpit</h2>
            </div>
          </div>
          
          <div style={{ display: "grid", placeItems: "center", marginBottom: "20px" }}>
            <div className="progress-ring" style={{ 
              width: "120px", 
              height: "120px", 
              borderRadius: "50%", 
              border: "10px solid var(--line)", 
              display: "grid", 
              placeItems: "center"
            }}>
              <strong style={{ fontSize: "1.5rem" }}>{progressPercent}%</strong>
            </div>
          </div>

          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Quest</span>
            <h3 style={{ fontSize: "1rem", fontWeight: "800", marginTop: "4px" }}>
              {dailyTasks.filter((t) => getTaskProgress(t) >= t.target).length}/{dailyTasks.length} completed
            </h3>
          </div>
          
          <div className="task-list" style={{ display: "grid", gap: "10px" }}>
            {dailyTasks.map((task) => {
              const current = getTaskProgress(task);
              const isDone = current >= task.target;
              const progress = Math.min(100, Math.round((current / task.target) * 100));
              return (
                <Link
                  href={`/${level.toLowerCase()}${task.href}`}
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: isDone ? "var(--success-soft)" : "var(--paper)",
                    color: isDone ? "var(--green)" : "var(--ink)",
                    textDecoration: "none",
                    fontWeight: isDone ? "bold" : "normal",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  {!isDone && (
                    <div style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${progress}%`,
                      background: "var(--success-soft)",
                      transition: "width 0.3s ease"
                    }} />
                  )}
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    border: "2px solid",
                    borderColor: isDone ? "var(--green)" : "var(--muted)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    position: "relative",
                    zIndex: 1
                  }}>
                    {isDone && <Check size={12} />}
                  </div>
                  <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: "0.9rem" }}>{task.title}</div>
                    {!isDone && (
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
                        {current}/{task.target} done
                      </div>
                    )}
                  </div>
                  {!isDone && <ArrowRight size={14} style={{ color: "var(--muted)", position: "relative", zIndex: 1 }} />}
                </Link>
              );
            })}
          </div>

          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: "20px" }}
            >
              <button
                onClick={handleDownloadBadge}
                disabled={downloading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "14px",
                  borderRadius: "8px",
                  border: progress.dailyBadgeClaimed ? "1px solid var(--green)" : "none",
                  background: progress.dailyBadgeClaimed ? "transparent" : "var(--green)",
                  color: progress.dailyBadgeClaimed ? "var(--green)" : "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  transition: "transform 0.2s, opacity 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
              >
                {progress.dailyBadgeClaimed ? <Download size={18} /> : <Trophy size={18} />}
                {downloading ? "Generating..." : progress.dailyBadgeClaimed ? "Download Badge Again" : "Claim Daily Badge"}
              </button>
            </motion.div>
          )}
        </motion.article>

        <motion.article 
          className="panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          style={{
            background: "var(--card-glass-bg)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid var(--card-glass-border)"
          }}
        >
          <div className="section-heading" style={{ marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Quick launch</span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "900" }}>{level} study rooms</h2>
            </div>
          </div>
          
          <div className="route-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            {[
              { href: `/${level.toLowerCase()}/flashcards`, title: "Flashcards", desc: "Vocabulary and kanji recall" },
              { href: `/${level.toLowerCase()}/grammar`, title: "Grammar", desc: "Patterns, examples, and notes" },
              { href: `/${level.toLowerCase()}/reading`, title: "Reading", desc: "Passage, translation, questions" },
              { href: `/${level.toLowerCase()}/writing`, title: "Writing", desc: "Guided kana and kanji canvas" },
              { href: `/${level.toLowerCase()}/quiz`, title: "Quiz", desc: "Checkpoint questions" },
              { href: `/${level.toLowerCase()}/roadmap`, title: "Roadmap", desc: "Study sequence and resources" }
            ].map((route) => (
              <Link 
                key={route.href}
                href={route.href}
                style={{
                  background: "var(--paper)",
                  padding: "20px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "var(--ink)",
                  border: "1px solid var(--line)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  display: "grid",
                  gap: "4px"
                }}
                className="route-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <strong style={{ fontSize: "1.1rem" }}>{route.title}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{route.desc}</span>
              </Link>
            ))}
          </div>
        </motion.article>
      </section>

      <QuestCompletePopup
        isOpen={showQuestComplete}
        onClose={() => setShowQuestComplete(false)}
        onDownload={handleDownloadBadge}
        downloading={downloading}
        level={level}
      />
    </>
  );
}
