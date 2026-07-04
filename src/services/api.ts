// ── SnapBooth Studio API Service ─────────────────────────────────────────────
// All fetch calls happen CLIENT-SIDE only (not SSR).
// BASE_URL reads VITE_API_URL from .env — defaults to http://localhost:4000/api

// IMPORTANT: Do NOT use typeof window === 'undefined' guard here since
// TanStack Start renders on client but compiles SSR. Instead, we use
// a runtime check for the URL default.

const BASE_URL = (() => {
  // In browser environment: use VITE_API_URL from .env
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return (import.meta.env.VITE_API_URL as string) || "http://localhost:4000/api";
  }
  return "http://localhost:4000/api";
})();

// ── Auth helpers ──────────────────────────────────────────────────────────────
const TOKEN_KEY = "snapbooth_token";
const USER_KEY  = "snapbooth_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as ApiUser) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: ApiUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface ApiBooking {
  id: number;
  booking_code: string;
  user_id: number | null;
  customer_name: string;
  whatsapp: string;
  email: string;
  studio_id: number;
  package_id: number;
  frame_id: number;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  people_count: number;
  addons: string; // JSON string
  total_price: number;
  payment_status: "Belum Bayar" | "DP" | "Lunas";
  booking_status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  notes: string | null;
  studio_name?: string;
  package_name?: string;
  frame_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiStudio {
  id: number;
  name: string;
  slug: string;
  description: string;
  capacity: number;
  theme_color: string;
  base_price: number;
  is_active: number;
}

export interface ApiPackage {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  max_people: number;
  price: number;
  benefits: string; // JSON string
  badge: string | null;
  is_recommended: number;
  is_active: number;
}

export interface ApiFrame {
  id: number;
  name: string;
  slug: string;
  description: string;
  theme: string;
  is_active: number;
}

export interface DashboardStats {
  total_bookings: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total_revenue: number;
  unpaid_count: number;
  most_booked_studio: string;
  most_used_frame: string;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
// Returns { success, data?, message? } — never throws.
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false,
): Promise<{ success: boolean; data?: T; message?: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Try to parse JSON response
    let json: Record<string, unknown>;
    try {
      json = await res.json() as Record<string, unknown>;
    } catch {
      return {
        success: false,
        message: `Server mengembalikan response tidak valid (${res.status}).`,
      };
    }

    // Handle auth errors
    if (res.status === 401) {
      clearSession();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("snapbooth:logout"));
      }
    }

    // Return the parsed JSON (success or error from server)
    return json as { success: boolean; data?: T; message?: string };

  } catch (err) {
    // Network error — server unreachable OR CORS blocked
    console.error(`[API] ${options.method ?? "GET"} ${url}:`, err);

    // Check if it's a CORS error (TypeError: Failed to fetch)
    const errorMsg = err instanceof Error ? err.message : String(err);
    const isCors = errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError");

    if (isCors) {
      return {
        success: false,
        message: "Server tidak terhubung. Pastikan backend API berjalan di http://localhost:4000 dan tidak ada CORS error.",
      };
    }

    return {
      success: false,
      message: "Server tidak terhubung. Pastikan backend API sedang berjalan.",
    };
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function apiLogin(
  email: string,
  password: string,
): Promise<{ success: boolean; token?: string; user?: ApiUser; message?: string }> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; token?: string; user?: ApiUser; message?: string }> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiGetMe(): Promise<{ success: boolean; user?: ApiUser; message?: string }> {
  return apiFetch("/auth/me", {}, true);
}

// ── Health check ──────────────────────────────────────────────────────────────
export async function apiHealth(): Promise<{ success: boolean; message?: string; timestamp?: string }> {
  return apiFetch("/health");
}

// ── Studios ───────────────────────────────────────────────────────────────────
export async function apiGetStudios(): Promise<{ success: boolean; data?: ApiStudio[]; message?: string }> {
  return apiFetch("/studios");
}

// ── Packages ──────────────────────────────────────────────────────────────────
export async function apiGetPackages(): Promise<{ success: boolean; data?: ApiPackage[]; message?: string }> {
  return apiFetch("/packages");
}

// ── Frames ────────────────────────────────────────────────────────────────────
export async function apiGetFrames(): Promise<{ success: boolean; data?: ApiFrame[]; message?: string }> {
  return apiFetch("/frames");
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export interface BookingFilters {
  status?: string;
  payment_status?: string;
  studio_id?: number;
  frame_id?: number;
  search?: string;
}

export async function apiGetBookings(
  filters: BookingFilters = {},
): Promise<{ success: boolean; data?: ApiBooking[]; message?: string }> {
  const params = new URLSearchParams();
  if (filters.status)         params.set("status",         filters.status);
  if (filters.payment_status) params.set("payment_status", filters.payment_status);
  if (filters.studio_id)      params.set("studio_id",      String(filters.studio_id));
  if (filters.frame_id)       params.set("frame_id",       String(filters.frame_id));
  if (filters.search)         params.set("search",         filters.search);
  const qs = params.toString();
  return apiFetch(`/bookings${qs ? "?" + qs : ""}`, {}, true);
}

export async function apiGetBookingById(
  id: number,
): Promise<{ success: boolean; data?: ApiBooking; message?: string }> {
  return apiFetch(`/bookings/${id}`, {}, true);
}

export interface CreateBookingPayload {
  customer_name: string;
  whatsapp: string;
  email?: string;
  studio_id: number;
  package_id: number;
  frame_id: number;
  booking_date: string;
  start_time: string;
  duration_minutes?: number;
  people_count?: number;
  addons?: string[];
  notes?: string;
}

export async function apiCreateBooking(
  data: CreateBookingPayload,
): Promise<{ success: boolean; data?: ApiBooking; message?: string }> {
  return apiFetch("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateBooking(
  id: number,
  data: Partial<CreateBookingPayload> & { booking_status?: string; payment_status?: string },
): Promise<{ success: boolean; data?: ApiBooking; message?: string }> {
  return apiFetch(`/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, true);
}

export async function apiUpdateBookingStatus(
  id: number,
  booking_status?: string,
  payment_status?: string,
): Promise<{ success: boolean; message?: string }> {
  return apiFetch(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ booking_status, payment_status }),
  }, true);
}

export async function apiDeleteBooking(
  id: number,
): Promise<{ success: boolean; message?: string }> {
  return apiFetch(`/bookings/${id}`, { method: "DELETE" }, true);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function apiGetDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  message?: string;
}> {
  return apiFetch("/dashboard/stats", {}, true);
}

export async function apiGetActivities(): Promise<{
  success: boolean;
  data?: unknown[];
  message?: string;
}> {
  return apiFetch("/dashboard/activities", {}, true);
}

// ── Export ────────────────────────────────────────────────────────────────────
export function apiExportCsv() {
  const token = getToken();
  fetchAndDownload(`${BASE_URL}/export/bookings/csv`, "snapbooth-bookings.csv", token);
}

export function apiExportXlsx() {
  const token = getToken();
  fetchAndDownload(`${BASE_URL}/export/bookings/xlsx`, "snapbooth-bookings.xlsx", token);
}

async function fetchAndDownload(url: string, filename: string, token: string | null) {
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      console.error(`Export gagal: ${res.status} ${res.statusText}`);
      return;
    }
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Export error:", err);
  }
}
