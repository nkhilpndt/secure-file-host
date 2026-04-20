const BASE = (import.meta.env.VITE_API_URL as string | undefined) || "/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(email: string, password: string): Promise<{ token: string; email: string }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function login(email: string, password: string): Promise<{ token: string; email: string }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function uploadFile(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ fileId: string; accessCode: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/upload`);
    const token = getToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status === 201) resolve(data);
      else reject(new Error(data.error || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

export async function deleteFile(fileId: string): Promise<void> {
  const res = await fetch(`${BASE}/file/${fileId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Delete failed");
  }
}

export interface MyFile {
  fileId: string;
  originalName: string;
  mimeType: string;
  accessCode: string;
  createdAt: string;
}

export async function getMyFiles(): Promise<MyFile[]> {
  const res = await fetch(`${BASE}/my-files`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to load files");
  return res.json();
}

export function getDownloadUrl(fileId: string, code: string): string {
  return `${BASE}/file/${fileId}?code=${code}`;
}
