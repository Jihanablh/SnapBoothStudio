import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Camera, LayoutDashboard, Table2, CalendarDays,
  Package, FileSpreadsheet, ArrowLeft, ShieldX, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DarkModeToggle, useDarkMode } from "@/components/dark-mode-toggle";
import { useAuth, authStore } from "@/lib/auth-store";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Dashboard Admin — SnapBooth Studio" },
      { name: "description", content: "Kelola data booking studio photobooth secara real-time." },
    ],
  }),
});

const menu: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin",          label: "Dashboard",       icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Data Booking",    icon: Table2 },
  { to: "/admin/kalender", label: "Kalender",        icon: CalendarDays },
  { to: "/admin/paket",    label: "Paket Studio",    icon: Package },
  { to: "/admin/export",   label: "Export",          icon: FileSpreadsheet },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useDarkMode();
  const user = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not logged in
  useEffect(() => {
    if (user === null) {
      // Check if localStorage is available (not SSR)
      if (typeof window !== "undefined" && !localStorage.getItem("snapbooth.auth.v1")) {
        void navigate({ to: "/login" });
      }
    }
  }, [user, navigate]);

  // Show access denied if logged in but not admin
  if (user && user.role !== "admin") {
    return <AccessDenied />;
  }

  // Show loading / redirect state
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl border border-border bg-card/60 p-5 lg:flex">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-bold">SnapBooth</span>
          </Link>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
              Admin
            </span>
          </div>

          <nav className="mt-6 flex-1 space-y-1">
            {menu.map((m) => {
              const active = m.exact ? pathname === m.to : pathname.startsWith(m.to);
              return (
                <Link key={m.to} to={m.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-primary/15 text-primary shadow-sm ring-1 ring-inset ring-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <m.icon className="h-4 w-4 shrink-0" /> {m.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <span className="text-xs text-muted-foreground">Tampilan</span>
              <DarkModeToggle theme={theme} toggle={toggle} />
            </div>
            <button
              onClick={() => { authStore.logout(); void navigate({ to: "/" }); }}
              className="flex w-full items-center gap-2 rounded-xl border border-destructive/30 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Logout & Keluar
            </button>
            <Link to="/"
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
            >
              <Home className="h-3.5 w-3.5" /> Kembali ke Website
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Mobile nav */}
          <div className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card/60 p-2 lg:hidden">
            {menu.map((m) => {
              const active = m.exact ? pathname === m.to : pathname.startsWith(m.to);
              return (
                <Link key={m.to} to={m.to}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition",
                    active ? "bg-primary/15 text-primary" : "text-muted-foreground",
                  )}
                >
                  <m.icon className="h-3.5 w-3.5" /> {m.label}
                </Link>
              );
            })}
            <div className="ml-auto flex items-center">
              <DarkModeToggle theme={theme} toggle={toggle} />
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-destructive/10 blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>
      <div className="relative max-w-md">
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl bg-destructive/10 ring-4 ring-destructive/20">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">Akses Ditolak</h1>
        <p className="mt-3 text-muted-foreground">
          Halaman dashboard hanya dapat diakses oleh <strong>admin</strong>. Akun kamu tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate({ to: "/" })}
            className="btn-glow inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Home className="h-4 w-4" /> Kembali ke Beranda
          </button>
          <Link to="/booking"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:border-primary/40"
          >
            Booking Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
