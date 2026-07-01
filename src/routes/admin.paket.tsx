import { createFileRoute } from "@tanstack/react-router";
import { ADDONS, PACKAGES, formatIDR } from "@/lib/packages";
import { useBookings } from "@/lib/bookings-store";

export const Route = createFileRoute("/admin/paket")({ component: AdminPaket });

function AdminPaket() {
  const bookings = useBookings();
  const countByPkg = (id: string) => bookings.filter((b) => b.packageId === id).length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Katalog</p>
        <h1 className="mt-1 text-3xl font-bold">Paket Layanan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan paket dan add-on yang tersedia.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {PACKAGES.map((p) => (
          <div key={p.id} className={`card-hover rounded-3xl border p-6 ${p.recommended ? "border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10" : "border-border bg-card/60"}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{p.name}</h3>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{countByPkg(p.id)} booking</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gradient">{formatIDR(p.price)}</p>
            <p className="text-xs text-muted-foreground">{p.duration}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {p.features.map((f) => <li key={f}>· {f}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card/60 p-6">
        <h2 className="text-lg font-semibold">Add-on</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ADDONS.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-background/40 p-4">
              <p className="text-sm font-semibold">{a.name}</p>
              <p className="mt-1 text-lg font-bold text-gradient">+{formatIDR(a.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
