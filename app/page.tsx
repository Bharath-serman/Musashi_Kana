"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Brain, Check, Flame, GraduationCap, RefreshCcw, Sparkles } from "lucide-react";
import { AppFrame, Metric } from "./components/app-frame";
import { defaultProgress, useLearning } from "./components/learning-state";

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
      <section className="hero">
        <div className="hero-copy">
          <div className="pill"><Sparkles size={16} /> {data.theme} track</div>
          <h1>{data.headline}</h1>
          <p>{data.description}</p>
          <div className="hero-actions">
            <Link className="primary-action" href="/flashcards">Start flashcards</Link>
            <Link className="secondary-action" href="/roadmap">View roadmap</Link>
          </div>
        </div>
        <div className="hero-visual">
          <Image src="/study-scene.png" alt="Japanese study desk with flashcards and notebook" width={1200} height={800} priority />
          <div className="mission-card">
            <span>Smart session</span>
            <strong>{data.mission}</strong>
          </div>
        </div>
      </section>

      <section className="metrics" aria-label="Learning overview">
        <Metric icon={<GraduationCap />} label="Target words" value={data.stats.words.toLocaleString()} />
        <Metric icon={<BookOpen />} label="Kanji scope" value={data.stats.kanji.toString()} />
        <Metric icon={<Brain />} label="Grammar points" value={data.stats.grammar.toString()} />
        <Metric icon={<Flame />} label="Saved streak" value={`${progress.streak} day`} />
      </section>

      <section className="dashboard-grid">
        <article className="panel progress-panel">
          <div className="section-heading">
            <div>
              <span>Progress</span>
              <h2>Study cockpit</h2>
            </div>
            <button className="icon-button" onClick={() => setProgress(defaultProgress)} title="Reset progress" type="button">
              <RefreshCcw size={18} />
            </button>
          </div>
          <div className="progress-ring" style={{ "--progress": `${progressPercent}%` } as React.CSSProperties}>
            <strong>{progressPercent}%</strong>
            <span>session momentum</span>
          </div>
          <div className="task-list">
            {taskList.map((task) => (
              <button className={progress.completedTasks.includes(task) ? "done" : ""} key={task} onClick={() => toggleTask(task)} type="button">
                <Check size={16} />
                {task}
              </button>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <div>
              <span>Quick launch</span>
              <h2>{level} study rooms</h2>
            </div>
          </div>
          <div className="route-grid">
            <Link href="/flashcards">Flashcards<span>Vocabulary and kanji recall</span></Link>
            <Link href="/grammar">Grammar<span>Patterns, examples, and notes</span></Link>
            <Link href="/reading">Reading<span>Passage, translation, questions</span></Link>
            <Link href="/writing">Writing<span>Guided kana and kanji canvas</span></Link>
            <Link href="/quiz">Quiz<span>Checkpoint questions</span></Link>
            <Link href="/roadmap">Roadmap<span>Study sequence and resources</span></Link>
          </div>
        </article>
      </section>
    </>
  );
}
