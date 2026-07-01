import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { Preloader } from "@/components/preloader";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-blue">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">Halaman yang kamu cari tidak tersedia.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-muted-foreground">Halaman ini gagal dimuat.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SnapBooth Studio — Book Your Studio. Capture Your Moment." },
      { name: "description", content: "Sewa studio photobooth dengan tema unik, frame estetik, dan pengalaman foto langsung yang mudah dipesan secara online." },
      { property: "og:title", content: "SnapBooth Studio" },
      { property: "og:description", content: "Studio photobooth rental premium. Booking mudah, frame eksklusif." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showPreloader, setShowPreloader] = useState(true);
  const handlePreloaderDone = useCallback(() => setShowPreloader(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      {showPreloader && <Preloader onDone={handlePreloaderDone} />}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
