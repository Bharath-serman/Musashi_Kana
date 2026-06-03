"use client";

import { useState, useRef } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "../../components/auth-provider";
import { AppFrame, PageHeader } from "../../components/app-frame";
import { useLearning } from "../../components/learning-state";
import { supabase } from "../../lib/supabase";
import { Sun, Moon, Camera, Save, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  return (
    <AppFrame>
      <ProfileDashboard />
    </AppFrame>
  );
}

function ProfileDashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useLearning();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create a temporary local URL for preview
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      let finalPhotoURL = photoURL;

      // If a new file was selected from the system, upload it to Supabase Storage
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.uid}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        finalPhotoURL = data.publicUrl;
      }

      await updateProfile(user, {
        displayName: displayName,
        photoURL: finalPhotoURL
      });
      
      // Update local state to reflect the permanent URL
      setPhotoURL(finalPhotoURL);
      setSelectedFile(null); // Clear selected file after successful upload
      
      setMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const presetAvatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Nala"
  ];

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Your Profile"
        text="Manage your account details and personalize your experience."
      />

      <div style={{ display: "grid", gap: "30px", gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
        
        {/* Profile Settings Card */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--card-glass-bg)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
            <div 
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--line)",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                border: "2px solid var(--blue)",
                flexShrink: 0,
                cursor: "pointer"
              }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload a new photo"
            >
              {photoURL ? (
                <img src={photoURL} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <UserIcon size={40} color="var(--muted)" />
              )}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex", justifyContent: "center", padding: "2px"
              }}>
                <Camera size={14} color="white" />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--ink)", margin: 0 }}>
                {user?.displayName || "Learner"}
              </h2>
              <p style={{ color: "var(--muted)", margin: "4px 0 0 0" }}>{user?.email}</p>
            </div>
            
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "var(--muted)" }}>
                Display Name
              </label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--line)",
                  background: "var(--paper)",
                  color: "var(--ink)",
                  outline: "none",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "var(--muted)" }}>
                Or pick a preset avatar
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                {presetAvatars.map((avatar) => (
                  <button 
                    type="button" 
                    key={avatar}
                    onClick={() => {
                      setPhotoURL(avatar);
                      setSelectedFile(null); // Clear any system-selected file
                    }}
                    style={{
                      width: "48px", height: "48px", borderRadius: "50%", border: "1px solid var(--line)",
                      background: "var(--paper)", cursor: "pointer", padding: "4px",
                      boxShadow: photoURL === avatar ? "0 0 0 2px var(--blue)" : "none",
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
                  >
                    <img src={avatar} alt="Preset" style={{ width: "100%", height: "100%" }} />
                  </button>
                ))}
              </div>
            </div>

            {message.text && (
              <div style={{
                padding: "12px", borderRadius: "8px", fontSize: "0.9rem",
                background: message.type === "error" ? "var(--error-soft)" : "var(--success-soft)",
                color: message.type === "error" ? "var(--error)" : "var(--green)"
              }}>
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSaving}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", padding: "14px", borderRadius: "8px", border: "none",
                background: "var(--blue)", color: "white", fontWeight: "bold", cursor: "pointer",
                transition: "opacity 0.2s"
              }}
            >
              <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </motion.article>

        {/* Preferences Card */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "var(--card-glass-bg)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "30px",
            border: "1px solid var(--card-glass-border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", margin: 0, color: "var(--ink)" }}>Preferences</h3>
            <p style={{ color: "var(--muted)", margin: "4px 0 0 0", fontSize: "0.9rem" }}>Customize how Musashi_Kana looks and feels.</p>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid var(--line)",
            background: "var(--paper)"
          }}>
            <div>
              <strong style={{ display: "block", color: "var(--ink)", marginBottom: "4px" }}>Theme Selection</strong>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Toggle between light and dark modes.</span>
            </div>
            
            <div style={{ display: "flex", gap: "8px", background: "var(--tabs-bg)", padding: "4px", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <button 
                onClick={() => setTheme("light")}
                type="button"
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "6px",
                  border: "none", cursor: "pointer", fontWeight: "bold",
                  background: theme === "light" ? "var(--paper)" : "transparent",
                  color: theme === "light" ? "var(--ink)" : "var(--muted)",
                  boxShadow: theme === "light" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <Sun size={16} /> Light
              </button>
              <button 
                onClick={() => setTheme("dark")}
                type="button"
                style={{
                  display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "6px",
                  border: "none", cursor: "pointer", fontWeight: "bold",
                  background: theme === "dark" ? "var(--paper)" : "transparent",
                  color: theme === "dark" ? "var(--ink)" : "var(--muted)",
                  boxShadow: theme === "dark" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </div>
        </motion.article>

      </div>
    </>
  );
}
