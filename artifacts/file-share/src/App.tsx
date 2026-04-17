import { useState } from "react";
import { isLoggedIn } from "@/lib/auth";
import AuthPage from "@/pages/AuthPage";
import UploadPage from "@/pages/UploadPage";
import DownloadPage from "@/pages/DownloadPage";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  return (
    <div className="min-h-screen bg-background">
      {loggedIn ? (
        <UploadPage onLogout={() => setLoggedIn(false)} />
      ) : (
        <div>
          <AuthPage onLogin={() => setLoggedIn(true)} />
          <div className="max-w-sm mx-auto px-4 pb-8" id="download">
            <DownloadPage />
          </div>
        </div>
      )}

      {/* Download section always visible when logged in too */}
      {loggedIn && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Download someone's file</h2>
            <DownloadPage />
          </div>
        </div>
      )}
    </div>
  );
}
