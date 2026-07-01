import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ADDONS,
  FRAMES,
  PACKAGES,
  STUDIOS,
  TIME_SLOTS,
  formatIDR,
  computeTotal,
  type FrameId,
  type PackageId,
  type StudioId,
  type Duration,
} from "@/lib/packages";
import { bookingsStore } from "@/lib/bookings-store";
import { Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const DURATIONS: { key: Duration; label: string }[] = [
  { key: "30min", label: "30 menit" },
  { key: "1h", label: "1 jam" },
  { key: "2h", label: "2 jam" },
];

export function BookingForm({
  initialPackage = "studio-hour" as PackageId,
  onSuccess,
}: {
  initialPackage?: PackageId;
  onSuccess?: (bookingId: string) => void;
}) {
  const initPkg = PACKAGES.find((p) => p.id === initialPackage) ?? PACKAGES[1];

  const [form, setForm] = useState({
    customerName: "",
    whatsapp: "",
    email: "",
    studioId: "blue-moment" as StudioId,
    frameId: "every-moment-blue" as FrameId,
    bookingDate: "",
    timeSlot: TIME_SLOTS[3],
    duration: initPkg.durationKey as Duration,
    guestCount: 1,
    packageId: initialPackage as PackageId,
    addons: [] as string[],
    notes: "",
  });

  const total = useMemo(
    () => computeTotal(form.packageId, form.addons),
    [form.packageId, form.addons],
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const toggleAddon = (id: string) =>
    setForm((f) => ({
      ...f,
      addons: f.addons.includes(id)
        ? f.addons.filter((x) => x !== id)
        : [...f.addons, id],
    }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.whatsapp || !form.bookingDate) {
      toast.error("Lengkapi nama, WhatsApp, dan tanggal booking.");
      return;
    }
    const b = bookingsStore.add({
      ...form,
      status: "Pending",
      paymentStatus: "Belum Bayar",
    });
    toast.success(`Booking ${b.id} berhasil dibuat!`, {
      description: "Data booking telah masuk ke dashboard admin.",
    });
    setForm((f) => ({
      ...f,
      customerName: "",
      whatsapp: "",
      email: "",
      bookingDate: "",
      notes: "",
      addons: [],
    }));
    onSuccess?.(b.id);
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/60 focus:bg-input focus:ring-4 focus:ring-primary/15";

  const selectedPkg = PACKAGES.find((p) => p.id === form.packageId)!;
  const selectedStudio = STUDIOS.find((s) => s.id === form.studioId)!;
  const selectedFrame = FRAMES.find((f) => f.id === form.frameId)!;

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        {/* Data Pelanggan */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Data Pelanggan</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nama Pelanggan">
              <input
                className={inputCls}
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                placeholder="Nama lengkap"
              />
            </Field>
            <Field label="Nomor WhatsApp">
              <input
                className={inputCls}
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </Field>
            <Field label="Email" className="sm:col-span-2">
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="nama@email.com"
              />
            </Field>
          </div>
        </section>

        {/* Pilih Studio */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Pilih Studio</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {STUDIOS.map((s) => {
              const active = form.studioId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => set("studioId", s.id)}
                  className={cn(
                    "group rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 glow-border-blue"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{s.emoji}</span>
                    {active && (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2 font-semibold text-sm">{s.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> Maks. {s.capacity} orang
                    <span className="rounded-full border border-border px-2 py-0.5">{s.theme}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Pilih Frame */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Pilih Frame Photobooth</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {FRAMES.map((f) => {
              const active = form.frameId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => set("frameId", f.id)}
                  className={cn(
                    "group rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 glow-border-blue"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{f.emoji}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-secondary text-muted-foreground",
                      )}
                    >
                      {f.badge}
                    </span>
                  </div>
                  <div className="mt-2 font-semibold text-sm">{f.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.description}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Jadwal Booking */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Jadwal & Durasi</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal Booking">
              <input
                type="date"
                className={inputCls}
                value={form.bookingDate}
                onChange={(e) => set("bookingDate", e.target.value)}
              />
            </Field>
            <Field label="Jumlah Orang">
              <input
                type="number"
                min={1}
                max={6}
                className={inputCls}
                value={form.guestCount}
                onChange={(e) => set("guestCount", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium">Durasi Sewa</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DURATIONS.map((d) => {
                const active = form.duration === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => set("duration", d.key)}
                    className={cn(
                      "rounded-2xl border px-5 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary",
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium">Pilih Jam Booking</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TIME_SLOTS.map((slot) => {
                const active = form.timeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => set("timeSlot", slot)}
                    className={cn(
                      "rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                        : "border-border bg-card hover:border-primary/40 hover:bg-secondary",
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pilih Paket */}
        <section className="rounded-3xl border border-border bg-card/60 p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Pilih Paket</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {PACKAGES.map((p) => {
              const active = form.packageId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set("packageId", p.id)}
                  className={cn(
                    "group rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{p.name}</span>
                    {p.badge && (
                      <span className="rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.duration}</div>
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
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAddon(a.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all",
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-md border transition",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
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
            <textarea
              rows={3}
              className={inputCls}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Tema, request khusus, nama yang ingin ditampilkan di frame, dsb."
            />
          </Field>
        </section>
      </div>

      {/* BOOKING SUMMARY — static (no sticky) */}
      <aside>
        <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-card to-card/40 p-6 shadow-xl shadow-primary/10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Ringkasan Booking</p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedStudio.emoji}</span>
              <div>
                <p className="font-semibold">{selectedStudio.name}</p>
                <p className="text-xs text-muted-foreground">{selectedStudio.theme}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedFrame.emoji}</span>
              <div>
                <p className="font-semibold">{selectedFrame.name}</p>
                <p className="text-xs text-muted-foreground">Frame {selectedFrame.badge}</p>
              </div>
            </div>
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paket</span>
              <span className="font-medium">{selectedPkg.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Harga paket</span>
              <span>{formatIDR(selectedPkg.price)}</span>
            </div>
            {form.addons.length === 0 && (
              <p className="text-xs text-muted-foreground">Tidak ada add-on</p>
            )}
            {ADDONS.filter((a) => form.addons.includes(a.id)).map((a) => (
              <div key={a.id} className="flex justify-between">
                <span className="text-muted-foreground">{a.name}</span>
                <span>+{formatIDR(a.price)}</span>
              </div>
            ))}
          </div>

          <div className="my-5 h-px bg-border" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
          <p className="mt-1 text-3xl font-bold text-gradient">{formatIDR(total)}</p>

          <button
            type="submit"
            className="mt-6 w-full rounded-full bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:-translate-y-0.5 hover:shadow-primary/70"
          >
            Konfirmasi Booking
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Data akan masuk ke dashboard admin.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
