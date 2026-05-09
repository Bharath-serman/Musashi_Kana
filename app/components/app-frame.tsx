"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { BookOpen, Brain, GraduationCap, Languages, Layers, Map, PenLine, Target } from "lucide-react";
import { Level } from "../data";
import { LearningProvider, useLearning } from "./learning-state";

//Pages
const navItems = [
  { href: "/", label: "Dashboard", icon: Target },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/grammar", label: "Grammar", icon: BookOpen },
  { href: "/reading", label: "Reading", icon: Languages },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/quiz", label: "Quiz", icon: Brain }
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  function handleNavigation(event: MouseEvent<HTMLElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = event.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    const nextUrl = new URL(href, window.location.href);
    const currentUrl = new URL(window.location.href);

    if (nextUrl.origin === currentUrl.origin && nextUrl.pathname !== currentUrl.pathname) {
      setIsNavigating(true);
    }
  }

  return (
    <LearningProvider>
      <main className="app-shell" onClickCapture={handleNavigation}>
        {isNavigating && <NavigationLoader />}
        <Sidebar />
        <section className="content">{children}</section>
      </main>
    </LearningProvider>
  );
}

export function NavigationLoader() {
  return (
    <div className="navigation-loader" role="status" aria-live="polite" aria-label="Loading page">
      <div className="loader-bar" />
      <div className="loader-pill">
        <span className="loader-spinner" />
        Loading
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { level, setLevel } = useLearning();

  return (
    <aside className="sidebar" aria-label="Study navigation">
      <Link className="brand" href="/">
        <div className="brand-mark">学</div>
        <div>
          <strong>Musashi_Kana</strong>
          <span>JLPT Studio</span>
        </div>
      </Link>

      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link className={active ? "active" : ""} href={item.href} key={item.href}>
              <Icon size={18} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="level-card">
        <span>Active level</span>
        <div className="level-switch">
          {(["N5", "N4"] as Level[]).map((item) => (
            <button className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)} type="button">
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-note">
        <GraduationCap size={18} />
        <span>Progress is saved locally in this browser.</span>
      </div>
    </aside>
  );
}

export function PageHeader({
  eyebrow,
  title,
  text,
  action
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <section className="page-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </section>
  );
}

export function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article>
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
