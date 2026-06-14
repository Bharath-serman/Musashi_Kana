"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Newspaper, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "../lib/blog-actions";
import { fetchImportantBlogPosts } from "../lib/blog-actions";

const POPUP_SHOWN_KEY = "musashi-kana-blog-popup-shown";

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function BlogDailyPopup() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkForImportantPost = useCallback(async () => {
    try {
      const todayKey = getTodayKey();
      const stored = localStorage.getItem(POPUP_SHOWN_KEY);
      if (stored === todayKey) return;

      const posts = await fetchImportantBlogPosts();
      if (posts.length > 0) {
        setPost(posts[0]);
      }
    } catch (err) {
      console.error("Failed to check for important blog posts:", err);
    }
  }, []);

  useEffect(() => {
    checkForImportantPost();
  }, [checkForImportantPost]);

  const handleDismiss = () => {
    const todayKey = getTodayKey();
    localStorage.setItem(POPUP_SHOWN_KEY, todayKey);
    setDismissed(true);
    setPost(null);
  };

  const handleView = () => {
    const todayKey = getTodayKey();
    localStorage.setItem(POPUP_SHOWN_KEY, todayKey);
  };

  if (!post || dismissed || !mounted) return null;

  const categoryColors: Record<string, string> = {
    blog: "#4dabf7",
    youtube: "#e05d72",
    magazine: "#f7a4b7",
    podcast: "#1ba37a",
  };

  const categoryLabels: Record<string, string> = {
    blog: "Blog Post",
    youtube: "YouTube Video",
    magazine: "Magazine",
    podcast: "Podcast",
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleDismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          display: "grid",
          placeItems: "center",
          zIndex: 9999,
          padding: "20px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: "16px",
            maxWidth: "520px",
            width: "100%",
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            position: "relative",
          }}
        >
          {post.image_url && (
            <div style={{ position: "relative", width: "100%", height: "200px", overflow: "hidden" }}>
              <img
                src={post.image_url}
                alt={post.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }} />
            </div>
          )}

          <div style={{ padding: "28px 32px 24px" }}>
            {!post.image_url && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <AlertCircle size={20} style={{ color: "var(--blue)" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--blue)" }}>
                  Featured Content
                </span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: categoryColors[post.category] || "var(--blue)", display: "grid", placeItems: "center" }}>
                <Newspaper size={14} color="white" />
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: categoryColors[post.category] || "var(--muted)" }}>
                {categoryLabels[post.category] || post.category}
              </span>
            </div>

            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--ink)", marginBottom: "10px", lineHeight: "1.3" }}>
              {post.title}
            </h2>
            <p style={{ fontSize: "0.92rem", color: "var(--muted)", lineHeight: "1.6", marginBottom: "24px" }}>
              {post.description}
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleView}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    background: "var(--ink)",
                    color: "var(--paper)",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "0.88rem",
                  }}
                >
                  View Now
                </a>
              )}
              <button
                onClick={handleDismiss}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  background: "transparent",
                  color: "var(--muted)",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>


        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
