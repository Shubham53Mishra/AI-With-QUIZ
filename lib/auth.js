// lib/auth.js

export async function getCurrentUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.user) return data.user;
    return null;
  } catch {
    return null;
  }
}
