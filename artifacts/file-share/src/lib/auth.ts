export function saveAuth(token: string, email: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("userEmail", email);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
}

export function getEmail(): string | null {
  return localStorage.getItem("userEmail");
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}
