// ── Package Types ──────────────────────────────────────────────────────────
export type PackageId = "quick-shot" | "studio-hour" | "full-experience";
export type StudioId =
  | "blue-moment"
  | "vintage-red-phone"
  | "pixie-cinema"
  | "newspaper-classic";
export type FrameId =
  | "vintage-telephone"
  | "every-moment-blue"
  | "pixie-film-cinema"
  | "good-times-newspaper";
export type Duration = "30min" | "1h" | "2h";

// ── Packages ───────────────────────────────────────────────────────────────
export interface Package {
  id: PackageId;
  name: string;
  price: number;
  duration: string;
  durationKey: Duration;
  tagline: string;
  maxGuest: number;
  features: string[];
  badge?: string;
  recommended?: boolean;
}

export const PACKAGES: Package[] = [
  {
    id: "quick-shot",
    name: "Quick Shot",
    price: 35000,
    duration: "30 menit",
    durationKey: "30min",
    tagline: "Foto cepat, momen tetap berkesan.",
    maxGuest: 2,
    features: [
      "Durasi 30 menit",
      "Maksimal 2 orang",
      "1 pilihan frame",
      "File digital basic",
    ],
  },
  {
    id: "studio-hour",
    name: "Studio Hour",
    price: 75000,
    duration: "1 jam",
    durationKey: "1h",
    tagline: "Pilihan paling populer.",
    maxGuest: 4,
    recommended: true,
    badge: "Best Seller",
    features: [
      "Durasi 1 jam",
      "Maksimal 4 orang",
      "2 pilihan frame",
      "File digital all photos",
      "2 cetak foto",
    ],
  },
  {
    id: "full-experience",
    name: "Full Experience",
    price: 120000,
    duration: "2 jam",
    durationKey: "2h",
    tagline: "Pengalaman studio terlengkap.",
    maxGuest: 6,
    badge: "Best for Group",
    features: [
      "Durasi 2 jam",
      "Maksimal 6 orang",
      "Semua pilihan frame",
      "File digital all photos",
      "6 cetak foto",
      "Custom text pada frame",
    ],
  },
];

// ── Studios ────────────────────────────────────────────────────────────────
export interface Studio {
  id: StudioId;
  name: string;
  description: string;
  capacity: number;
  theme: string;
  accentColor: string;
  bgGradient: string;
  emoji: string;
}

export const STUDIOS: Studio[] = [
  {
    id: "blue-moment",
    name: "Blue Moment Studio",
    description:
      "Studio modern dengan nuansa biru elegan. Cocok untuk foto kasual, konten media sosial, dan momen persahabatan.",
    capacity: 4,
    theme: "Modern Blue",
    accentColor: "oklch(0.6 0.22 240)",
    bgGradient: "from-blue-950 to-slate-900",
    emoji: "💙",
  },
  {
    id: "vintage-red-phone",
    name: "Vintage Red Phone Studio",
    description:
      "Dekorasi retro bertema telepon merah ikonik. Nuansa vintage Inggris klasik yang unik dan instagrammable.",
    capacity: 4,
    theme: "Vintage Retro",
    accentColor: "oklch(0.55 0.22 25)",
    bgGradient: "from-red-950 to-stone-900",
    emoji: "📞",
  },
  {
    id: "pixie-cinema",
    name: "Pixie Cinema Studio",
    description:
      "Ambiance sinematik dengan nuansa tirai bioskop, lampu sorot, dan elemen film klasik yang sangat premium.",
    capacity: 6,
    theme: "Cinema Classic",
    accentColor: "oklch(0.5 0.16 50)",
    bgGradient: "from-stone-900 to-amber-950",
    emoji: "🎬",
  },
  {
    id: "newspaper-classic",
    name: "Newspaper Classic Studio",
    description:
      "Konsep editorial hitam-putih bergaya koran vintage. Estetik, artistik, dan cocok untuk semua usia.",
    capacity: 6,
    theme: "Editorial B&W",
    accentColor: "oklch(0.7 0 0)",
    bgGradient: "from-neutral-900 to-zinc-900",
    emoji: "📰",
  },
];

// ── Frames ─────────────────────────────────────────────────────────────────
export interface Frame {
  id: FrameId;
  name: string;
  theme: string;
  badge: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  emoji: string;
}

export const FRAMES: Frame[] = [
  {
    id: "vintage-telephone",
    name: "Vintage Telephone",
    theme: "Retro",
    badge: "Retro",
    description:
      "Frame bergaya poster vintage dengan warna cream, merah, dan hitam. Layout 3 foto vertikal dengan ornamen garis klasik.",
    primaryColor: "#c8102e",
    secondaryColor: "#f5e6c8",
    emoji: "📞",
  },
  {
    id: "every-moment-blue",
    name: "Every Moment Blue",
    theme: "Modern",
    badge: "Modern",
    description:
      "Frame modern biru-putih bersih dengan teks besar 'EVERY MOMENT', barcode dekoratif, dan layout sporty.",
    primaryColor: "#1a56db",
    secondaryColor: "#ffffff",
    emoji: "💙",
  },
  {
    id: "pixie-film-cinema",
    name: "Pixie Film Cinema",
    theme: "Cinema",
    badge: "Cinema",
    description:
      "Frame vintage cinema dengan warna cream dan burgundy. Elemen tiket film, tanggal otomatis, dan barcode vintage.",
    primaryColor: "#6b2737",
    secondaryColor: "#f5e6c8",
    emoji: "🎬",
  },
  {
    id: "good-times-newspaper",
    name: "Good Times Newspaper",
    theme: "Newspaper",
    badge: "Newspaper",
    description:
      "Frame halaman koran hitam-putih dengan headline besar 'GOOD TIMES TODAY!' dan layout editorial yang artistik.",
    primaryColor: "#1a1a1a",
    secondaryColor: "#f0ede8",
    emoji: "📰",
  },
];

// ── Add-ons ────────────────────────────────────────────────────────────────
export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const ADDONS: AddOn[] = [
  {
    id: "extra-time",
    name: "Extra Time (+30 menit)",
    price: 20000,
    description: "Tambah durasi sewa 30 menit lagi.",
  },
  {
    id: "cetak-tambahan",
    name: "Cetak Foto Tambahan",
    price: 10000,
    description: "Cetak 4 lembar foto tambahan.",
  },
  {
    id: "digital-all",
    name: "File Digital All Photos",
    price: 15000,
    description: "Semua foto dalam format digital resolusi tinggi.",
  },
  {
    id: "custom-frame-text",
    name: "Custom Frame Text",
    price: 15000,
    description: "Tambahkan nama/teks kustom pada frame foto.",
  },
];

// ── Time Slots ─────────────────────────────────────────────────────────────
export const TIME_SLOTS = [
  "09.00–09.30",
  "10.00–10.30",
  "11.00–11.30",
  "13.00–13.30",
  "14.00–14.30",
  "15.00–15.30",
  "16.00–16.30",
  "18.00–18.30",
  "19.00–19.30",
];

// ── Helpers ────────────────────────────────────────────────────────────────
export const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const getPackage = (id: PackageId) =>
  PACKAGES.find((p) => p.id === id)!;

export const getStudio = (id: StudioId) => STUDIOS.find((s) => s.id === id)!;

export const getFrame = (id: FrameId) => FRAMES.find((f) => f.id === id)!;

export const computeTotal = (packageId: PackageId, addonIds: string[]) => {
  const base = getPackage(packageId).price;
  const extra = ADDONS.filter((a) => addonIds.includes(a.id)).reduce(
    (s, a) => s + a.price,
    0,
  );
  return base + extra;
};
