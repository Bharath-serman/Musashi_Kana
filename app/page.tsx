"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Brain, Check, Flame, GraduationCap, RefreshCcw, Sparkles } from "lucide-react";
import { AppFrame, Metric } from "./components/app-frame";
import { defaultProgress, useLearning } from "./components/learning-state";
import { motion } from "framer-motion";

const taskList = [
  "Review 12 flashcards",
  "Read one passage",
  "Write 8 symbols",
  "Complete mini quiz"
];

export default function DashboardPage() {
  return (
    <AppFrame>
      <Dashboard />
    </AppFrame>
  );
}

function Dashboard() {
  const { data, level, progress, progressPercent, setProgress } = useLearning();

  function toggleTask(task: string) {
    setProgress((current) => ({
      ...current,
      completedTasks: current.completedTasks.includes(task)
        ? current.completedTasks.filter((item) => item !== task)
        : [...current.completedTasks, task]
    }));
  }

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
              href="/flashcards"
              style={{
                background: "var(--ink)",
                color: "white",
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
              href="/roadmap"
              style={{
                background: "rgba(255,255,255,0.8)",
                color: "var(--ink)",
                padding: "14px 28px",
                borderRadius: "8px",
                fontWeight: "bold",
                textDecoration: "none",
                border: "1px solid rgba(0,0,0,0.1)",
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
            boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(10px)",
            padding: "10px"
          }}>
            <Image 
              src="/study-scene.png" 
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
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              maxWidth: "280px",
              border: "1px solid rgba(255,255,255,0.5)"
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
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid rgba(255,255,255,0.5)"
          }}
        >
          <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Progress</span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "900" }}>Study cockpit</h2>
            </div>
            <button 
              className="icon-button" 
              onClick={() => setProgress(defaultProgress)} 
              title="Reset progress" 
              type="button"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)"
              }}
            >
              <RefreshCcw size={18} />
            </button>
          </div>
          
          <div style={{ display: "grid", placeItems: "center", marginBottom: "20px" }}>
            <div className="progress-ring" style={{ 
              width: "120px", 
              height: "120px", 
              borderRadius: "50%", 
              border: "10px solid #eee", 
              display: "grid", 
              placeItems: "center"
            }}>
              <strong style={{ fontSize: "1.5rem" }}>{progressPercent}%</strong>
            </div>
          </div>
          
          <div className="task-list" style={{ display: "grid", gap: "10px" }}>
            {taskList.map((task) => {
              const isDone = progress.completedTasks.includes(task);
              return (
                <button 
                  className={isDone ? "done" : ""} 
                  key={task} 
                  onClick={() => toggleTask(task)} 
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,0.05)",
                    background: isDone ? "rgba(19, 128, 95, 0.1)" : "white",
                    color: isDone ? "var(--green)" : "var(--ink)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: isDone ? "bold" : "normal"
                  }}
                >
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    border: "2px solid",
                    borderColor: isDone ? "var(--green)" : "var(--muted)",
                    display: "grid",
                    placeItems: "center"
                  }}>
                    {isDone && <Check size={12} />}
                  </div>
                  {task}
                </button>
              );
            })}
          </div>
        </motion.article>

        <motion.article 
          className="panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid rgba(255,255,255,0.5)"
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
              { href: "/flashcards", title: "Flashcards", desc: "Vocabulary and kanji recall" },
              { href: "/grammar", title: "Grammar", desc: "Patterns, examples, and notes" },
              { href: "/reading", title: "Reading", desc: "Passage, translation, questions" },
              { href: "/writing", title: "Writing", desc: "Guided kana and kanji canvas" },
              { href: "/quiz", title: "Quiz", desc: "Checkpoint questions" },
              { href: "/roadmap", title: "Roadmap", desc: "Study sequence and resources" }
            ].map((route) => (
              <Link 
                key={route.href}
                href={route.href}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "var(--ink)",
                  border: "1px solid rgba(0,0,0,0.05)",
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
    </>
  );
}
