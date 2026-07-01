// ── Auth Store (localStorage based) ─────────────────────────────────────────

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const AUTH_KEY = "snapbooth.auth.v1";
const USERS_KEY = "snapbooth.users.v1";

const SEED_USERS: (AuthUser & { password: string })[] = [
  { id: "admin-001", name: "Admin SnapBooth", email: "admin@snapbooth.com", password: "admin123", role: "admin" },
  { id: "user-001",  name: "Demo User",       email: "user@snapbooth.com",  password: "user123",  role: "user"  },
];

function getUsersDb(): (AuthUser & { password: string })[] {
  if (typeof window === "undefined") return SEED_USERS;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) { localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS)); return SEED_USERS; }
    const parsed = JSON.parse(raw) as (AuthUser & { password: string })[];
    // ensure seed accounts always present
    const emails = new Set(parsed.map((u) => u.email.toLowerCase()));
    const merged = [...parsed];
    for (const s of SEED_USERS) {
      if (!emails.has(s.email.toLowerCase())) merged.push(s);
    }
    return merged;
  } catch { return SEED_USERS; }
}

function saveUsersDb(users: (AuthUser & { password: string })[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const listeners = new Set<() => void>();
const notifyAuth = () => listeners.forEach((l) => l());

export const authStore = {
  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  },

  login(email: string, password: string): { success: boolean; error?: string; user?: AuthUser } {
    const users = getUsersDb();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!match) return { success: false, error: "Email atau password salah." };
    const user: AuthUser = { id: match.id, name: match.name, email: match.email, role: match.role };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    notifyAuth();
    return { success: true, user };
  },

  register(name: string, email: string, password: string): { success: boolean; error?: string } {
    const users = getUsersDb();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      return { success: false, error: "Email sudah terdaftar." };
    const newUser: AuthUser & { password: string } = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "user",
    };
    saveUsersDb([...users, newUser]);
    const user: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    notifyAuth();
    return { success: true };
  },

  logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_KEY);
    notifyAuth();
  },

  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

import { useSyncExternalStore } from "react";

export function useAuth(): AuthUser | null {
  return useSyncExternalStore(
    (cb) => authStore.subscribe(cb),
    () => authStore.getUser(),
    () => null,
  );
}

export function useIsAdmin(): boolean {
  const user = useAuth();
  return user?.role === "admin";
}
