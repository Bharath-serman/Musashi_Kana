"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { 
  Plus, Edit2, Trash2, LogOut, Search, Save, X, 
  AlertCircle, CheckCircle, RefreshCw, Layers, 
  BookOpen, FileText, HelpCircle as QuizIcon, Newspaper
} from "lucide-react";
import { 
  loginAdmin, logoutAdmin, checkAdminAuth, 
  fetchSectionData, saveRecord, saveReadingPassage, deleteRecord,
  fetchBlogPostsForAdmin, saveBlogPost, deleteBlogPost
} from "./actions";
import DarkSelect from "./dark-select";

type Level = "N5" | "N4";
type Section = "flashcards" | "grammar_lessons" | "quiz_questions" | "reading_passages" | "blog_posts";
type RecordType = any;

export default function AdminPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [serviceKeyConfigured, setServiceKeyConfigured] = useState(true);
  
  // Login credentials form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<Section>("flashcards");
  const [activeLevel, setActiveLevel] = useState<Level>("N5");
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<RecordType[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  
  // Editor modal state
  const [showEditor, setShowEditor] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordType | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sub-items for Reading Passages questions
  const [passageQuestions, setPassageQuestions] = useState<{ question: string; answer: string }[]>([]);

  // Deletion modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<RecordType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch records when section or level changes
  useEffect(() => {
    async function loadRecords() {
      setLoadingRecords(true);
      try {
        if (activeTab === "blog_posts") {
          const data = await fetchBlogPostsForAdmin();
          const filtered = (data as RecordType[]).filter((r) => r.level === activeLevel || r.level === "All");
          setRecords(filtered);
        } else {
          const data = await fetchSectionData(activeTab);
          // Filter client-side by level
          const filtered = (data as RecordType[]).filter((r) => r.level === activeLevel);
          setRecords(filtered);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An error occurred";
        showToast("error", `Failed to load records: ${msg}`);
      } finally {
        setLoadingRecords(false);
      }
    }

    if (authenticated) {
      loadRecords();
    }
  }, [authenticated, activeTab, activeLevel]);

  // Check auth status on load
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await checkAdminAuth();
        setAuthenticated(res.authenticated);
        if (res.authenticated && res.username) {
          setUsername(res.username);
        }
        setServiceKeyConfigured(res.serviceKeyConfigured);
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  // Toast timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await loginAdmin(loginUsername, loginPassword);
      if (res.success) {
        const authStatus = await checkAdminAuth();
        setAuthenticated(true);
        if (authStatus.username) {
          setUsername(authStatus.username);
        }
        setServiceKeyConfigured(authStatus.serviceKeyConfigured);
        showToast("success", "Logged in successfully.");
      } else {
        setLoginError(res.error || "Login failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setLoginError(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setAuthenticated(false);
      setUsername("");
      showToast("success", "Logged out successfully.");
    } catch {
      showToast("error", "Logout failed.");
    }
  };

  // Open editor for creating a new record
  const handleAddNew = () => {
    setIsNew(true);
    setEditorError(null);
    
    let defaultRecord: RecordType;

    if (activeTab === "blog_posts") {
      defaultRecord = {
        level: activeLevel,
        category: "blog",
        title: "",
        description: "",
        content: "",
        url: "",
        image_url: "",
        important: false
      };
    } else if (activeTab === "flashcards") {
      defaultRecord = {
        level: activeLevel,
        type: "vocab",
        front: "",
        reading: "",
        meaning: "",
        example: "",
        note: ""
      };
    } else if (activeTab === "quiz_questions") {
      defaultRecord = {
        level: activeLevel,
        prompt: "",
        choice_1: "",
        choice_2: "",
        choice_3: "",
        choice_4: "",
        answer: ""
      };
    } else if (activeTab === "grammar_lessons") {
      defaultRecord = {
        level: activeLevel,
        pattern: "",
        topic: "",
        title: "",
        brief: "",
        notes: [""],
        examples: [{ jp: "", en: "" }],
        chart: {
          headers: ["Part", "Role", "Example"],
          rows: [["", "", ""]]
        }
      };
    } else {
      defaultRecord = {
        level: activeLevel,
        title: "",
        japanese: "",
        translation: ""
      };
      setPassageQuestions([]);
    }

    setSelectedRecord(defaultRecord);
    setShowEditor(true);
  };

  // Open editor for modifying existing record
  const handleEdit = (record: RecordType) => {
    setIsNew(false);
    setEditorError(null);
    
    // Deep clone to avoid mutating local state before saving
    const cloned = JSON.parse(JSON.stringify(record)) as RecordType;
    setSelectedRecord(cloned);

    if (activeTab === "reading_passages") {
      const passage = cloned;
      // Extract child questions
      const questions = passage.reading_questions ? (passage.reading_questions as any[]).map((q: any) => ({
        question: q.question,
        answer: q.answer
      })) : [];
      setPassageQuestions(questions);
    }

    setShowEditor(true);
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setEditorError(null);
    setIsSaving(true);

    try {
      if (activeTab === "blog_posts") {
        await saveBlogPost(selectedRecord as Record<string, unknown>);
      } else if (activeTab === "reading_passages") {
        // Validation: Passage questions must not have empty fields
        const invalidQuestions = passageQuestions.some(q => !q.question.trim() || !q.answer.trim());
        if (invalidQuestions) {
          throw new Error("All comprehension questions must have a question and an answer.");
        }

        await saveReadingPassage(selectedRecord as Record<string, unknown>, passageQuestions);
      } else {
        // Grammar structure verification
        if (activeTab === "grammar_lessons") {
          const grammar = selectedRecord;
          // Clean up empty notes or examples
          grammar.notes = (grammar.notes as any[]).filter((n) => n.trim() !== "");
          grammar.examples = (grammar.examples as any[]).filter((ex) => ex.jp.trim() !== "" || ex.en.trim() !== "");
        }

        await saveRecord(
          activeTab as "flashcards" | "grammar_lessons" | "quiz_questions",
          selectedRecord as Record<string, unknown>
        );
      }

      showToast("success", `${activeTab === "blog_posts" ? "blog post" : activeTab.replace("_", " ")} saved successfully.`);
      setShowEditor(false);
      setSelectedRecord(null);
      
      // Re-trigger loadRecords manually by refreshing list
      setLoadingRecords(true);
      if (activeTab === "blog_posts") {
        const data = await fetchBlogPostsForAdmin();
        const filtered = (data as RecordType[]).filter((r) => r.level === activeLevel || r.level === "All");
        setRecords(filtered);
      } else {
        const data = await fetchSectionData(activeTab);
        const filtered = (data as RecordType[]).filter((r) => r.level === activeLevel);
        setRecords(filtered);
      }
      setLoadingRecords(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save record.";
      setEditorError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete flow
  const confirmDelete = (record: RecordType) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete || !recordToDelete.id) return;
    setIsDeleting(true);
    try {
      if (activeTab === "blog_posts") {
        await deleteBlogPost(recordToDelete.id);
      } else {
        await deleteRecord(activeTab, recordToDelete.id);
      }
      showToast("success", "Record deleted successfully.");
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      
      // Re-trigger loadRecords manually
      setLoadingRecords(true);
      if (activeTab === "blog_posts") {
        const data = await fetchBlogPostsForAdmin();
        const filtered = (data as RecordType[]).filter((r) => r.level === activeLevel || r.level === "All");
        setRecords(filtered);
      } else {
        const data = await fetchSectionData(activeTab);
        const filtered = (data as RecordType[]).filter((r) => r.level === activeLevel);
        setRecords(filtered);
      }
      setLoadingRecords(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      showToast("error", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter records based on search query
  const filteredRecords = records.filter((rec) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (activeTab === "flashcards") {
      const flash = rec;
      return (
        flash.front?.toLowerCase().includes(query) ||
        flash.reading?.toLowerCase().includes(query) ||
        flash.meaning?.toLowerCase().includes(query) ||
        flash.type?.toLowerCase().includes(query)
      );
    } else if (activeTab === "quiz_questions") {
      const quiz = rec;
      return (
        quiz.prompt?.toLowerCase().includes(query) ||
        quiz.answer?.toLowerCase().includes(query)
      );
    } else if (activeTab === "grammar_lessons") {
      const grammar = rec;
      return (
        grammar.topic?.toLowerCase().includes(query) ||
        grammar.pattern?.toLowerCase().includes(query) ||
        grammar.title?.toLowerCase().includes(query)
      );
    } else if (activeTab === "reading_passages") {
      const reading = rec;
      return (
        reading.title?.toLowerCase().includes(query) ||
        reading.japanese?.toLowerCase().includes(query)
      );
    } else if (activeTab === "blog_posts") {
      const blog = rec;
      return (
        blog.title?.toLowerCase().includes(query) ||
        blog.description?.toLowerCase().includes(query) ||
        blog.category?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (authLoading) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw className="spinner-icon" size={32} />
        <p>Verifying Credentials...</p>
        <style>{`
          .admin-loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #11090d;
            color: #b09ba4;
            gap: 16px;
            font-family: Inter, sans-serif;
          }
          .spinner-icon {
            animation: spin 1s linear infinite;
            color: #f7a4b7;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated? Show login form.
  if (!authenticated) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-card">
          <div className="logo-section">
            <span className="brand-badge">管理</span>
            <h2>Admin Portal</h2>
            <p>Enter administrative credentials to manage course data</p>
          </div>

          {loginError && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <div className="form-group">
            <label>Admin Username</label>
            <input 
              type="text" 
              value={loginUsername} 
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="Username"
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" disabled={loginLoading} className="submit-btn">
            {loginLoading ? <RefreshCw className="spin" size={18} /> : "Log In"}
          </button>
        </form>

        <style>{`
          .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at center, #231219 0%, #0c0507 100%);
            padding: 20px;
            font-family: Inter, sans-serif;
          }
          .login-card {
            background: rgba(36, 26, 32, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 420px;
            backdrop-filter: blur(20px);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
            display: flex;
            flex-direction: column;
            gap: 24px;
            color: #f5f0f2;
          }
          .logo-section {
            text-align: center;
          }
          .brand-badge {
            background: linear-gradient(135deg, #e88ba1, #d84d63);
            color: white;
            font-weight: 900;
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 0.8rem;
            letter-spacing: 0.1em;
            display: inline-block;
            margin-bottom: 12px;
          }
          .logo-section h2 {
            font-size: 1.8rem;
            font-weight: 800;
            margin: 0 0 6px 0;
            color: #ffffff;
          }
          .logo-section p {
            font-size: 0.9rem;
            color: #b09ba4;
            margin: 0;
          }
          .error-alert {
            background: rgba(224, 93, 114, 0.15);
            border: 1px solid rgba(224, 93, 114, 0.3);
            border-radius: 12px;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #e05d72;
            font-size: 0.85rem;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .form-group label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #b09ba4;
          }
          .form-group input {
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 14px;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s ease;
          }
          .form-group input:focus {
            border-color: #e88ba1;
            box-shadow: 0 0 0 3px rgba(232, 139, 161, 0.15);
          }
          .form-group select {
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 14px;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s ease;
            appearance: none;
            color-scheme: dark;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23b09ba4' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6l3.5 3.5L11.5 6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 14px center;
            padding-right: 40px;
          }
          .form-group select:focus {
            border-color: #e88ba1;
            box-shadow: 0 0 0 3px rgba(232, 139, 161, 0.15);
          }
          .form-group textarea {
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 14px;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s ease;
            resize: vertical;
            font-family: inherit;
          }
          .form-group textarea:focus {
            border-color: #e88ba1;
            box-shadow: 0 0 0 3px rgba(232, 139, 161, 0.15);
          }
          .form-group input[type="checkbox"] {
            accent-color: #e88ba1;
          }
          .submit-btn {
            background: linear-gradient(135deg, #e88ba1 0%, #c96078 100%);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 16px;
            font-weight: 700;
            font-size: 1.05rem;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 8px 24px rgba(201, 96, 120, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(201, 96, 120, 0.4);
          }
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Dashboard UI (Authenticated)
  return (
    <div className="admin-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="admin-header">
        <div className="header-brand">
          <div className="avatar-square">学</div>
          <div>
            <h1>Dashboard</h1>
            <p>Signed in as <span className="highlight">{username}</span> • Manage N5/N4 database collections</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      {/* RLS / Service Key Setup Prompt */}
      {!serviceKeyConfigured && (
        <div className="setup-banner">
          <AlertCircle size={24} className="banner-icon" />
          <div className="banner-content">
            <h4>Supabase Service Role Key Missing</h4>
            <p>
              Row-Level Security (RLS) is active on your database tables. To create, edit, or delete items, 
              please add <code>SUPABASE_SERVICE_ROLE_KEY</code> to your <code>.env</code> file and restart your Next.js server.
            </p>
          </div>
        </div>
      )}

      <main className="admin-layout">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <div className="sidebar-group">
            <h3>Level Selection</h3>
            <div className="level-picker">
              <button 
                onClick={() => setActiveLevel("N5")} 
                className={activeLevel === "N5" ? "active" : ""}
              >
                N5 Level
              </button>
              <button 
                onClick={() => setActiveLevel("N4")} 
                className={activeLevel === "N4" ? "active" : ""}
              >
                N4 Level
              </button>
            </div>
          </div>

          <div className="sidebar-group">
            <h3>Database Tables</h3>
            <nav className="section-nav">
              <button 
                onClick={() => setActiveTab("flashcards")} 
                className={activeTab === "flashcards" ? "active" : ""}
              >
                <Layers size={18} />
                <span>Flashcards</span>
              </button>
              <button 
                onClick={() => setActiveTab("grammar_lessons")} 
                className={activeTab === "grammar_lessons" ? "active" : ""}
              >
                <BookOpen size={18} />
                <span>Grammar Lessons</span>
              </button>
              <button 
                onClick={() => setActiveTab("quiz_questions")} 
                className={activeTab === "quiz_questions" ? "active" : ""}
              >
                <QuizIcon size={18} />
                <span>Quiz Questions</span>
              </button>
              <button 
                onClick={() => setActiveTab("reading_passages")} 
                className={activeTab === "reading_passages" ? "active" : ""}
              >
                <FileText size={18} />
                <span>Reading Passages</span>
              </button>
              <button 
                onClick={() => setActiveTab("blog_posts")} 
                className={activeTab === "blog_posts" ? "active" : ""}
              >
                <Newspaper size={18} />
                <span>Blog Posts</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <section className="admin-content">
          <div className="content-actions">
            {/* Search */}
            <div className="search-wrap">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab.replace("_", " ")}...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Add Record */}
            <button onClick={handleAddNew} className="add-btn" disabled={!serviceKeyConfigured}>
              <Plus size={18} />
              <span>Add New Item</span>
            </button>
          </div>

          {/* Records List */}
          <div className="records-grid-container">
            {loadingRecords ? (
              <div className="loading-state">
                <RefreshCw className="spin" size={24} />
                <p>Loading database records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={36} />
                <p>No matching items found for Level {activeLevel}.</p>
                <button onClick={handleAddNew} className="add-btn" style={{ marginTop: "12px" }} disabled={!serviceKeyConfigured}>
                  Create the first one!
                </button>
              </div>
            ) : (
              <div className="records-list">
                {filteredRecords.map((record) => (
                  <article key={record.id} className="record-card">
                    <div className="card-details">
                      {activeTab === "flashcards" && (
                        <>
                          <div className="card-pill">{record.type}</div>
                          <h4>{record.front}</h4>
                          <p className="reading-text">{record.reading}</p>
                          <p className="meaning-text">{record.meaning}</p>
                        </>
                      )}

                      {activeTab === "quiz_questions" && (
                        <>
                          <div className="card-pill correct">Answer: {record.answer}</div>
                          <h4>{record.prompt}</h4>
                          <div className="quiz-options-preview">
                            <span>1. {record.choice_1}</span>
                            <span>2. {record.choice_2}</span>
                            <span>3. {record.choice_3}</span>
                            <span>4. {record.choice_4}</span>
                          </div>
                        </>
                      )}

                      {activeTab === "grammar_lessons" && (
                        <>
                          <div className="card-pill">{record.pattern}</div>
                          <h4>{record.topic}</h4>
                          <p className="meaning-text">{record.title}</p>
                          <p className="brief-preview">{record.brief}</p>
                        </>
                      )}

                      {activeTab === "reading_passages" && (
                        <>
                          <div className="card-pill">Questions: {record.reading_questions?.length || 0}</div>
                          <h4>{record.title}</h4>
                          <p className="japanese-preview" lang="ja">{record.japanese}</p>
                        </>
                      )}

                      {activeTab === "blog_posts" && (
                        <>
                          <div className="card-pill">{record.category}</div>
                          <h4>{record.title}</h4>
                          <p className="meaning-text">{record.description?.slice(0, 100)}{record.description?.length > 100 ? "..." : ""}</p>
                          {record.important && <div className="card-pill correct" style={{ marginTop: "4px" }}>Featured</div>}
                        </>
                      )}
                    </div>

                    <div className="card-actions">
                      <button onClick={() => handleEdit(record)} className="edit-icon-btn" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => confirmDelete(record)} className="delete-icon-btn" title="Delete" disabled={!serviceKeyConfigured}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Editor Side-Drawer / Overlay Modal */}
      {showEditor && selectedRecord && (
        <div className="editor-overlay">
          <form onSubmit={handleSave} className="editor-container">
            <div className="editor-header">
              <h2>{isNew ? `Add New ${activeTab.replace("_", " ").slice(0,-1)}` : "Edit Item Details"}</h2>
              <button type="button" onClick={() => setShowEditor(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            {editorError && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{editorError}</span>
              </div>
            )}

            <div className="editor-body">
              {/* Level Input (General) - hidden for blog_posts which has its own */}
              {activeTab !== "blog_posts" && (
              <div className="form-group-row">
                <div className="form-group flex-1">
                  <label>JLPT Level</label>
                  <DarkSelect
                    value={selectedRecord.level}
                    onChange={(val) => setSelectedRecord({ ...selectedRecord, level: val })}
                    options={[{ value: "N5", label: "N5" }, { value: "N4", label: "N4" }]}
                  />
                </div>

                {/* Type Input for Flashcards */}
                {activeTab === "flashcards" && (
                  <div className="form-group flex-1">
                    <label>Deck Type</label>
                    <DarkSelect
                      value={selectedRecord.type}
                      onChange={(val) => setSelectedRecord({ ...selectedRecord, type: val })}
                      options={[
                        { value: "vocab", label: "vocab" },
                        { value: "kanji", label: "kanji" },
                        { value: "numbers", label: "numbers" },
                        { value: "particles", label: "particles" }
                      ]}
                    />
                  </div>
                )}
              </div>
              )}

              {/* Flashcards Fields */}
              {activeTab === "flashcards" && (
                <>
                  <div className="form-group">
                    <label>Front Text (Japanese Word / Kanji)</label>
                    <input 
                      type="text" 
                      value={selectedRecord.front || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, front: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Reading (Hiragana / Romaji)</label>
                    <input 
                      type="text" 
                      value={selectedRecord.reading || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, reading: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Meaning (English translation)</label>
                    <input 
                      type="text" 
                      value={selectedRecord.meaning || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, meaning: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Example Sentence (Japanese)</label>
                    <input 
                      type="text" 
                      value={selectedRecord.example || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, example: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Note / Usage Tip</label>
                    <input 
                      type="text" 
                      value={selectedRecord.note || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, note: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Quiz Fields */}
              {activeTab === "quiz_questions" && (
                <>
                  <div className="form-group">
                    <label>Question Prompt</label>
                    <input 
                      type="text" 
                      value={selectedRecord.prompt || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, prompt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-row">
                    <div className="form-group flex-1">
                      <label>Choice 1</label>
                      <input 
                        type="text" 
                        value={selectedRecord.choice_1 || ""} 
                        onChange={(e) => setSelectedRecord({ ...selectedRecord, choice_1: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Choice 2</label>
                      <input 
                        type="text" 
                        value={selectedRecord.choice_2 || ""} 
                        onChange={(e) => setSelectedRecord({ ...selectedRecord, choice_2: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group-row">
                    <div className="form-group flex-1">
                      <label>Choice 3</label>
                      <input 
                        type="text" 
                        value={selectedRecord.choice_3 || ""} 
                        onChange={(e) => setSelectedRecord({ ...selectedRecord, choice_3: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Choice 4</label>
                      <input 
                        type="text" 
                        value={selectedRecord.choice_4 || ""} 
                        onChange={(e) => setSelectedRecord({ ...selectedRecord, choice_4: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Correct Answer</label>
                    <DarkSelect
                      value={selectedRecord.answer || ""}
                      onChange={(val) => setSelectedRecord({ ...selectedRecord, answer: val })}
                      options={[
                        { value: "", label: "Select the correct choice" },
                        ...(selectedRecord.choice_1 ? [{ value: selectedRecord.choice_1, label: `${selectedRecord.choice_1} (Choice 1)` }] : []),
                        ...(selectedRecord.choice_2 ? [{ value: selectedRecord.choice_2, label: `${selectedRecord.choice_2} (Choice 2)` }] : []),
                        ...(selectedRecord.choice_3 ? [{ value: selectedRecord.choice_3, label: `${selectedRecord.choice_3} (Choice 3)` }] : []),
                        ...(selectedRecord.choice_4 ? [{ value: selectedRecord.choice_4, label: `${selectedRecord.choice_4} (Choice 4)` }] : [])
                      ]}
                    />
                  </div>
                </>
              )}

              {/* Grammar Fields */}
              {activeTab === "grammar_lessons" && (
                <>
                  <div className="form-group">
                    <label>Grammar Pattern (e.g. A は B です)</label>
                    <input 
                      type="text" 
                      value={selectedRecord.pattern || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, pattern: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Topic Name (e.g. Topic particle は)</label>
                    <input 
                      type="text" 
                      value={selectedRecord.topic || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, topic: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Lesson Title (e.g. Topic statement)</label>
                    <input 
                      type="text" 
                      value={selectedRecord.title || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Brief Explanation</label>
                    <textarea 
                      value={selectedRecord.brief || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, brief: e.target.value })}
                      rows={2}
                      required
                    />
                  </div>

                  {/* Dynamic Notes List */}
                  <div className="editor-subsection">
                    <div className="subsection-header">
                      <h3>How it works (Notes)</h3>
                      <button 
                        type="button" 
                        onClick={() => setSelectedRecord({
                          ...selectedRecord, 
                          notes: [...(selectedRecord.notes || []), ""]
                        })}
                        className="add-sub-btn"
                      >
                        <Plus size={14} /> Add Note
                      </button>
                    </div>
                    <div className="sub-list">
                      {(selectedRecord.notes || []).map((note: string, idx: number) => (
                        <div key={idx} className="sub-row">
                          <input 
                            type="text" 
                            value={note} 
                            onChange={(e) => {
                              const newNotes = [...selectedRecord.notes];
                              newNotes[idx] = e.target.value;
                              setSelectedRecord({ ...selectedRecord, notes: newNotes });
                            }}
                            placeholder="Explanation sentence..."
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              const newNotes = selectedRecord.notes.filter((_: any, i: number) => i !== idx);
                              setSelectedRecord({ ...selectedRecord, notes: newNotes });
                            }}
                            className="remove-sub-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Examples List */}
                  <div className="editor-subsection">
                    <div className="subsection-header">
                      <h3>Examples</h3>
                      <button 
                        type="button" 
                        onClick={() => setSelectedRecord({
                          ...selectedRecord, 
                          examples: [...(selectedRecord.examples || []), { jp: "", en: "" }]
                        })}
                        className="add-sub-btn"
                      >
                        <Plus size={14} /> Add Example
                      </button>
                    </div>
                    <div className="sub-list">
                      {(selectedRecord.examples || []).map((ex: any, idx: number) => (
                        <div key={idx} className="sub-row-pair">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={ex.jp} 
                              onChange={(e) => {
                                const newExs = [...selectedRecord.examples];
                                newExs[idx].jp = e.target.value;
                                setSelectedRecord({ ...selectedRecord, examples: newExs });
                              }}
                              placeholder="Japanese sentence"
                            />
                          </div>
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={ex.en} 
                              onChange={(e) => {
                                const newExs = [...selectedRecord.examples];
                                newExs[idx].en = e.target.value;
                                setSelectedRecord({ ...selectedRecord, examples: newExs });
                              }}
                              placeholder="English meaning"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newExs = selectedRecord.examples.filter((_: any, i: number) => i !== idx);
                              setSelectedRecord({ ...selectedRecord, examples: newExs });
                            }}
                            className="remove-sub-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart Editor */}
                  <div className="editor-subsection">
                    <div className="subsection-header">
                      <h3>Quick Chart</h3>
                    </div>
                    <div className="form-group">
                      <label>Chart Headers (comma-separated)</label>
                      <input 
                        type="text" 
                        value={(selectedRecord.chart?.headers || []).join(", ")} 
                        onChange={(e) => {
                          const headers = e.target.value.split(",").map(h => h.trim());
                          setSelectedRecord({
                            ...selectedRecord,
                            chart: { ...selectedRecord.chart, headers }
                          });
                        }}
                        placeholder="e.g. Part, Role, Example"
                      />
                    </div>
                    
                    <div className="subsection-header" style={{ marginTop: "12px" }}>
                      <span>Chart Rows (comma-separated values matching headers)</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const currentRows = selectedRecord.chart?.rows || [];
                          const colCount = selectedRecord.chart?.headers?.length || 3;
                          const newRow = Array(colCount).fill("");
                          setSelectedRecord({
                            ...selectedRecord,
                            chart: {
                              ...selectedRecord.chart,
                              rows: [...currentRows, newRow]
                            }
                          });
                        }}
                        className="add-sub-btn"
                      >
                        <Plus size={14} /> Add Row
                      </button>
                    </div>

                    <div className="sub-list">
                      {(selectedRecord.chart?.rows || []).map((row: string[], idx: number) => (
                        <div key={idx} className="sub-row">
                          <input 
                            type="text" 
                            value={row.join(", ")} 
                            onChange={(e) => {
                              const vals = e.target.value.split(",").map(v => v.trim());
                              const newRows = [...selectedRecord.chart.rows];
                              newRows[idx] = vals;
                              setSelectedRecord({
                                ...selectedRecord,
                                chart: { ...selectedRecord.chart, rows: newRows }
                              });
                            }}
                            placeholder="e.g. A, topic, 私"
                          />
                          <button 
                            type="button" 
                            onClick={() => {
                              const newRows = selectedRecord.chart.rows.filter((_: any, i: number) => i !== idx);
                              setSelectedRecord({
                                ...selectedRecord,
                                chart: { ...selectedRecord.chart, rows: newRows }
                              });
                            }}
                            className="remove-sub-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Reading Passage Fields */}
              {activeTab === "reading_passages" && (
                <>
                  <div className="form-group">
                    <label>Passage Title</label>
                    <input 
                      type="text" 
                      value={selectedRecord.title || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Japanese Passage Text</label>
                    <textarea 
                      value={selectedRecord.japanese || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, japanese: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>English Translation</label>
                    <textarea 
                      value={selectedRecord.translation || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, translation: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>

                  {/* Reading Questions Section */}
                  <div className="editor-subsection">
                    <div className="subsection-header">
                      <h3>Reading Comprehension Questions</h3>
                      <button 
                        type="button" 
                        onClick={() => setPassageQuestions([...passageQuestions, { question: "", answer: "" }])}
                        className="add-sub-btn"
                      >
                        <Plus size={14} /> Add Question
                      </button>
                    </div>

                    <div className="sub-list">
                      {passageQuestions.map((q, idx) => (
                        <div key={idx} className="sub-row-pair" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "8px" }}>
                          <div className="flex-1" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "0.75rem", color: "#857078" }}>Question {idx + 1}</label>
                            <input 
                              type="text" 
                              value={q.question} 
                              onChange={(e) => {
                                const newQuestions = [...passageQuestions];
                                newQuestions[idx].question = e.target.value;
                                setPassageQuestions(newQuestions);
                              }}
                              placeholder="e.g. リリーさんは朝どこへ行きましたか。"
                              required
                            />
                          </div>
                          <div className="flex-1" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "0.75rem", color: "#857078" }}>Answer {idx + 1}</label>
                            <input 
                              type="text" 
                              value={q.answer} 
                              onChange={(e) => {
                                const newQuestions = [...passageQuestions];
                                newQuestions[idx].answer = e.target.value;
                                setPassageQuestions(newQuestions);
                              }}
                              placeholder="e.g. 近くの公園"
                              required
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              const newQuestions = passageQuestions.filter((_, i) => i !== idx);
                              setPassageQuestions(newQuestions);
                            }}
                            className="remove-sub-btn"
                            style={{ alignSelf: "flex-end" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Blog Posts Fields */}
              {activeTab === "blog_posts" && (
                <>
                  <div className="form-group-row">
                    <div className="form-group flex-1">
                      <label>Level</label>
                      <DarkSelect
                        value={selectedRecord.level}
                        onChange={(val) => setSelectedRecord({ ...selectedRecord, level: val })}
                        options={[
                          { value: "N5", label: "N5" },
                          { value: "N4", label: "N4" },
                          { value: "All", label: "All Levels" }
                        ]}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Category</label>
                      <DarkSelect
                        value={selectedRecord.category}
                        onChange={(val) => setSelectedRecord({ ...selectedRecord, category: val })}
                        options={[
                          { value: "blog", label: "Blog" },
                          { value: "youtube", label: "YouTube" },
                          { value: "magazine", label: "Magazine" },
                          { value: "podcast", label: "Podcast" }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      value={selectedRecord.title || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (short summary)</label>
                    <textarea 
                      value={selectedRecord.description || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Content (for hosted blog posts, leave empty for external links)</label>
                    <textarea 
                      value={selectedRecord.content || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, content: e.target.value })}
                      rows={8}
                    />
                  </div>
                  <div className="form-group">
                    <label>External URL (YouTube, podcast, magazine link)</label>
                    <input 
                      type="url" 
                      value={selectedRecord.url || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Thumbnail Image URL</label>
                    <input 
                      type="url" 
                      value={selectedRecord.image_url || ""} 
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        checked={selectedRecord.important || false}
                        onChange={(e) => setSelectedRecord({ ...selectedRecord, important: e.target.checked })}
                        style={{ width: "18px", height: "18px" }}
                      />
                      Show as important (popup on first visit of the day)
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="editor-footer">
              <button type="button" onClick={() => setShowEditor(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="save-btn">
                {isSaving ? <RefreshCw className="spin" size={16} /> : <Save size={16} />}
                <span>Save Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && recordToDelete && (
        <div className="editor-overlay">
          <div className="delete-modal">
            <AlertCircle size={42} className="warning-icon" />
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete this record? This action is permanent and cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleDelete} className="delete-btn" disabled={isDeleting}>
                {isDeleting ? <RefreshCw className="spin" size={16} /> : "Yes, Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-container {
          min-height: 100vh;
          background: #120b0e;
          color: #f5f0f2;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          color-scheme: dark;
        }

        /* Toast notification */
        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          padding: 16px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1000;
          animation: slideIn 0.3s ease forwards;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          font-weight: 600;
        }
        .toast-notification.success {
          background: #182b23;
          border: 1px solid #1ba37a;
          color: #a3f7d8;
        }
        .toast-notification.error {
          background: #381a1d;
          border: 1px solid #e05d72;
          color: #f7a4b7;
        }

        /* Header */
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(36, 26, 32, 0.5);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .avatar-square {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #e88ba1, #c96078);
          color: white;
          font-size: 1.35rem;
          font-weight: 900;
          display: grid;
          place-items: center;
          border-radius: 10px;
        }
        .header-brand h1 {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0;
          color: white;
        }
        .header-brand p {
          font-size: 0.85rem;
          color: #b09ba4;
          margin: 4px 0 0 0;
        }
        .highlight {
          color: #e88ba1;
          font-weight: 600;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #b09ba4;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(224, 93, 114, 0.1);
          border-color: rgba(224, 93, 114, 0.3);
          color: #e05d72;
          transform: none;
        }

        /* Setup Banner */
        .setup-banner {
          display: flex;
          gap: 16px;
          background: rgba(204, 161, 61, 0.1);
          border: 1px solid rgba(204, 161, 61, 0.25);
          border-radius: 12px;
          padding: 16px;
          margin: 20px 40px 0;
          color: #cca13d;
        }
        .banner-icon {
          flex-shrink: 0;
        }
        .banner-content h4 {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .banner-content p {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.4;
          color: #b09ba4;
        }
        .banner-content code {
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          color: #e88ba1;
          font-family: monospace;
        }

        /* Layout Grid */
        .admin-layout {
          flex: 1;
          display: grid;
          grid-template-columns: 280px 1fr;
          padding: 30px 40px;
          gap: 30px;
        }

        /* Sidebar Nav */
        .admin-sidebar {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .sidebar-group h3 {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #857078;
          margin: 0 0 12px 0;
        }
        .level-picker {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 4px;
        }
        .level-picker button {
          border: none;
          background: transparent;
          color: #b09ba4;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 8px 0;
          border-radius: 6px;
          cursor: pointer;
          min-height: auto;
          transition: all 0.2s;
        }
        .level-picker button.active {
          background: rgba(255,255,255,0.08);
          color: white;
        }
        .section-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .section-nav button {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          border: none;
          background: transparent;
          color: #b09ba4;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          min-height: auto;
          transition: all 0.2s;
          position: relative;
        }
        .section-nav button:hover {
          background: rgba(255,255,255,0.03);
          color: white;
          transform: translateX(2px);
        }
        .section-nav button.active {
          background: rgba(232, 139, 161, 0.1);
          color: #e88ba1;
        }
        .section-nav button.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 15%;
          height: 70%;
          width: 3px;
          background: #e88ba1;
          border-radius: 0 4px 4px 0;
        }
        .badge {
          margin-left: auto;
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(255,255,255,0.05);
          color: #857078;
          padding: 2px 8px;
          border-radius: 99px;
        }
        .section-nav button.active .badge {
          background: rgba(232, 139, 161, 0.2);
          color: #e88ba1;
        }

        /* Content Area */
        .admin-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .content-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .search-wrap {
          flex: 1;
          max-width: 400px;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          color: #857078;
        }
        .search-wrap input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 12px 16px 12px 42px;
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }
        .search-wrap input:focus {
          border-color: #e88ba1;
          background: rgba(0, 0, 0, 0.3);
        }
        .clear-search {
          position: absolute;
          right: 14px;
          background: transparent;
          border: none;
          color: #857078;
          cursor: pointer;
          min-height: auto;
          display: grid;
          place-items: center;
        }
        .clear-search:hover {
          color: white;
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e88ba1;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(232, 139, 161, 0.25);
        }
        .add-btn:hover {
          background: #c96078;
          box-shadow: 0 6px 18px rgba(201, 96, 120, 0.35);
          transform: translateY(-1px);
        }
        .add-btn:disabled {
          background: #47353b;
          color: #857078;
          box-shadow: none;
          cursor: not-allowed;
        }

        /* Records Grid */
        .records-grid-container {
          background: rgba(36, 26, 32, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          flex: 1;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .loading-state, .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: #857078;
          text-align: center;
          padding: 40px;
        }
        .loading-state p, .empty-state p {
          font-size: 1rem;
        }
        .records-list {
          display: flex;
          flex-direction: column;
          padding: 16px;
          gap: 12px;
          overflow-y: auto;
          max-height: calc(100vh - 280px);
        }
        .record-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          transition: all 0.2s;
        }
        .record-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }
        .card-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .card-pill {
          align-self: flex-start;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(255,255,255,0.06);
          color: #b09ba4;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .card-pill.correct {
          background: rgba(27, 163, 122, 0.15);
          color: #1ba37a;
        }
        .record-card h4 {
          margin: 4px 0 0 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: white;
        }
        .reading-text {
          font-size: 0.9rem;
          color: #e88ba1;
        }
        .meaning-text {
          font-size: 0.95rem;
          color: #b09ba4;
        }
        .brief-preview, .japanese-preview {
          font-size: 0.9rem;
          color: #857078;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .quiz-options-preview {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
          margin-top: 8px;
          font-size: 0.85rem;
          color: #857078;
        }
        .card-actions {
          display: flex;
          gap: 8px;
          margin-left: 16px;
        }
        .edit-icon-btn, .delete-icon-btn {
          min-height: auto;
          width: 36px;
          height: 36px;
          padding: 0;
          display: grid;
          place-items: center;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255,255,255,0.02);
          color: #b09ba4;
          cursor: pointer;
          transition: all 0.2s;
        }
        .edit-icon-btn:hover {
          color: white;
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
        }
        .delete-icon-btn:hover {
          color: #e05d72;
          background: rgba(224, 93, 114, 0.15);
          border-color: rgba(224, 93, 114, 0.3);
        }
        .delete-icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Overlay Editor */
        .editor-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.25s ease forwards;
        }
        .editor-container {
          background: #1c1418;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
        }
        .editor-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .editor-header h2 {
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0;
          color: white;
        }
        .close-btn {
          min-height: auto;
          background: transparent;
          border: none;
          color: #857078;
          cursor: pointer;
        }
        .close-btn:hover {
          color: white;
          transform: none;
        }
        .editor-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group-row {
          display: flex;
          gap: 16px;
        }
        .flex-1 {
          flex: 1;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #b09ba4;
        }
        .form-group input, .form-group select, .form-group textarea {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }
        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #e88ba1;
        }

        /* Subsection editor formatting */
        .editor-subsection {
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          background: rgba(0,0,0,0.15);
          padding: 16px;
          margin-top: 10px;
        }
        .subsection-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .subsection-header h3 {
          font-size: 0.95rem;
          margin: 0;
          color: white;
        }
        .subsection-header span {
          font-size: 0.85rem;
          color: #b09ba4;
        }
        .add-sub-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: auto;
          background: rgba(232, 139, 161, 0.1);
          color: #e88ba1;
          border: 1px solid rgba(232, 139, 161, 0.2);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .add-sub-btn:hover {
          background: rgba(232, 139, 161, 0.2);
        }
        .sub-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sub-row {
          display: flex;
          gap: 10px;
        }
        .sub-row input {
          flex: 1;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 10px;
          color: white;
          outline: none;
        }
        .sub-row input:focus {
          border-color: #e88ba1;
        }
        .sub-row-pair {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .sub-row-pair input {
          width: 100%;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 10px;
          color: white;
          outline: none;
        }
        .sub-row-pair input:focus {
          border-color: #e88ba1;
        }
        .remove-sub-btn {
          min-height: auto;
          width: 38px;
          height: 38px;
          padding: 0;
          display: grid;
          place-items: center;
          border: 1px solid rgba(224, 93, 114, 0.15);
          background: transparent;
          color: #e05d72;
          border-radius: 8px;
        }
        .remove-sub-btn:hover {
          background: rgba(224, 93, 114, 0.1);
        }

        .editor-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .cancel-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: #b09ba4;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
        }
        .cancel-btn:hover {
          color: white;
          background: rgba(255,255,255,0.02);
        }
        .save-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #e88ba1;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(232, 139, 161, 0.2);
        }
        .save-btn:hover {
          background: #c96078;
        }

        /* Delete Confirmation */
        .delete-modal {
          background: #1c1418;
          border: 1px solid rgba(224, 93, 114, 0.2);
          border-radius: 20px;
          padding: 30px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
          color: #f5f0f2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .warning-icon {
          color: #e05d72;
        }
        .delete-modal h2 {
          font-size: 1.4rem;
          margin: 0;
          color: white;
        }
        .delete-modal p {
          color: #b09ba4;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }
        .delete-modal-actions {
          display: flex;
          gap: 12px;
          width: 100%;
          margin-top: 8px;
        }
        .delete-modal-actions button {
          flex: 1;
        }
        .delete-btn {
          background: #e05d72;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .delete-btn:hover {
          background: #c94056;
          box-shadow: 0 4px 14px rgba(224, 93, 114, 0.3);
        }

        /* Animations */
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
