"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { BookOpen, Brain, ChevronLeft, ClipboardList, GraduationCap, Languages, Layers, Map, Menu, PenLine, Target } from "lucide-react";
import { Level } from "../data";
import { LearningProvider, useLearning } from "./learning-state";
import CinematicBackground from "./cinematic-background";
import { motion, AnimatePresence } from "framer-motion";

//Pages
const navItems = [
  { href: "/", label: "Dashboard", icon: Target },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/grammar", label: "Grammar", icon: BookOpen },
  { href: "/reading", label: "Reading", icon: Languages },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/arena", label: "Arena", icon: Target },
  { href: "/quiz", label: "Quiz", icon: Brain },
  { href: "/reference", label: "Charts", icon: ClipboardList }
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  // Load persistence on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsSidebarCollapsed(saved === "true");
    }
  }, []);

  // Save persistence on change
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

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
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <CinematicBackground />

        <main
          className={`app-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
          onClickCapture={handleNavigation}
          style={{
            display: "grid",
            gridTemplateColumns: isSidebarCollapsed ? "80px minmax(0, 1fr)" : "280px minmax(0, 1fr)",
            minHeight: "100vh",
            transition: "grid-template-columns 0.3s ease"
          }}
        >
          {isNavigating && <NavigationLoader />}

          <Sidebar collapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

          <section
            className="content"
            style={{
              padding: "40px clamp(20px, 5vw, 60px)",
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(5px)",
              minHeight: "100vh"
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </section>
        </main>
      </div>
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

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { level, setLevel } = useLearning();

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
      aria-label="Study navigation"
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "10px 0 30px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "24px",
        transition: "width 0.3s ease, padding 0.3s ease",
        zIndex: 100
      }}
    >
      <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link className="brand" href="/" style={{ textDecoration: "none", color: "var(--ink)" }}>
          <div className="brand-mark" style={{
            width: "40px",
            height: "40px",
            background: "var(--ink)",
            color: "white",
            display: "grid",
            placeItems: "center",
            borderRadius: "8px",
            fontWeight: "bold"
          }}>学</div>
          {!collapsed && (
            <div style={{ marginLeft: "12px" }}>
              <strong style={{ display: "block", fontSize: "1.1rem" }}>Musashi_Kana</strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>JLPT Studio</span>
            </div>
          )}
        </Link>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid rgba(0,0,0,0.1)"
          }}
        >
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav style={{ display: "grid", gap: "8px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              className={`${active ? "active" : ""} ${collapsed ? "collapsed-link" : ""}`}
              href={item.href}
              key={item.href}
              title={collapsed ? item.label : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                borderRadius: "8px",
                textDecoration: "none",
                color: active ? "white" : "var(--ink)",
                background: active ? "var(--ink)" : "transparent",
                transition: "background 0.2s, color 0.2s",
                fontWeight: active ? "700" : "500"
              }}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <>
          <div className="level-card" style={{ marginTop: "auto", padding: "16px", background: "rgba(0,0,0,0.03)", borderRadius: "8px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.05em" }}>Active level</span>
            <div className="level-switch" style={{ display: "grid", gridAutoFlow: "column", gap: "4px", marginTop: "8px" }}>
              {(["N5", "N4"] as Level[]).map((item) => (
                <button
                  className={level === item ? "active" : ""}
                  key={item}
                  onClick={() => setLevel(item)}
                  type="button"
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    background: level === item ? "white" : "transparent",
                    fontWeight: "bold",
                    color: level === item ? "var(--blue)" : "var(--ink)",
                    boxShadow: level === item ? "0 2px 10px rgba(0,0,0,0.05)" : "none"
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-note" style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.8rem", color: "var(--muted)", marginTop: "12px" }}>
            <GraduationCap size={16} />
            <span>Progress saved locally.</span>
          </div>
        </>
      )}

      {collapsed && (
        <div className="sidebar-collapsed-level" title={`Current Level: ${level}`} style={{
          marginTop: "auto",
          textAlign: "center",
          fontWeight: "bold",
          color: "var(--muted)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "50%",
          width: "32px",
          height: "32px",
          display: "grid",
          placeItems: "center",
          margin: "auto auto 20px"
        }}>
          {level}
        </div>
      )}
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
    <section className="page-header" style={{
      marginBottom: "40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      background: "transparent",
      border: "none",
      padding: 0,
      boxShadow: "none"
    }}>
      <div>
        <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--blue)", fontWeight: "900" }}>{eyebrow}</span>
        <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", lineHeight: "1", marginTop: "8px", color: "var(--ink)" }}>{title}</h1>
        <p style={{ color: "var(--muted)", marginTop: "12px", fontSize: "1.1rem" }}>{text}</p>
      </div>
      {action}
    </section>
  );
}

export function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article style={{
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      borderRadius: "12px",
      padding: "20px",
      display: "grid",
      gap: "8px"
    }}>
      <div style={{ color: "var(--blue)" }}>{icon}</div>
      <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{label}</span>
      <strong style={{ fontSize: "1.8rem", fontWeight: "900" }}>{value}</strong>
    </article>
  );
}
