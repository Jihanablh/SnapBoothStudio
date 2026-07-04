import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatIDR } from "@/lib/packages";
import { apiGetPackages, apiGetBookings, type ApiPackage, type ApiBooking } from "@/services/api";
import { RefreshCw } from "lucide-react";

const ADDONS = [
  { id: "extra-time",        name: "Extra Time (+30 menit)",   price: 20000 },
  { id: "cetak-tambahan",    name: "Cetak Foto Tambahan",      price: 10000 },
  { id: "digital-all",       name: "File Digital All Photos",  price: 15000 },
  { id: "custom-frame-text", name: "Custom Frame Text",        price: 15000 },
];

export const Route = createFileRoute("/admin/paket")({ component: AdminPaket });

function AdminPaket() {
  const [packages, setPackages] = useState<ApiPackage[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [pRes, bRes] = await Promise.all([apiGetPackages(), apiGetBookings()]);
    if (pRes.data) setPackages(pRes.data);
    if (bRes.data) setBookings(bRes.data);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const countByPkg = (id: number) => bookings.filter((b) => b.package_id === id).length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Katalog</p>
          <h1 className="mt-1 text-3xl font-bold">Paket Layanan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ringkasan paket dan add-on yang tersedia.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:border-primary/40 transition">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl border border-border bg-card/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {packages.map((p) => {
            let benefits: string[] = [];
            try { benefits = JSON.parse(p.benefits); } catch { /* */ }
            return (
              <div key={p.id} className={`card-hover rounded-3xl border p-6 ${p.is_recommended ? "border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10" : "border-border bg-card/60"}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <div className="flex flex-col items-end gap-1">
                    {p.badge && (
                      <span className="rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                        {p.badge}
                      </span>
                    )}
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{countByPkg(p.id)} booking</span>
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-gradient">{formatIDR(p.price)}</p>
                <p className="text-xs text-muted-foreground">{p.duration_minutes} menit · Maks. {p.max_people} orang</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {benefits.map((f) => <li key={f}>· {f}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      )}

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
