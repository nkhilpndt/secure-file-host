import { useState } from "react";
import { getDownloadUrl } from "@/lib/api";

export default function DownloadPage() {
  const [fileId, setFileId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDownload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!fileId.trim() || !code.trim()) {
      setError("Please enter both File ID and Access Code");
      return;
    }
    setLoading(true);
    try {
      const url = getDownloadUrl(fileId.trim(), code.trim());
      const res = await fetch(url);
      if (res.status === 403) {
        setError("Invalid access code. Please check and try again.");
        return;
      }
      if (res.status === 404) {
        setError("File not found. Please check the File ID.");
        return;
      }
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");
      let filename = fileId;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) filename = match[1].replace(/['"]/g, "");
      }
      const contentType = res.headers.get("content-type") || "";
      if (!filename.includes(".")) {
        if (contentType.includes("pdf")) filename += ".pdf";
        else if (contentType.includes("jpeg")) filename += ".jpg";
        else if (contentType.includes("png")) filename += ".png";
        else if (contentType.includes("gif")) filename += ".gif";
        else if (contentType.includes("webp")) filename += ".webp";
      }
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-foreground mb-1">Download a file</h2>
      <p className="text-sm text-muted-foreground mb-5">Enter the File ID and Access Code you received</p>

      <form onSubmit={handleDownload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">File ID</label>
          <input
            type="text"
            value={fileId}
            onChange={e => setFileId(e.target.value)}
            placeholder="e.g. aB3dEf7gHi"
            maxLength={10}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Access Code</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            maxLength={6}
            inputMode="numeric"
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-2xl tracking-[0.3em] transition-shadow"
          />
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download file
            </>
          )}
        </button>
      </form>
    </div>
  );
}
