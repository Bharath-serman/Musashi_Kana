"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../components/auth-provider";
import { LogOut } from "lucide-react";
import { auth } from "../lib/firebase";

export default function LevelSelectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
      <button 
        onClick={() => auth.signOut()}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          background: "white",
          color: "#666",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}
      >
        <LogOut size={16} /> Sign out
      </button>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: "60px" }}
      >
        <h1 style={{ fontSize: "3rem", fontWeight: "900", color: "#1a1a1a", marginBottom: "12px" }}>Choose your path</h1>
        <p style={{ fontSize: "1.2rem", color: "#666" }}>Which JLPT level are you targeting today?</p>
      </motion.div>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "center", padding: "0 20px" }}>
        {/* N5 Path */}
        <motion.button
          onClick={() => router.push("/n5")}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            width: "300px",
            height: "400px",
            borderRadius: "24px",
            border: "none",
            background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
            boxShadow: "20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "transform 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-10px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: "#4dabf7" }} />
          <h2 style={{ fontSize: "5rem", fontWeight: "900", color: "#4dabf7", margin: 0 }}>N5</h2>
          <h3 style={{ fontSize: "1.5rem", color: "#333", margin: "10px 0" }}>Beginner</h3>
          <p style={{ color: "#888", textAlign: "center", padding: "0 30px" }}>Master the fundamentals: basic kanji, essential grammar, and everyday vocabulary.</p>
        </motion.button>

        {/* N4 Path */}
        <motion.button
          onClick={() => router.push("/n4")}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            width: "300px",
            height: "400px",
            borderRadius: "24px",
            border: "none",
            background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
            boxShadow: "20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "transform 0.3s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-10px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: "#ff6b6b" }} />
          <h2 style={{ fontSize: "5rem", fontWeight: "900", color: "#ff6b6b", margin: 0 }}>N4</h2>
          <h3 style={{ fontSize: "1.5rem", color: "#333", margin: "10px 0" }}>Elementary</h3>
          <p style={{ color: "#888", textAlign: "center", padding: "0 30px" }}>Expand your horizons: complex sentences, more kanji, and natural conversations.</p>
        </motion.button>
      </div>
    </div>
  );
}
