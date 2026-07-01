import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  Wallet,
  XCircle,
  Activity as ActivityIcon,
  Plus,
  LayoutGrid,
  ImageIcon,
} from "lucide-react";
import { useActivities, useBookings } from "@/lib/bookings-store";
import { CountUp } from "@/components/count-up";
import { formatIDR, getPackage, getStudio, getFrame } from "@/lib/packages";
import { StatusBadge, PaymentBadge } from "@/components/status-badge";

export const Route = createFileRoute("/admin/")({
  component: DashboardHome,
});

function DashboardHome() {
  const bookings = useBookings();
  const activities = useActivities();

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
    const completed = bookings.filter((b) => b.status === "Completed").length;
    const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
    const revenue = bookings
      .filter((b) => b.status !== "Cancelled")
      .reduce((s, b) => s + b.totalPrice, 0);
    const unpaid = bookings
      .filter((b) => b.paymentStatus !== "Lunas" && b.status !== "Cancelled")
      .reduce((s, b) => s + b.totalPrice, 0);

    // Top studio
    const studioCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      if (b.status !== "Cancelled") {
        studioCounts[b.studioId] = (studioCounts[b.studioId] ?? 0) + 1;
      }
    });
    const topStudioId = Object.entries(studioCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Top frame
    const frameCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      if (b.status !== "Cancelled") {
        frameCounts[b.frameId] = (frameCounts[b.frameId] ?? 0) + 1;
      }
    });
    const topFrameId = Object.entries(frameCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    return { total, pending, confirmed, completed, cancelled, revenue, unpaid, topStudioId, topFrameId };
  }, [bookings]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return bookings
      .filter((b) => b.bookingDate >= today && b.status !== "Cancelled")
      .sort((a, b) => a.bookingDate.localeCompare(b.bookingDate))
      .slice(0, 6);
  }, [bookings]);

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
        <Link
          to="/booking"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition"
        >
          <Plus className="h-4 w-4" /> Tambah Booking
        </Link>
      </header>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarClock} label="Total Booking" value={stats.total} tint="from-primary to-accent" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} tint="from-yellow-400 to-orange-500" />
        <StatCard icon={CheckCircle2} label="Confirmed" value={stats.confirmed} tint="from-blue-400 to-cyan-500" />
        <StatCard icon={TrendingUp} label="Completed" value={stats.completed} tint="from-emerald-400 to-teal-500" />
        <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} tint="from-red-400 to-pink-500" />
        <StatCard icon={Wallet} label="Estimasi Pendapatan" value={stats.revenue} tint="from-primary to-accent" isCurrency />
        <StatCard icon={CreditCard} label="Belum Lunas" value={stats.unpaid} tint="from-pink-400 to-purple-500" isCurrency />
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-accent/10 p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Rata-rata</p>
          <p className="mt-2 text-2xl font-bold text-gradient">
            {stats.total > 0 ? formatIDR(Math.round(stats.revenue / stats.total)) : formatIDR(0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">per booking</p>
        </div>
      </div>

      {/* Top studio & frame */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.topStudioId && (
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid className="h-4 w-4 text-primary" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Studio Paling Populer</p>
            </div>
            <p className="text-lg font-bold">{getStudio(stats.topStudioId as never).emoji} {getStudio(stats.topStudioId as never).name}</p>
            <p className="text-xs text-muted-foreground">{getStudio(stats.topStudioId as never).theme}</p>
          </div>
        )}
        {stats.topFrameId && (
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Frame Paling Dipilih</p>
            </div>
            <p className="text-lg font-bold">{getFrame(stats.topFrameId as never).emoji} {getFrame(stats.topFrameId as never).name}</p>
            <p className="text-xs text-muted-foreground">Tema {getFrame(stats.topFrameId as never).badge}</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-border bg-card/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Booking Mendatang</h2>
            <Link to="/admin/bookings" className="text-xs text-primary hover:underline">Lihat semua →</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {upcoming.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Belum ada booking mendatang.</p>
            )}
            {upcoming.map((b) => {
              const studio = getStudio(b.studioId);
              const frame = getFrame(b.frameId);
              return (
                <div key={b.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{b.customerName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {studio.emoji} {studio.name} · {frame.emoji} {frame.name}
                    </p>
                  </div>
                  <div className="hidden text-sm sm:block">
                    <p className="font-medium">{b.bookingDate}</p>
                    <p className="text-xs text-muted-foreground">{b.timeSlot}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusBadge status={b.status} />
                    <PaymentBadge status={b.paymentStatus} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/60 p-6">
          <div className="mb-4 flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Aktivitas Terbaru</h2>
          </div>
          <ol className="relative space-y-4 border-l border-border pl-5">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
            )}
            {activities.slice(0, 8).map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40" />
                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString("id-ID")}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* AWS note */}
      <div className="rounded-2xl border border-border bg-card/60 p-5 text-xs text-muted-foreground">
        <span className="font-semibold text-primary">💡 Tentang Sistem:</span>{" "}
        Sistem ini dirancang untuk dideploy pada infrastruktur AWS IaaS menggunakan EC2 sebagai virtual server. Website dapat dikembangkan dengan database, load balancer, autoscaling, dan security group untuk mendukung scalability, availability, dan keamanan akses.
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
  isCurrency,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: number;
  tint: string;
  isCurrency?: boolean;
}) {
  return (
    <div className="card-hover rounded-2xl border border-border bg-card/60 p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-lg shadow-primary/20`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">
        {isCurrency ? <CountUp value={value} prefix="Rp" /> : <CountUp value={value} />}
      </p>
    </div>
  );
}
