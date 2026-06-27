"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, linkWithCredential, onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Github, Mail } from "lucide-react";
import CinematicBackground from "./components/cinematic-background";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/select");
      } else {
        setInitialLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const prev = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "dark");
    return () => {
      if (prev) {
        document.documentElement.setAttribute("data-theme", prev);
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/select");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/select");
    } catch (err: any) {
      if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email;
        const pendingCredential = GithubAuthProvider.credentialFromError(err);
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          const method = methods[0];
          if (method === "google.com") {
            const googleProvider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, googleProvider);
            if (pendingCredential) {
              await linkWithCredential(result.user, pendingCredential);
            }
          } else if (method === "password") {
            const pw = prompt(`This email is registered with email/password. Enter your password to link your GitHub account:`);
            if (pw) {
              const result = await signInWithEmailAndPassword(auth, email, pw);
              if (pendingCredential) {
                await linkWithCredential(result.user, pendingCredential);
              }
            } else {
              setError("Linking cancelled.");
              setLoading(false);
              return;
            }
          }
          router.push("/select");
        } catch (linkErr: any) {
          setError(linkErr.message);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/select");
    } catch (err: any) {
      setError("Invalid Credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return null;

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "var(--paper)", padding: "20px" }}>
      <CinematicBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "clamp(24px, 5vw, 40px)",
          background: "var(--card-glass-bg)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid var(--card-glass-border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative",
          zIndex: 10,
          color: "var(--ink)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8B 100%)",
              borderRadius: "16px",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 20px",
              fontSize: "2rem",
              fontWeight: "900",
              boxShadow: "0 10px 20px rgba(255, 107, 107, 0.3)",
              color: "white"
            }}
          >
            学
          </motion.div>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "8px", letterSpacing: "-0.02em", color: "var(--ink)" }}>
            Musashi_Kana
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
             JLPT N5 & N4 learning experience
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{
              background: "var(--red-soft)",
              border: "1px solid var(--red)",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              color: "var(--red)",
              fontSize: "0.85rem",
              textAlign: "center"
            }}
          >
            {error}
          </motion.div>
        )}

        <div style={{ display: "grid", gap: "12px", marginBottom: "30px" }}>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontWeight: "600",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleGithubSignIn}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid var(--line)",
              background: "var(--ink)",
              color: "var(--paper)",
              fontWeight: "600",
              cursor: "pointer",
              transition: "transform 0.2s, background 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "var(--blue-dark)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.background = "var(--ink)";
            }}
          >
            <Github size={20} />
            Continue with GitHub
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
          <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>or Email</span>
          <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: "grid", gap: "16px" }}>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--line)",
                background: "var(--paper)",
                color: "var(--ink)",
                fontSize: "1rem",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--blue)"}
              onBlur={(e) => e.target.style.borderColor = "var(--line)"}
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--line)",
                background: "var(--paper)",
                color: "var(--ink)",
                fontSize: "1rem",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--blue)"}
              onBlur={(e) => e.target.style.borderColor = "var(--line)"}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: "var(--blue)",
              color: "white",
              fontWeight: "700",
              fontSize: "1.05rem",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(232, 139, 161, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
          >
            {isLogin ? <><LogIn size={20} /> Sign In</> : <><UserPlus size={20} /> Sign Up</>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", color: "var(--muted)", fontSize: "0.9rem" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: "none",
              border: "none",
              color: "var(--blue)",
              fontWeight: "bold",
              cursor: "pointer",
              padding: 0,
              fontSize: "0.9rem"
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
