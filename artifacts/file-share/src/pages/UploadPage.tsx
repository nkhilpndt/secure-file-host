import { useState, useRef, useCallback, useEffect } from "react";
import { uploadFile, deleteFile, getMyFiles, type MyFile } from "@/lib/api";
import { getEmail, clearAuth } from "@/lib/auth";

interface UploadResult {
  fileId: string;
  accessCode: string;
  fileName: string;
}

interface UploadPageProps {
  onLogout: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
const ALLOWED_LABEL = "JPEG, PNG, WebP, GIF, PDF — max 20 MB";

export default function UploadPage({ onLogout }: UploadPageProps) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"id" | "code" | "both" | null>(null);
  const [myFiles, setMyFiles] = useState<MyFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"upload" | "myfiles">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const email = getEmail();

  const loadMyFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const files = await getMyFiles();
      setMyFiles(files);
    } catch {
      // Ignore
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    loadMyFiles();
  }, [loadMyFiles]);

  async function handleFile(file: File) {
    setError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`File type not allowed. Please use: ${ALLOWED_LABEL}`);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File is too large. Maximum size is 20 MB.");
      return;
    }
    setUploading(true);
    setProgress(0);
    setResult(null);
    try {
      const { fileId, accessCode } = await uploadFile(file, setProgress);
      setResult({ fileId, accessCode, fileName: file.name });
      await loadMyFiles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleCopy(text: string, type: "id" | "code" | "both") {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleDelete(fileId: string) {
    setDeletingId(fileId);
    try {
      await deleteFile(fileId);
      if (result?.fileId === fileId) setResult(null);
      await loadMyFiles();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function handleLogout() {
    clearAuth();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">SecureShare</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{email}</span>
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tab navigation */}
        <div className="flex rounded-lg bg-muted p-1 mb-6">
          <button
            onClick={() => setView("upload")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${view === "upload" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Upload file
          </button>
          <button
            onClick={() => setView("myfiles")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${view === "myfiles" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            My files {myFiles.length > 0 && `(${myFiles.length})`}
          </button>
        </div>

        {view === "upload" && (
          <div className="space-y-5">
            {/* Drop zone */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-primary bg-accent" : "border-border hover:border-primary/50 hover:bg-accent/40"} ${uploading ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {dragging ? "Drop it here" : "Drop file here or tap to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{ALLOWED_LABEL}</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium text-foreground">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Success result card */}
            {result && (
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">File uploaded!</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{result.fileName}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3">Share these codes to let someone download the file:</p>

                <div className="space-y-3">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">File ID</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xl text-foreground tracking-wider">{result.fileId}</span>
                      <button
                        onClick={() => handleCopy(result.fileId, "id")}
                        className="text-xs bg-card border border-border rounded-md px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        {copied === "id" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Access Code</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-3xl text-foreground tracking-[0.25em]">{result.accessCode}</span>
                      <button
                        onClick={() => handleCopy(result.accessCode, "code")}
                        className="text-xs bg-card border border-border rounded-md px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        {copied === "code" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleCopy(`File ID: ${result.fileId}\nAccess Code: ${result.accessCode}`, "both")}
                    className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    {copied === "both" ? "Copied!" : "Copy both"}
                  </button>
                  <button
                    onClick={() => handleDelete(result.fileId)}
                    disabled={deletingId === result.fileId}
                    className="py-2 px-4 text-sm text-destructive border border-destructive/30 rounded-lg font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    {deletingId === result.fileId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "myfiles" && (
          <div>
            {loadingFiles ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Loading files...</div>
            ) : myFiles.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myFiles.map(file => (
                  <div key={file.fileId} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">{file.originalName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(file.createdAt).toLocaleString()}
                        </p>
                        <div className="flex gap-3 mt-2">
                          <div>
                            <span className="text-xs text-muted-foreground">ID: </span>
                            <span className="font-mono text-sm font-semibold text-foreground">{file.fileId}</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Code: </span>
                            <span className="font-mono text-sm font-semibold text-foreground tracking-widest">{file.accessCode}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(file.fileId)}
                        disabled={deletingId === file.fileId}
                        className="shrink-0 text-xs text-destructive border border-destructive/30 rounded-lg px-3 py-1.5 hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        {deletingId === file.fileId ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
