import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  Wallet,
  XCircle,
  Activity as ActivityIcon,
  LayoutGrid,
  ImageIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { apiGetDashboardStats, apiGetActivities, type DashboardStats } from "@/services/api";
import { CountUp } from "@/components/count-up";
import { formatIDR } from "@/lib/packages";

export const Route = createFileRoute("/admin/")({
  component: DashboardHome,
});

interface Activity {
  id: number;
  booking_code: string;
  customer_name: string;
  activity_type: string;
  description: string;
  created_at: string;
}

function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    const [statsRes, actsRes] = await Promise.all([
      apiGetDashboardStats(),
      apiGetActivities(),
    ]);
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    } else {
      setError(statsRes.message || "Gagal mengambil data dashboard.");
    }
    if (actsRes.success && actsRes.data) {
      setActivities(actsRes.data as Activity[]);
    }
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Overview</p>
            <h1 className="mt-1 text-3xl font-bold">Dashboard Admin</h1>
          </div>
        </div>
        {/* Skeleton cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-card/60" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div>
          <p className="font-semibold">Gagal memuat dashboard</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/20">
          <RefreshCw className="h-4 w-4" /> Coba Lagi
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Booking",    value: stats?.total_bookings ?? 0,  icon: CalendarClock,  color: "text-primary",      bg: "bg-primary/10"    },
    { label: "Pending",          value: stats?.pending ?? 0,          icon: Clock,          color: "text-yellow-400",   bg: "bg-yellow-400/10" },
    { label: "Confirmed",        value: stats?.confirmed ?? 0,        icon: CheckCircle2,   color: "text-blue-400",     bg: "bg-blue-400/10"   },
    { label: "Completed",        value: stats?.completed ?? 0,        icon: TrendingUp,     color: "text-emerald-400",  bg: "bg-emerald-400/10"},
    { label: "Cancelled",        value: stats?.cancelled ?? 0,        icon: XCircle,        color: "text-destructive",  bg: "bg-destructive/10"},
    { label: "Total Pendapatan", value: stats?.total_revenue ?? 0,    icon: Wallet,         color: "text-primary",      bg: "bg-primary/10",   isIDR: true },
    { label: "Belum Lunas",      value: stats?.unpaid_count ?? 0,     icon: CreditCard,     color: "text-amber-400",    bg: "bg-amber-400/10", suffix: " booking" },
    { label: "Studio Terpopuler",value: stats?.most_booked_studio ?? "-", icon: LayoutGrid, color: "text-violet-400",  bg: "bg-violet-400/10",isText: true },
    { label: "Frame Terpopuler", value: stats?.most_used_frame ?? "-", icon: ImageIcon,    color: "text-pink-400",     bg: "bg-pink-400/10",  isText: true },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Overview</p>
          <h1 className="mt-1 text-3xl font-bold">Dashboard Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau seluruh aktivitas booking studio secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm transition hover:border-primary/40"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link to="/booking"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground">
            + Booking Baru
          </Link>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </span>
            </div>
            <p className={`mt-3 text-2xl font-bold ${s.color}`}>
              {s.isText
                ? (s.value as string)
                : s.isIDR
                ? formatIDR(s.value as number)
                : <><CountUp value={s.value as number} />{s.suffix}</>
              }
            </p>
          </div>
        ))}
      </div>

      {/* Recent activities */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-primary" /> Aktivitas Terbaru
          </h2>
          <Link to="/admin/bookings" className="text-xs text-primary hover:underline">Lihat semua →</Link>
        </div>
        {activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada aktivitas. Data akan muncul setelah user melakukan pemesanan.
          </p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/30 px-4 py-3">
                <span className="mt-1 grid h-2 w-2 shrink-0 place-items-center rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
