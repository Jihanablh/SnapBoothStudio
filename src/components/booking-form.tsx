import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/packages";
import { apiGetStudios, apiGetPackages, apiGetFrames, apiCreateBooking, type ApiStudio, type ApiPackage, type ApiFrame } from "@/services/api";
import { useAuth } from "@/lib/auth-store";

// Addons (hardcoded — matches backend pricing)
const ADDONS = [
  { id: "extra-time",       name: "Extra Time (+30 menit)",  price: 20000, description: "Tambah durasi sewa 30 menit lagi." },
  { id: "cetak-tambahan",   name: "Cetak Foto Tambahan",     price: 10000, description: "Cetak 4 lembar foto tambahan." },
  { id: "digital-all",      name: "File Digital All Photos", price: 15000, description: "Semua foto dalam format digital resolusi tinggi." },
  { id: "custom-frame-text",name: "Custom Frame Text",       price: 15000, description: "Tambahkan nama/teks kustom pada frame foto." },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00",
];

export function BookingForm({
  initialPackageId,
  onSuccess,
}: {
  initialPackageId?: number;
  onSuccess?: (bookingId: string) => void;
}) {
  const authUser = useAuth();

  const [studios, setStudios]   = useState<ApiStudio[]>([]);
  const [packages, setPackages] = useState<ApiPackage[]>([]);
  const [frames, setFrames]     = useState<ApiFrame[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [form, setForm] = useState({
    customerName: authUser?.name ?? "",
    whatsapp:     "",
    email:        authUser?.email ?? "",
    studioId:     0,
    frameId:      0,
    packageId:    initialPackageId ?? 0,
    bookingDate:  "",
    timeSlot:     "10:00",
    guestCount:   1,
    addons:       [] as string[],
    notes:        "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setDataLoading(true);
      const [sRes, pRes, fRes] = await Promise.all([
        apiGetStudios(), apiGetPackages(), apiGetFrames(),
      ]);
      if (sRes.data) setStudios(sRes.data);
      if (pRes.data) {
        setPackages(pRes.data);
        if (!form.packageId && pRes.data.length) {
          setForm((f) => ({ ...f, packageId: initialPackageId ?? pRes.data![1]?.id ?? pRes.data![0]!.id }));
        }
      }
      if (fRes.data) {
        setFrames(fRes.data);
        if (!form.frameId && fRes.data.length) {
          setForm((f) => ({ ...f, frameId: fRes.data![0]!.id }));
        }
      }
      if (sRes.data && sRes.data.length && !form.studioId) {
        setForm((f) => ({ ...f, studioId: sRes.data![0]!.id }));
      }
      setDataLoading(false);
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPkg = packages.find((p) => p.id === form.packageId);
  const selectedStudio = studios.find((s) => s.id === form.studioId);
  const selectedFrame  = frames.find((f) => f.id === form.frameId);

  const total = useMemo(() => {
    const base = selectedPkg?.price ?? 0;
    const addon = ADDONS.filter((a) => form.addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
    return base + addon;
  }, [selectedPkg, form.addons]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleAddon = (id: string) =>
    setForm((f) => ({
      ...f,
      addons: f.addons.includes(id) ? f.addons.filter((x) => x !== id) : [...f.addons, id],
    }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.whatsapp || !form.bookingDate) {
      toast.error("Lengkapi nama, WhatsApp, dan tanggal booking.");
      return;
    }
    if (!form.studioId || !form.packageId || !form.frameId) {
      toast.error("Pilih studio, paket, dan frame terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    const addonNames = ADDONS.filter((a) => form.addons.includes(a.id)).map((a) => a.name);
    const res = await apiCreateBooking({
      customer_name: form.customerName,
      whatsapp:      form.whatsapp,
      email:         form.email || undefined,
      studio_id:     form.studioId,
      package_id:    form.packageId,
      frame_id:      form.frameId,
      booking_date:  form.bookingDate,
      start_time:    form.timeSlot,
      duration_minutes: selectedPkg?.duration_minutes ?? 60,
      people_count:  form.guestCount,
      addons:        addonNames,
      notes:         form.notes || undefined,
    });
    setSubmitting(false);

    if (!res.success || !res.data) {
      toast.error(res.message || "Gagal membuat booking. Pastikan backend berjalan.");
      return;
    }

    toast.success(`Booking ${res.data.booking_code} berhasil dibuat!`, {
      description: "Data booking telah tersimpan ke database.",
    });

    // Reset form
    setForm((f) => ({
      ...f,
      customerName: "",
      whatsapp: "",
      email: "",
      bookingDate: "",
      notes: "",
      addons: [],
    }));

    onSuccess?.(res.data.booking_code);
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/60 focus:bg-input focus:ring-4 focus:ring-primary/15";

  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat data dari server...</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        {/* Data Pelanggan */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Data Pelanggan</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nama Pelanggan">
              <input className={inputCls} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Nama lengkap" required />
            </Field>
            <Field label="Nomor WhatsApp">
              <input className={inputCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="08xxxxxxxxxx" required />
            </Field>
            <Field label="Email" className="sm:col-span-2">
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@email.com" />
            </Field>
          </div>
        </section>

        {/* Pilih Studio */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Pilih Studio</h3>
          {studios.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Studio tidak tersedia. Hubungi admin.</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {studios.map((s) => {
                const active = form.studioId === s.id;
                return (
                  <button key={s.id} type="button" onClick={() => set("studioId", s.id)}
                    className={cn("group rounded-2xl border p-4 text-left transition-all", active ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 glow-border-blue" : "border-border bg-card hover:border-primary/40")}>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">📷</span>
                      {active && <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" /></span>}
                    </div>
                    <div className="mt-2 font-semibold text-sm">{s.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" /> Maks. {s.capacity} orang
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Pilih Frame */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Pilih Frame Photobooth</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {frames.map((f) => {
              const active = form.frameId === f.id;
              return (
                <button key={f.id} type="button" onClick={() => set("frameId", f.id)}
                  className={cn("group rounded-2xl border p-4 text-left transition-all", active ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 glow-border-blue" : "border-border bg-card hover:border-primary/40")}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🎞️</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", active ? "bg-primary text-primary-foreground" : "border border-border bg-secondary text-muted-foreground")}>
                      {f.theme}
                    </span>
                  </div>
                  <div className="mt-2 font-semibold text-sm">{f.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.description}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Jadwal */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Jadwal & Durasi</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal Booking">
              <input type="date" className={inputCls} value={form.bookingDate} onChange={(e) => set("bookingDate", e.target.value)} required />
            </Field>
            <Field label="Jumlah Orang">
              <input type="number" min={1} max={6} className={inputCls} value={form.guestCount} onChange={(e) => set("guestCount", Number(e.target.value))} />
            </Field>
          </div>
          <div className="mt-5">
            <p className="text-sm font-medium">Pilih Jam Booking</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {TIME_SLOTS.map((slot) => (
                <button key={slot} type="button" onClick={() => set("timeSlot", slot)}
                  className={cn("rounded-xl border px-3 py-2.5 text-sm font-medium transition-all", form.timeSlot === slot ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40")}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Pilih Paket */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Pilih Paket</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {packages.map((p) => {
              const active = form.packageId === p.id;
              return (
                <button key={p.id} type="button" onClick={() => set("packageId", p.id)}
                  className={cn("group rounded-2xl border p-4 text-left transition-all", active ? "border-primary bg-primary/10 shadow-lg" : "border-border bg-card hover:border-primary/40")}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{p.name}</span>
                    {p.badge && <span className="rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">{p.badge}</span>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.duration_minutes} menit · Maks. {p.max_people} orang</div>
                  <div className="mt-3 text-base font-bold text-gradient">{formatIDR(p.price)}</div>
                </button>
              );
            })}
          </div>

          {/* Add-ons */}
          <div className="mt-6">
            <p className="text-sm font-medium">Add-on Tambahan</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {ADDONS.map((a) => {
                const active = form.addons.includes(a.id);
                return (
                  <button key={a.id} type="button" onClick={() => toggleAddon(a.id)}
                    className={cn("flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all", active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40")}>
                    <span className="flex items-center gap-2">
                      <span className={cn("grid h-5 w-5 place-items-center rounded-md border transition", active ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-left">
                        <span className="block font-medium">{a.name}</span>
                        <span className="block text-xs text-muted-foreground">{a.description}</span>
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold">+{formatIDR(a.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Catatan Tambahan" className="mt-6">
            <textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Tema, request khusus, nama di frame, dsb." />
          </Field>
        </section>
      </div>

      {/* BOOKING SUMMARY — static, no sticky */}
      <aside style={{ position: "static" }}>
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-card to-card/40 p-6 shadow-xl shadow-primary/10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Ringkasan Booking</p>

          <div className="mt-4 space-y-3 text-sm">
            {selectedStudio && (
              <div className="flex items-start gap-2">
                <span className="text-xl">📷</span>
                <div>
                  <p className="font-semibold">{selectedStudio.name}</p>
                  <p className="text-xs text-muted-foreground">Maks. {selectedStudio.capacity} orang</p>
                </div>
              </div>
            )}
            {selectedFrame && (
              <div className="flex items-start gap-2">
                <span className="text-xl">🎞️</span>
                <div>
                  <p className="font-semibold">{selectedFrame.name}</p>
                  <p className="text-xs text-muted-foreground">Frame {selectedFrame.theme}</p>
                </div>
              </div>
            )}
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="space-y-2 text-sm">
            {selectedPkg && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paket</span>
                  <span className="font-medium">{selectedPkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga paket</span>
                  <span>{formatIDR(selectedPkg.price)}</span>
                </div>
              </>
            )}
            {ADDONS.filter((a) => form.addons.includes(a.id)).map((a) => (
              <div key={a.id} className="flex justify-between">
                <span className="text-muted-foreground truncate pr-2">{a.name}</span>
                <span className="shrink-0">+{formatIDR(a.price)}</span>
              </div>
            ))}
            {form.addons.length === 0 && <p className="text-xs text-muted-foreground">Tidak ada add-on</p>}
          </div>

          <div className="my-5 h-px bg-border" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
          <p className="mt-1 text-3xl font-bold text-gradient">{formatIDR(total)}</p>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:-translate-y-0.5 disabled:opacity-70"
          >
            {submitting
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</span>
              : "Konfirmasi Booking"
            }
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Data tersimpan ke SQLite database.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
