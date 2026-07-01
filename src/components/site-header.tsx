import { Link, useRouterState } from "@tanstack/react-router";
import { Camera, Menu, X, LogOut, User, ChevronDown, LayoutDashboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DarkModeToggle, useDarkMode } from "./dark-mode-toggle";
import { useAuth, authStore } from "@/lib/auth-store";
import { useNavigate } from "@tanstack/react-router";

const publicNav = [
  { to: "/",      label: "Beranda" },
  { to: "/studio", label: "Studio" },
  { to: "/paket",  label: "Paket" },
  { to: "/frame",  label: "Frame" },
  { to: "/kamera", label: "Kamera" },
  { to: "/galeri", label: "Galeri" },
  { to: "/booking",label: "Booking" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggle } = useDarkMode();
  const user = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    authStore.logout();
    setUserMenuOpen(false);
    void navigate({ to: "/" });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled ? "border-b border-white/10 glass-strong py-1" : "border-b border-transparent py-2"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40 transition-transform group-hover:scale-110">
            <Camera className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            SnapBooth <span className="font-display italic text-gradient-blue">Studio</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 xl:flex">
          {publicNav.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium transition-all",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && <span className="absolute inset-0 -z-10 rounded-full bg-primary/10 ring-1 ring-inset ring-primary/20" />}
                {n.label}
              </Link>
            );
          })}
          {/* Admin dashboard link — only if admin */}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={cn(
                "relative rounded-full px-3 py-2 text-sm font-medium transition-all",
                pathname.startsWith("/admin") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {pathname.startsWith("/admin") && <span className="absolute inset-0 -z-10 rounded-full bg-primary/10 ring-1 ring-inset ring-primary/20" />}
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <DarkModeToggle theme={theme} toggle={toggle} />

          {user ? (
            // User menu dropdown
            <div className="relative hidden xl:block" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium transition hover:border-primary/40 hover:bg-white/10"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[100px] truncate">{user.name}</span>
                {user.role === "admin" && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">Admin</span>
                )}
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", userMenuOpen && "rotate-180")} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-border glass-strong py-2 shadow-2xl shadow-black/40">
                  <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="truncate">{user.email}</p>
                  </div>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5">
                      <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                    </Link>
                  )}
                  <Link to="/booking" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/5">
                    <Camera className="h-4 w-4 text-primary" /> Booking Studio
                  </Link>
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              <User className="h-4 w-4" /> Login
            </Link>
          )}

          {!user && (
            <Link
              to="/booking"
              className="hidden overflow-hidden rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all hover:-translate-y-0.5 xl:inline-block"
            >
              Booking Studio
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 xl:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden">
          <nav className="mx-4 mt-2 space-y-1 rounded-2xl border border-white/10 glass-strong p-3">
            {publicNav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to}
                  className={cn(
                    "block rounded-xl px-4 py-2.5 text-sm font-medium",
                    active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link to="/admin" className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            )}
            <div className="border-t border-white/10 pt-2 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium">{user.name}</span>
                    {user.role === "admin" && (
                      <span className="rounded-full bg-primary/20 px-1.5 text-[10px] font-bold uppercase text-primary">Admin</span>
                    )}
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block rounded-xl px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10">
                    Login
                  </Link>
                  <Link to="/booking" className="mt-1 block rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">
                    Booking Studio
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
