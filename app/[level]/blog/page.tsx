"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { Newspaper, Play, BookOpen, Headphones, Clock, ArrowUpRight, ExternalLink } from "lucide-react";
import { AppFrame } from "../../components/app-frame";
import { fetchBlogPosts, type BlogPost } from "../../lib/blog-actions";

const CATEGORIES = [
  { id: "all", label: "All", icon: Newspaper },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "youtube", label: "YouTube", icon: Play },
  { id: "magazine", label: "Magazine", icon: Newspaper },
  { id: "podcast", label: "Podcast", icon: Headphones },
];

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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogPage({ params }: { params: Promise<{ level: string }> }) {
  return (
    <AppFrame>
      <BlogContent params={params} />
    </AppFrame>
  );
}

function BlogContent({ params }: { params: Promise<{ level: string }> }) {
  const { level } = use(params);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchBlogPosts(level.toUpperCase());
      setPosts(data);
      setLoading(false);
    }
    load();
  }, [level]);

  const filteredPosts = activeCategory === "all"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <>
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--blue)" }}>
                Extra Resources
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>|</span>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: "900", lineHeight: "1.05", color: "var(--ink)", letterSpacing: "-0.02em" }}>
              Blog & Resources
            </h1>
            <p style={{ fontSize: "1rem", color: "var(--muted)", marginTop: "10px", maxWidth: "420px", lineHeight: "1.5" }}>
              Videos, podcasts, articles, and curated content to complement your Japanese learning journey.
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "32px", padding: "4px", borderRadius: "10px", background: "var(--panel)", border: "1px solid var(--line)", width: "fit-content" }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "7px",
                border: "none",
                background: isActive ? "var(--ink)" : "transparent",
                color: isActive ? "var(--paper)" : "var(--muted)",
                fontWeight: "600",
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--line)", background: "var(--paper)", opacity: 0.5 }}>
              <div style={{ height: "16px", width: "80px", borderRadius: "4px", background: "var(--line)", marginBottom: "12px" }} />
              <div style={{ height: "20px", width: "70%", borderRadius: "4px", background: "var(--line)", marginBottom: "10px" }} />
              <div style={{ height: "14px", width: "100%", borderRadius: "4px", background: "var(--line)", marginBottom: "8px" }} />
              <div style={{ height: "14px", width: "60%", borderRadius: "4px", background: "var(--line)" }} />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <Newspaper size={40} style={{ color: "var(--muted)", marginBottom: "16px" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--ink)", marginBottom: "8px" }}>
            No posts yet
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            Check back later for new content.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} level={level} />
          ))}
        </div>
      )}
    </>
  );
}

function BlogCard({ post, level }: { post: BlogPost; level: string }) {
  const isExternal = !!post.url;

  const cardContent = (
    <>
      {post.image_url && (
        <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden", borderRadius: "10px 10px 0 0" }}>
          <img
            src={post.image_url}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {post.important && (
            <div style={{ position: "absolute", top: "10px", left: "10px", padding: "4px 10px", borderRadius: "6px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", fontSize: "0.7rem", fontWeight: "700", color: "#f7a4b7", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Featured
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: categoryColors[post.category] || "var(--muted)" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: categoryColors[post.category] || "var(--muted)" }}>
            {categoryLabels[post.category] || post.category}
          </span>
          {!post.image_url && post.important && (
            <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "#f7a4b7", marginLeft: "auto" }}>
              Featured
            </span>
          )}
        </div>

        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--ink)", marginBottom: "8px", lineHeight: "1.3" }}>
          {post.title}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: "1.55", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {post.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--muted)", fontSize: "0.78rem" }}>
            <Clock size={12} />
            {formatDate(post.created_at)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--blue)", fontSize: "0.8rem", fontWeight: "600" }}>
            {isExternal ? <ExternalLink size={12} /> : <ArrowUpRight size={12} />}
            {isExternal ? "Visit" : "Read"}
          </div>
        </div>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={post.url!}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          borderRadius: "12px",
          border: "1px solid var(--line)",
          background: "var(--paper)",
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
          transition: "border-color 0.15s, transform 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "none"; }}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link
      href={`/${level.toLowerCase()}/blog/${post.id}`}
      style={{
        display: "block",
        borderRadius: "12px",
        border: "1px solid var(--line)",
        background: "var(--paper)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "none"; }}
    >
      {cardContent}
    </Link>
  );
}
