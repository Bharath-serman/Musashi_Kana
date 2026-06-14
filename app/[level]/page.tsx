"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Brain, Check, Flame, Trophy, Download, ArrowUpRight, Sparkles } from "lucide-react";
import { AppFrame } from "../components/app-frame";
import { useLearning } from "../components/learning-state";
import { useAuth } from "../components/auth-provider";
import { motion } from "framer-motion";
import { getTodayKey, getFormattedDate } from "../lib/daily-tasks";
import QuestCompletePopup from "../components/quest-complete-popup";
import BlogDailyPopup from "../components/blog-daily-popup";

export default function DashboardPage() {
  return (
    <AppFrame>
      <Dashboard />
    </AppFrame>
  );
}

function Dashboard() {
  const { data, level, progress, progressPercent, setProgress, theme, dailyTasks, getTaskProgress, isAllDailyTasksComplete, showQuestComplete, setShowQuestComplete } = useLearning();
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const todayKey = getTodayKey();
  const allDone = isAllDailyTasksComplete();
  const formattedDate = getFormattedDate();
  const completedCount = dailyTasks.filter((t) => getTaskProgress(t) >= t.target).length;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, todayKey, theme, data.theme, setProgress]);

  return (
    <>
      {/* Hero */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--blue)" }}>{data.theme} path</span>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>|</span>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{formattedDate}</span>
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: "900", lineHeight: "1.05", color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {data.headline}
            </h1>
            <p style={{ fontSize: "1rem", color: "var(--muted)", marginTop: "10px", maxWidth: "420px", lineHeight: "1.5" }}>
              {data.description}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href={`/${level.toLowerCase()}/flashcards`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "6px",
                background: "var(--ink)",
                color: "var(--paper)",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "0.85rem"
              }}
            >
              Start Studying
            </Link>
            <Link
              href={`/${level.toLowerCase()}/roadmap`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "6px",
                background: "transparent",
                color: "var(--ink)",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "0.85rem",
                border: "1px solid var(--line)"
              }}
            >
              Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", marginBottom: "32px", background: "var(--line)", borderRadius: "12px", overflow: "hidden" }}>
        {[
          { icon: <BookOpen size={18} />, label: "Words", value: data.stats.words.toLocaleString(), accent: false },
          { icon: <Brain size={18} />, label: "Kanji", value: data.stats.kanji.toString(), accent: false },
          { icon: <Sparkles size={18} />, label: "Grammar", value: data.stats.grammar.toString(), accent: false },
          { icon: <Flame size={18} />, label: "Streak", value: `${progress.streak}d`, accent: true }
        ].map((stat, i) => (
          <div key={i} style={{ padding: "20px 24px", background: "var(--paper)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ color: stat.accent ? "var(--blue)" : "var(--muted)" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--ink)", lineHeight: "1" }}>{stat.value}</div>
            <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Left Column - Quest */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Progress */}
          <div style={{ padding: "24px", borderRadius: "10px", border: "1px solid var(--line)", background: "var(--paper)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Overall Progress</span>
              <span style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--ink)" }}>{progressPercent}%</span>
            </div>
            <div style={{ height: "6px", borderRadius: "3px", background: "var(--line)", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: "100%", borderRadius: "3px", background: "linear-gradient(90deg, var(--blue), var(--green))" }}
              />
            </div>
          </div>

          {/* Daily Quest */}
          <div style={{ padding: "24px", borderRadius: "10px", border: "1px solid var(--line)", background: "var(--paper)", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Daily Quest</span>
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--green)" }}>{completedCount}/{dailyTasks.length}</span>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--ink)", marginBottom: "20px" }}>Today&apos;s Challenges</h3>

            <div style={{ display: "grid", gap: "8px" }}>
              {dailyTasks.map((task) => {
                const current = getTaskProgress(task);
                const isDone = current >= task.target;
                const pct = Math.min(100, Math.round((current / task.target) * 100));
                return (
                  <Link
                    href={`/${level.toLowerCase()}${task.href}`}
                    key={task.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "var(--ink)",
                      background: isDone ? "var(--success-soft)" : "var(--panel)",
                      border: "1px solid",
                      borderColor: isDone ? "rgba(19,128,95,0.25)" : "var(--line)",
                      transition: "border-color 0.15s"
                    }}
                  >
                    <div style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      border: "2px solid",
                      borderColor: isDone ? "var(--green)" : "var(--muted)",
                      background: isDone ? "var(--green)" : "transparent",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0
                    }}>
                      {isDone && <Check size={12} color="white" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: isDone ? "700" : "600" }}>{task.title}</div>
                      {!isDone && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                          <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: "var(--line)", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "var(--blue)", borderRadius: "2px", transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: "0.7rem", fontWeight: "600", color: "var(--muted)" }}>{current}/{task.target}</span>
                        </div>
                      )}
                    </div>
                    {!isDone && <ArrowUpRight size={14} color="var(--muted)" />}
                  </Link>
                );
              })}
            </div>

            {allDone && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: "16px" }}>
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
                    border: "none",
                    background: "var(--green)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  {progress.dailyBadgeClaimed ? <Download size={16} /> : <Trophy size={16} />}
                  {downloading ? "Generating..." : progress.dailyBadgeClaimed ? "Download Badge Again" : "Claim Badge"}
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column - Study Rooms + Hero Image */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Hero Image */}
          <div style={{ borderRadius: "10px", overflow: "hidden", position: "relative", aspectRatio: "16/9", border: "1px solid var(--line)" }}>
            <Image
              src={theme === "dark" ? "/study-scene-dark.png" : "/study-scene.png"}
              alt="Study scene"
              fill
              priority
              style={{ objectFit: "cover" }}
            />
            <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px", padding: "14px 18px", borderRadius: "8px", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(12px)" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)" }}>Recommended</span>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "white", marginTop: "2px" }}>{data.mission}</div>
            </div>
          </div>

          {/* Study Rooms */}
          <div style={{ padding: "24px", borderRadius: "10px", border: "1px solid var(--line)", background: "var(--paper)", flex: 1 }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Study Rooms</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "16px" }}>
              {[
                { href: `/${level.toLowerCase()}/flashcards`, title: "Flashcards", color: "#e88ba1" },
                { href: `/${level.toLowerCase()}/grammar`, title: "Grammar", color: "#7c6fef" },
                { href: `/${level.toLowerCase()}/reading`, title: "Reading", color: "#4dabf7" },
                { href: `/${level.toLowerCase()}/writing`, title: "Writing", color: "#f76707" },
                { href: `/${level.toLowerCase()}/quiz`, title: "Quiz", color: "#1ba37a" },
                { href: `/${level.toLowerCase()}/arena`, title: "Arena", color: "#d63384" }
              ].map((room) => (
                <Link
                  key={room.href}
                  href={room.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "16px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "var(--ink)",
                    border: "1px solid var(--line)",
                    background: "var(--panel)",
                    transition: "border-color 0.15s"
                  }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: room.color }} />
                  <span style={{ fontSize: "0.88rem", fontWeight: "700" }}>{room.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <QuestCompletePopup
        isOpen={showQuestComplete}
        onClose={() => setShowQuestComplete(false)}
        onDownload={handleDownloadBadge}
        downloading={downloading}
        level={level}
      />

      {user && <BlogDailyPopup />}
    </>
  );
}
