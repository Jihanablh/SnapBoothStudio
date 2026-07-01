import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import { authStore } from "@/lib/auth-store";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Login — SnapBooth Studio" },
      { name: "description", content: "Masuk ke akun SnapBooth Studio kamu." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regPwConfirm, setRegPwConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const res = authStore.login(email, password);
    setLoading(false);
    if (!res.success) { setError(res.error ?? "Terjadi kesalahan."); return; }
    void navigate({ to: res.user?.role === "admin" ? "/admin" : "/" });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    if (!regName.trim()) { setRegError("Nama harus diisi."); return; }
    if (regPw !== regPwConfirm) { setRegError("Konfirmasi password tidak cocok."); return; }
    if (regPw.length < 6) { setRegError("Password minimal 6 karakter."); return; }
    setRegLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const res = authStore.register(regName, regEmail, regPw);
    setRegLoading(false);
    if (!res.success) { setRegError(res.error ?? "Terjadi kesalahan."); return; }
    void navigate({ to: "/" });
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-input/60 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-input focus:ring-4 focus:ring-primary/15";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      {/* Floating photo strips decoration */}
      {[
        { t: "5%",  l: "-2%", r: 6,  d: 0 },
        { t: "60%", l: "95%", r: -8, d: 0.3 },
        { t: "80%", l: "3%",  r: 4,  d: 0.5 },
        { t: "15%", l: "93%", r: -5, d: 0.2 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.18, y: 0 }}
          transition={{ delay: pos.d + 0.5, duration: 0.8 }}
          className="pointer-events-none absolute hidden lg:block"
          style={{ top: pos.t, left: pos.l, rotate: pos.r }}
        >
          <div className="h-40 w-12 rounded-xl border border-white/10 bg-gradient-to-b from-primary/30 to-accent/20" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </span>
            <span className="text-2xl font-bold">
              SnapBooth <span className="font-display italic text-gradient-blue">Studio</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Studio Photobooth Rental & Self Photo Experience</p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-2xl border border-border bg-secondary/30 p-1">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/40">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Selamat datang kembali! 👋</h2>
                <p className="mt-1 text-sm text-muted-foreground">Masuk untuk melanjutkan booking studio.</p>
              </div>

              {/* Demo hint */}
              <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs text-primary">
                <p className="font-semibold mb-1">Akun Demo:</p>
                <p>Admin: admin@snapbooth.com / admin123</p>
                <p>User: user@snapbooth.com / user123</p>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className={inputCls + " pl-10"}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputCls + " pl-10 pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full rounded-full bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Masuk...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Masuk <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <button type="button" onClick={() => setTab("register")} className="text-primary hover:underline font-medium">
                  Daftar sekarang
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Buat akun baru <Sparkles className="inline h-5 w-5 text-primary" /></h2>
                <p className="mt-1 text-sm text-muted-foreground">Daftar sebagai pelanggan studio photobooth.</p>
              </div>

              {regError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {regError}
                </div>
              )}

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Nama Lengkap</span>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nama kamu"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className={inputCls + " pl-10"}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={regPw}
                      onChange={(e) => setRegPw(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className={inputCls + " pl-10 pr-10"}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Konfirmasi Password</span>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={regPwConfirm}
                    onChange={(e) => setRegPwConfirm(e.target.value)}
                    placeholder="Ulangi password"
                    className={inputCls}
                  />
                </label>
                <div className="rounded-xl border border-border bg-secondary/30 px-4 py-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Role:</span> Pelanggan (User) — hanya admin yang bisa mengakses dashboard.
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="btn-glow w-full rounded-full bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
              >
                {regLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Mendaftar...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Daftar Sekarang <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-primary hover:underline font-medium">
                  Masuk
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition">← Kembali ke Beranda</Link>
        </p>
      </motion.div>
    </div>
  );
}
