import { Link } from "@tanstack/react-router";
import { Camera, Mail, Phone, Instagram, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-card/40 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40">
                <Camera className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="text-lg font-bold">
                SnapBooth{" "}
                <span className="font-display italic text-gradient-blue">Studio</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Studio photobooth premium dengan tema unik. Datang, pilih frame, ambil foto, dan simpan momenmu.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                <Phone className="h-4 w-4" />
              </a>
              <a href="#" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Studio */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest">Studio</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {["Blue Moment", "Vintage Red Phone", "Pixie Cinema", "Newspaper Classic"].map((s) => (
                <li key={s}>
                  <Link to="/studio" className="transition hover:text-foreground">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Menu */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest">Menu</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {[
                { to: "/", label: "Beranda" },
                { to: "/paket", label: "Paket Sewa" },
                { to: "/frame", label: "Frame Photobooth" },
                { to: "/kamera", label: "Coba Kamera" },
                { to: "/galeri", label: "Galeri" },
                { to: "/booking", label: "Booking Studio" },
              ].map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="transition hover:text-foreground">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest">Lokasi</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Jl. Fotografi No. 12, Jakarta Selatan</span>
              </div>
              <div className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>hello@snapbooth.id</span>
              </div>
              <div className="mt-2 text-xs">
                <p className="font-medium text-foreground">Jam Operasional</p>
                <p>Senin–Jumat: 09.00–20.00</p>
                <p>Sabtu–Minggu: 09.00–21.00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SnapBooth Studio. Hak cipta dilindungi.</p>
          <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Infrastruktur AWS IaaS · EC2 · Security Group · VPC
          </p>
        </div>
      </div>
    </footer>
  );
}
