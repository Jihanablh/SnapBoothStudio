import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Users, RefreshCw } from "lucide-react";
import { apiGetBookings, type ApiBooking } from "@/services/api";
import { formatIDR } from "@/lib/packages";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/kalender")({
  component: CalendarPage,
});

const DOW = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const statusColor: Record<string, string> = {
  Pending:   "bg-yellow-400/15 text-yellow-300 border-yellow-400/30",
  Confirmed: "bg-blue-400/15  text-blue-300  border-blue-400/30",
  Completed: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  Cancelled: "bg-red-400/15   text-red-300   border-red-400/30",
};

function CalendarPage() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState<string>(
    today.toISOString().slice(0, 10),
  );

  async function load() {
    setLoading(true);
    const res = await apiGetBookings();
    if (res.data) setBookings(res.data);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const byDate = useMemo(() => {
    const map = new Map<string, ApiBooking[]>();
    for (const b of bookings) {
      const arr = map.get(b.booking_date) ?? [];
      arr.push(b);
      map.set(b.booking_date, arr);
    }
    return map;
  }, [bookings]);

  const grid = useMemo(() => {
    const y = cursor.getFullYear(), m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const firstDow = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const dayBookings = byDate.get(selected) ?? [];
  const monthLabel = cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Jadwal</p>
          <h1 className="mt-1 text-3xl font-bold">Kalender Booking Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Klik tanggal untuk melihat booking studio yang terjadwal.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:border-primary/40 transition">
          <RefreshCw className="h-4 w-4" /> {loading ? "..." : "Refresh"}
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Calendar */}
        <div className="rounded-3xl border border-border bg-card/60 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:border-primary/40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today.toISOString().slice(0, 10)); }}
                className="rounded-lg border border-border px-3 text-xs hover:border-primary/40"
              >
                Hari ini
              </button>
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:border-primary/40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {DOW.map((d) => <div key={d} className="py-2 font-semibold">{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              if (!d) return <div key={i} />;
              const iso = d.toISOString().slice(0, 10);
              const items = byDate.get(iso) ?? [];
              const isSelected = iso === selected;
              const isToday = iso === today.toISOString().slice(0, 10);
              const hasConfirmed = items.some((b) => b.booking_status === "Confirmed" || b.booking_status === "Completed");
              const hasPending = items.some((b) => b.booking_status === "Pending");
              return (
                <button
                  key={i}
                  onClick={() => setSelected(iso)}
                  className={cn(
                    "relative aspect-square rounded-xl border p-1.5 text-left text-xs transition-all",
                    isSelected
                      ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                      : items.length > 0
                        ? "border-accent/40 bg-accent/10 hover:border-accent"
                        : "border-border bg-background/30 hover:border-primary/30",
                  )}
                >
                  <span className={cn("font-semibold", isToday && !isSelected && "text-primary")}>
                    {d.getDate()}
                  </span>
                  {items.length > 0 && (
                    <span className="absolute bottom-1 right-1 flex gap-0.5">
                      {hasConfirmed && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      {hasPending && <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Confirmed/Completed</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400" /> Pending</span>
          </div>
        </div>

        {/* Day detail */}
        <div className="rounded-3xl border border-border bg-card/60 p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Booking pada</p>
          <h3 className="text-lg font-semibold">
            {new Date(selected + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{dayBookings.length} booking terjadwal</p>
          <div className="mt-5 space-y-3">
            {dayBookings.length === 0 && (
              <p className="rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                Tidak ada booking pada tanggal ini. Slot tersedia.
              </p>
            )}
            {dayBookings.map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-background/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{b.customer_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.start_time} · {b.duration_minutes} menit
                    </p>
                  </div>
                  <span className="shrink-0 font-bold text-gradient text-sm">
                    {formatIDR(b.total_price)}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                  <span>{b.studio_name ?? "-"}</span>
                  <span>·</span>
                  <span>{b.frame_name ?? "-"}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{b.people_count} orang</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusColor[b.booking_status])}>
                    {b.booking_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time slot availability */}
      <div className="rounded-3xl border border-border bg-card/60 p-6">
        <h2 className="text-lg font-semibold mb-4">Ketersediaan Slot — {selected}</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((slot) => {
            const booked = dayBookings.some((b) => b.start_time === slot && b.booking_status !== "Cancelled");
            return (
              <div
                key={slot}
                className={cn(
                  "rounded-xl border px-2 py-2 text-center text-xs font-medium",
                  booked
                    ? "border-red-500/40 bg-red-500/10 text-red-400"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
                )}
              >
                <div>{slot}</div>
                <div className="mt-1 font-normal opacity-70">{booked ? "Terisi" : "Tersedia"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
