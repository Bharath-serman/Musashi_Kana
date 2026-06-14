"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { AppFrame } from "../../../components/app-frame";
import { fetchBlogPost, type BlogPost } from "../../../lib/blog-actions";

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/);
  return match ? match[1] : null;
}

export default function BlogDetailPage({ params }: { params: Promise<{ level: string; slug: string }> }) {
  return (
    <AppFrame>
      <BlogDetailContent params={params} />
    </AppFrame>
  );
}

function BlogDetailContent({ params }: { params: Promise<{ level: string; slug: string }> }) {
  const { level, slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchBlogPost(slug);
      setPost(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ height: "20px", width: "120px", borderRadius: "4px", background: "var(--line)", marginBottom: "24px" }} />
        <div style={{ height: "40px", width: "80%", borderRadius: "6px", background: "var(--line)", marginBottom: "16px" }} />
        <div style={{ height: "16px", width: "60%", borderRadius: "4px", background: "var(--line)", marginBottom: "32px" }} />
        <div style={{ display: "grid", gap: "10px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: "14px", width: "100%", borderRadius: "4px", background: "var(--line)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--ink)", marginBottom: "12px" }}>
          Post not found
        </h2>
        <Link href={`/${level.toLowerCase()}/blog`} style={{ color: "var(--blue)", fontWeight: "600", textDecoration: "none" }}>
          Back to Blog
        </Link>
      </div>
    );
  }

  const youtubeId = post.url ? extractYouTubeId(post.url) : null;

  return (
    <>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Back link */}
        <Link
          href={`/${level.toLowerCase()}/blog`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.82rem",
            fontWeight: "600",
            color: "var(--muted)",
            textDecoration: "none",
            marginBottom: "28px",
          }}
        >
          <ArrowLeft size={14} />
          Back to Blog
        </Link>

        {/* Category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: categoryColors[post.category] || "var(--muted)" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: categoryColors[post.category] || "var(--muted)" }}>
            {categoryLabels[post.category] || post.category}
          </span>
          {post.important && (
            <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#f7a4b7" }}>Featured</span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: "900", lineHeight: "1.15", color: "var(--ink)", marginBottom: "14px", letterSpacing: "-0.01em" }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", color: "var(--muted)", fontSize: "0.82rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Clock size={13} />
            {formatDate(post.created_at)}
          </div>
        </div>

        {/* YouTube Embed */}
        {youtubeId && (
          <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", marginBottom: "32px", borderRadius: "12px", overflow: "hidden" }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={post.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Image (non-YouTube) */}
        {!youtubeId && post.image_url && (
          <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden", marginBottom: "32px" }}>
            <img
              src={post.image_url}
              alt={post.title}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        )}

        {/* External link */}
        {post.url && !youtubeId && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              borderRadius: "8px",
              background: "var(--ink)",
              color: "var(--paper)",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "0.88rem",
              marginBottom: "32px",
            }}
          >
            <ExternalLink size={16} />
            Visit Source
          </a>
        )}

        {/* Description */}
        <div style={{ fontSize: "1.05rem", lineHeight: "1.75", color: "var(--ink)" }}>
          {post.content || post.description}
        </div>

        {/* Bottom nav */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid var(--line)" }}>
          <Link
            href={`/${level.toLowerCase()}/blog`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.88rem",
              fontWeight: "600",
              color: "var(--blue)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} />
            Back to all posts
          </Link>
        </div>
      </div>
    </>
  );
}
