// ── Auth Store — API-backed ───────────────────────────────────────────────────
// CRITICAL FIX: useSyncExternalStore getSnapshot MUST return a cached/stable
// reference, otherwise React detects a "new object" every render → infinite loop.
// Solution: store the current user in a module-level variable and only update it
// when login/logout/register is called.

import { useSyncExternalStore } from "react";
import {
  apiLogin,
  apiRegister,
  saveSession,
  clearSession,
  getStoredUser,
  getToken,
  type ApiUser,
} from "@/services/api";

export type UserRole = "admin" | "user";
export type AuthUser = ApiUser;

// ── Module-level cache ─────────────────────────────────────────────────────────
// This is the single source of truth for the current user.
// It is initialized once from localStorage and only mutated by login/logout.
let _cachedUser: AuthUser | null = (() => {
  try { return getStoredUser(); }
  catch { return null; }
})();

// ── Listeners ─────────────────────────────────────────────────────────────────
const listeners = new Set<() => void>();
const notifyAuth = () => listeners.forEach((l) => l());

// Listen for auto-logout triggered by 401 responses
if (typeof window !== "undefined") {
  window.addEventListener("snapbooth:logout", () => {
    _cachedUser = null;
    notifyAuth();
  });
}

export const authStore = {
  // ── Read current user — returns the SAME cached reference ─────────────────
  getUser(): AuthUser | null {
    return _cachedUser;
  },

  // ── Login via API ──────────────────────────────────────────────────────────
  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    try {
      const res = await apiLogin(email, password);
      if (!res.success || !res.token || !res.user) {
        return {
          success: false,
          error: res.message || "Email atau password salah.",
        };
      }
      saveSession(res.token, res.user);
      _cachedUser = res.user; // update cache BEFORE notifying
      notifyAuth();
      return { success: true, user: res.user };
    } catch {
      return {
        success: false,
        error: "Server tidak terhubung. Pastikan backend API sedang berjalan.",
      };
    }
  },

  // ── Register via API ───────────────────────────────────────────────────────
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    try {
      const res = await apiRegister(name, email, password);
      if (!res.success || !res.token || !res.user) {
        return {
          success: false,
          error: res.message || "Registrasi gagal.",
        };
      }
      saveSession(res.token, res.user);
      _cachedUser = res.user; // update cache BEFORE notifying
      notifyAuth();
      return { success: true, user: res.user };
    } catch {
      return {
        success: false,
        error: "Server tidak terhubung. Pastikan backend API sedang berjalan.",
      };
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout() {
    clearSession();
    _cachedUser = null; // update cache BEFORE notifying
    notifyAuth();
  },

  // ── Validate token on app load ─────────────────────────────────────────────
  async validateSession(): Promise<void> {
    const token = getToken();
    if (!token) {
      _cachedUser = null;
      notifyAuth();
      return;
    }
    // If we have a stored user, keep it (optimistic). Background validate:
    const storedUser = getStoredUser();
    if (storedUser) {
      _cachedUser = storedUser;
      notifyAuth();
    }
    // Optionally validate with /api/auth/me — skip for now to avoid extra calls
  },

  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

// ── React hooks ───────────────────────────────────────────────────────────────
export function useAuth(): AuthUser | null {
  return useSyncExternalStore(
    // subscribe — stable reference
    (cb) => authStore.subscribe(cb),
    // getSnapshot — MUST return same reference if unchanged
    () => _cachedUser,
    // getServerSnapshot — for SSR
    () => null,
  );
}

export function useIsAdmin(): boolean {
  const user = useAuth();
  return user?.role === "admin";
}
