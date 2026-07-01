import { useSyncExternalStore } from "react";
import {
  ADDONS,
  computeTotal,
  getPackage,
  getStudio,
  getFrame,
  type PackageId,
  type StudioId,
  type FrameId,
  type Duration,
} from "./packages";

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type PaymentStatus = "Belum Bayar" | "DP" | "Lunas";

export interface Booking {
  id: string;
  customerName: string;
  whatsapp: string;
  email: string;
  studioId: StudioId;
  frameId: FrameId;
  bookingDate: string; // ISO yyyy-mm-dd
  timeSlot: string;
  duration: Duration;
  guestCount: number;
  packageId: PackageId;
  addons: string[]; // addon ids
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  message: string;
  createdAt: string;
  kind: "create" | "update" | "delete" | "status" | "payment" | "export";
}

const BOOKINGS_KEY = "snapbooth.bookings.v2";
const ACTIVITIES_KEY = "snapbooth.activities.v2";

const isBrowser = typeof window !== "undefined";

const listeners = new Set<() => void>();
const notify = () => {
  cache.clear();
  listeners.forEach((l) => l());
};

const cache = new Map<string, unknown>();

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = localStorage.getItem(key);
    const val = raw ? (JSON.parse(raw) as T) : fallback;
    cache.set(key, val);
    return val;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
  notify();
}

function seedIfEmpty() {
  if (!isBrowser) return;
  if (localStorage.getItem(BOOKINGS_KEY)) return;
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  };
  const seed: Booking[] = [
    {
      id: "SB-0001",
      customerName: "Aditya Pratama",
      whatsapp: "081234567890",
      email: "adit@mail.com",
      studioId: "blue-moment",
      frameId: "every-moment-blue",
      bookingDate: day(2),
      timeSlot: "15.00–15.30",
      duration: "1h",
      guestCount: 3,
      packageId: "studio-hour",
      addons: ["cetak-tambahan"],
      totalPrice: 180000,
      status: "Confirmed",
      paymentStatus: "DP",
      notes: "Tema biru, minta frame besar.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "SB-0002",
      customerName: "Rania Salsabila",
      whatsapp: "082198765432",
      email: "rania@mail.com",
      studioId: "vintage-red-phone",
      frameId: "vintage-telephone",
      bookingDate: day(5),
      timeSlot: "10.00–10.30",
      duration: "30min",
      guestCount: 2,
      packageId: "quick-shot",
      addons: [],
      totalPrice: 75000,
      status: "Pending",
      paymentStatus: "Belum Bayar",
      notes: "",
      createdAt: new Date().toISOString(),
    },
    {
      id: "SB-0003",
      customerName: "Farhan & Nisa",
      whatsapp: "081377889900",
      email: "farhan@mail.com",
      studioId: "pixie-cinema",
      frameId: "pixie-film-cinema",
      bookingDate: day(-3),
      timeSlot: "18.00–18.30",
      duration: "2h",
      guestCount: 5,
      packageId: "full-experience",
      addons: ["digital-all", "custom-frame-text"],
      totalPrice: 320000,
      status: "Completed",
      paymentStatus: "Lunas",
      notes: "Custom teks: Farhan & Nisa 2026",
      createdAt: new Date().toISOString(),
    },
    {
      id: "SB-0004",
      customerName: "Dinda Maharani",
      whatsapp: "085312345678",
      email: "dinda@mail.com",
      studioId: "newspaper-classic",
      frameId: "good-times-newspaper",
      bookingDate: day(1),
      timeSlot: "13.00–13.30",
      duration: "1h",
      guestCount: 4,
      packageId: "studio-hour",
      addons: ["extra-time"],
      totalPrice: 200000,
      status: "Confirmed",
      paymentStatus: "Lunas",
      notes: "Mau foto konsep editorial.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "SB-0005",
      customerName: "Rizky Hidayat",
      whatsapp: "087898765432",
      email: "rizky@mail.com",
      studioId: "blue-moment",
      frameId: "every-moment-blue",
      bookingDate: day(7),
      timeSlot: "09.00–09.30",
      duration: "30min",
      guestCount: 2,
      packageId: "quick-shot",
      addons: ["digital-all"],
      totalPrice: 100000,
      status: "Pending",
      paymentStatus: "Belum Bayar",
      notes: "",
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(seed));
  const acts: Activity[] = seed.map((b, i) => ({
    id: `A${i}`,
    message: `Booking ${b.id} (${b.customerName}) — ${getStudio(b.studioId).name} ditambahkan`,
    kind: "create" as const,
    createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
  }));
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(acts));
}

if (isBrowser) seedIfEmpty();

export function nextBookingId(existing: Booking[]) {
  const nums = existing
    .map((b) => parseInt(b.id.replace("SB-", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `SB-${String(max + 1).padStart(4, "0")}`;
}

function pushActivity(a: Omit<Activity, "id" | "createdAt">) {
  const list = read<Activity[]>(ACTIVITIES_KEY, []);
  const next: Activity = {
    ...a,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  write(ACTIVITIES_KEY, [next, ...list].slice(0, 30));
}

export const bookingsStore = {
  getAll(): Booking[] {
    return read(BOOKINGS_KEY, []);
  },
  getActivities(): Activity[] {
    return read(ACTIVITIES_KEY, []);
  },
  add(
    input: Omit<Booking, "id" | "createdAt" | "totalPrice"> & {
      totalPrice?: number;
    },
  ) {
    const all = read<Booking[]>(BOOKINGS_KEY, []);
    const id = nextBookingId(all);
    const totalPrice =
      input.totalPrice ?? computeTotal(input.packageId, input.addons);
    const booking: Booking = {
      ...input,
      id,
      totalPrice,
      createdAt: new Date().toISOString(),
    };
    write(BOOKINGS_KEY, [booking, ...all]);
    pushActivity({
      kind: "create",
      message: `Booking ${id} (${booking.customerName}) — ${getStudio(booking.studioId).name} ditambahkan`,
    });
    return booking;
  },
  update(id: string, patch: Partial<Booking>) {
    const all = read<Booking[]>(BOOKINGS_KEY, []);
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const prev = all[idx];
    const merged = { ...prev, ...patch };
    if (patch.packageId || patch.addons) {
      merged.totalPrice = computeTotal(merged.packageId, merged.addons);
    }
    all[idx] = merged;
    write(BOOKINGS_KEY, all);
    if (patch.status && patch.status !== prev.status) {
      pushActivity({
        kind: "status",
        message: `Status ${id} diubah menjadi ${patch.status}`,
      });
    } else if (
      patch.paymentStatus &&
      patch.paymentStatus !== prev.paymentStatus
    ) {
      pushActivity({
        kind: "payment",
        message: `Pembayaran ${id} diubah menjadi ${patch.paymentStatus}`,
      });
    } else {
      pushActivity({ kind: "update", message: `Booking ${id} diperbarui` });
    }
  },
  remove(id: string) {
    const all = read<Booking[]>(BOOKINGS_KEY, []);
    write(
      BOOKINGS_KEY,
      all.filter((b) => b.id !== id),
    );
    pushActivity({ kind: "delete", message: `Booking ${id} dihapus` });
  },
  logExport() {
    pushActivity({
      kind: "export",
      message: `Data booking diekspor ke spreadsheet`,
    });
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

const EMPTY_BOOKINGS: Booking[] = [];
const EMPTY_ACTIVITIES: Activity[] = [];

export function useBookings(): Booking[] {
  return useSyncExternalStore(
    (cb) => bookingsStore.subscribe(cb),
    () => bookingsStore.getAll(),
    () => EMPTY_BOOKINGS,
  );
}

export function useActivities(): Activity[] {
  return useSyncExternalStore(
    (cb) => bookingsStore.subscribe(cb),
    () => bookingsStore.getActivities(),
    () => EMPTY_ACTIVITIES,
  );
}

// Re-export for convenience
export { computeTotal, getPackage, getStudio, getFrame };
