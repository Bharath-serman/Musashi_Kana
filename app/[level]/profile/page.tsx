"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { 
  updateProfile, 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from "firebase/auth";
import { useAuth } from "../../components/auth-provider";
import { AppFrame, PageHeader } from "../../components/app-frame";
import { useLearning } from "../../components/learning-state";
import { supabase } from "../../lib/supabase";
import { auth } from "../../lib/firebase";
import { Sun, Moon, Camera, Save, LogOut, Trash2, User as UserIcon, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendDeletionOtp, verifyDeletionOtp } from "../../lib/delete-actions";

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
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteStep, setDeleteStep] = useState<"credentials" | "otp" | "reauthenticate">("credentials");
  const [deleteOtpCode, setDeleteOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [isReauthorizing, setIsReauthorizing] = useState(false);
  
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (deleteEmail !== user.email) {
      setDeleteError("Email does not match your account.");
      return;
    }

    setIsSendingOtp(true);
    setDeleteError("");

    try {
      // Call server action to send OTP via Resend
      await sendDeletionOtp(user.email);
      setDeleteStep("otp");
    } catch (error: any) {
      setDeleteError(error.message || "Failed to initiate deletion. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndExclude = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      // 1. Verify OTP server-side
      await verifyDeletionOtp(user.email, deleteOtpCode);

      // 2. Delete user in Firebase
      await deleteUser(user);
      
      localStorage.clear();
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        setDeleteStep("reauthenticate");
        setDeleteError("");
      } else {
        setDeleteError(error.message || "Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReauthenticateAndDelete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !user.email) return;

    setIsReauthorizing(true);
    setDeleteError("");

    try {
      const providerId = user.providerData[0]?.providerId;

      if (providerId === "password") {
        if (!reauthPassword) {
          setDeleteError("Please enter your password.");
          setIsReauthorizing(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, reauthPassword);
        await reauthenticateWithCredential(user, credential);
      } else if (providerId === "google.com") {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else if (providerId === "github.com") {
        const provider = new GithubAuthProvider();
        await reauthenticateWithPopup(user, provider);
      }

      // Try deleting again after successful reauthentication
      await deleteUser(user);
      
      localStorage.clear();
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setDeleteError("Incorrect password. Please try again.");
      } else {
        setDeleteError(error.message || "Identity verification failed. Please try again.");
      }
    } finally {
      setIsReauthorizing(false);
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

      <div style={{ display: "grid", gap: "30px", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", alignItems: "start" }}>
        
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
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                background: message.type === "error" ? "var(--red-soft)" : "var(--success-soft)",
                color: message.type === "error" ? "var(--red)" : "var(--green)"
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

            <button
              onClick={async () => {
                await auth.signOut();
                router.push("/");
              }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--line)",
                background: "var(--paper)", color: "var(--muted)", fontWeight: "bold", cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--error-soft)"; e.currentTarget.style.borderColor = "var(--error)"; e.currentTarget.style.color = "var(--error)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--muted)"; }}
            >
              <LogOut size={18} /> Sign out
            </button>

            <button
              onClick={() => {
                setDeleteEmail(user?.email || "");
                setDeletePassword("");
                setDeleteError("");
                setDeleteStep("credentials");
                setDeleteOtpCode("");
                setReauthPassword("");
                setShowDeleteModal(true);
              }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--line)",
                background: "var(--paper)", color: "var(--muted)", fontWeight: "bold", cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--error-soft)"; e.currentTarget.style.borderColor = "var(--error)"; e.currentTarget.style.color = "var(--error)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--muted)"; }}
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </form>
        </motion.article>

        {typeof window !== "undefined" && createPortal(
          <AnimatePresence>
            {showDeleteModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(8px)",
                  padding: "20px"
                }}
                onClick={() => setShowDeleteModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "var(--card-glass-bg)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "20px",
                    border: "1px solid var(--card-glass-border)",
                    padding: "32px",
                    maxWidth: "440px",
                    width: "100%",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "var(--error-soft)",
                      display: "grid",
                      placeItems: "center"
                    }}>
                      <AlertTriangle size={24} style={{ color: "var(--error)" }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--ink)", margin: 0 }}>Delete Account</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>This action cannot be undone</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      style={{
                        marginLeft: "auto",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted)",
                        padding: "4px"
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "20px", lineHeight: "1.5" }}>
                    Are you sure you want to delete your account? All your progress, settings, and data will be permanently removed.
                  </p>

                  <form 
                    onSubmit={
                      deleteStep === "credentials" 
                        ? handleSendOtp 
                        : deleteStep === "otp" 
                        ? handleVerifyAndExclude 
                        : handleReauthenticateAndDelete
                    } 
                    style={{ display: "grid", gap: "16px" }}
                  >
                    {deleteStep === "credentials" ? (
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "var(--muted)" }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={deleteEmail}
                          readOnly
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--line)",
                            background: "var(--panel)",
                            color: "var(--muted)",
                            outline: "none",
                            fontSize: "1rem",
                            cursor: "not-allowed"
                          }}
                        />
                      </div>
                    ) : deleteStep === "otp" ? (
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "var(--muted)" }}>
                          Verification Code
                        </label>
                        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                          We sent a 6-digit verification code to <strong>{user?.email}</strong>. Please enter it below.
                        </p>
                        <input
                          type="text"
                          maxLength={6}
                          value={deleteOtpCode}
                          onChange={(e) => setDeleteOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          required
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--line)",
                            background: "var(--paper)",
                            color: "var(--ink)",
                            outline: "none",
                            fontSize: "1.5rem",
                            textAlign: "center",
                            letterSpacing: "8px",
                            fontWeight: "bold"
                          }}
                        />
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "8px", color: "var(--muted)" }}>
                          Confirm Identity
                        </label>
                        {user?.providerData[0]?.providerId === "password" ? (
                          <>
                            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                              For security, please enter your password to complete account deletion.
                            </p>
                            <input
                              type="password"
                              value={reauthPassword}
                              onChange={(e) => setReauthPassword(e.target.value)}
                              placeholder="Enter your password"
                              required
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
                          </>
                        ) : (
                          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                            For security, please verify your login via {user?.providerData[0]?.providerId === "google.com" ? "Google" : "GitHub"} to complete account deletion.
                          </p>
                        )}
                      </div>
                    )}

                    {deleteError && (
                      <div style={{
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        background: "var(--red-soft)",
                        color: "var(--red)",
                        textAlign: "center"
                      }}>
                        {deleteError}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (deleteStep === "otp") {
                            setDeleteStep("credentials");
                            setDeleteOtpCode("");
                            setDeleteError("");
                          } else if (deleteStep === "reauthenticate") {
                            setDeleteStep("otp");
                            setReauthPassword("");
                            setDeleteError("");
                          } else {
                            setShowDeleteModal(false);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid var(--line)",
                          background: "var(--paper)",
                          color: "var(--ink)",
                          fontWeight: "bold",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {deleteStep === "credentials" ? "Cancel" : "Back"}
                      </button>
                      
                      {deleteStep === "reauthenticate" && user?.providerData[0]?.providerId !== "password" ? (
                        <button
                          type="button"
                          onClick={() => handleReauthenticateAndDelete()}
                          disabled={isReauthorizing}
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--line)",
                            background: "var(--red)",
                            color: "white",
                            fontWeight: "bold",
                            cursor: isReauthorizing ? "not-allowed" : "pointer",
                            opacity: isReauthorizing ? 0.6 : 1,
                            transition: "all 0.2s"
                          }}
                        >
                          {isReauthorizing ? "Verifying..." : `Verify with ${user?.providerData[0]?.providerId === "google.com" ? "Google" : "GitHub"}`}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={
                            deleteStep === "credentials"
                              ? (isSendingOtp || deleteEmail !== user?.email)
                              : deleteStep === "otp"
                              ? (isDeleting || deleteOtpCode.length !== 6)
                              : (isReauthorizing || !reauthPassword)
                          }
                          style={{
                            flex: 1,
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid var(--line)",
                            background: deleteStep === "credentials" ? "var(--blue)" : "var(--red)",
                            color: "white",
                            fontWeight: "bold",
                            cursor: (
                              deleteStep === "credentials"
                                ? (isSendingOtp || deleteEmail !== user?.email)
                                : deleteStep === "otp"
                                ? (isDeleting || deleteOtpCode.length !== 6)
                                : (isReauthorizing || !reauthPassword)
                            ) ? "not-allowed" : "pointer",
                            opacity: (
                              deleteStep === "credentials"
                                ? (isSendingOtp || deleteEmail !== user?.email)
                                : deleteStep === "otp"
                                ? (isDeleting || deleteOtpCode.length !== 6)
                                : (isReauthorizing || !reauthPassword)
                            ) ? 0.6 : 1,
                            transition: "all 0.2s"
                          }}
                        >
                          {deleteStep === "credentials"
                            ? (isSendingOtp ? "Sending..." : "Send Code")
                            : deleteStep === "otp"
                            ? (isDeleting ? "Deleting..." : "Yes, Delete")
                            : (isReauthorizing ? "Deleting..." : "Confirm & Delete")}
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

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
