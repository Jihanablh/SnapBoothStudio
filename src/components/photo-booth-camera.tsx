"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  RefreshCw,
  Download,
  CheckCircle2,
  VideoOff,
  Aperture,
  Trash2,
  X,
  BookOpen,
  Video,
} from "lucide-react";
import type { FrameId } from "@/lib/packages";
import { FRAMES } from "@/lib/packages";
import { FrameCanvas } from "./frame-canvas";
import { cn } from "@/lib/utils";

type PhotoCount = 2 | 3 | 4 | 6;
type CameraError = "none" | "denied" | "unavailable" | "nosecure";

interface PhotoBoothCameraProps {
  selectedFrame?: FrameId;
  onFrameSelect?: (id: FrameId) => void;
}

export function PhotoBoothCamera({
  selectedFrame = "every-moment-blue",
  onFrameSelect,
}: PhotoBoothCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<CameraError>("none");
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [photoCount, setPhotoCount] = useState<PhotoCount>(4);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [frameId, setFrameId] = useState<FrameId>(selectedFrame);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
  const [sessionDone, setSessionDone] = useState(false);

  // Stop stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Check secure context
  const isSecure =
    typeof window !== "undefined" &&
    (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1");

  const startCamera = useCallback(async () => {
    if (!isSecure) { setCameraError("nosecure"); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError("unavailable"); return; }

    setCameraLoading(true);
    setCameraError("none");
    setCameraReady(false);

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width:  { ideal: 1280, min: 640 },
          height: { ideal: 720,  min: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);

      // Give React time to mount the video element
      await new Promise((r) => setTimeout(r, 100));

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        setCameraError("unavailable");
        setCameraLoading(false);
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = async () => {
          try {
            await video.play();
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        video.onerror = reject;
        setTimeout(() => reject(new Error("Video timeout")), 8000);
      });

      setCameraReady(true);
      setCameraLoading(false);
    } catch (err: unknown) {
      streamRef.current = null;
      setCameraActive(false);
      setCameraLoading(false);
      setCameraReady(false);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("denied");
        } else {
          setCameraError("unavailable");
        }
      } else {
        setCameraError("unavailable");
      }
    }
  }, [isSecure]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) { video.srcObject = null; }
    setCameraActive(false);
    setCameraReady(false);
    setCameraLoading(false);
  }, []);

  // Flash effect
  const triggerFlash = useCallback(() => {
    const el = flashRef.current;
    if (!el) return;
    el.style.opacity = "1";
    setTimeout(() => { if (el) el.style.opacity = "0"; }, 250);
  }, []);

  // Capture one photo using hidden canvas
  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !cameraReady) return null;

    const W = video.videoWidth  || video.clientWidth  || 640;
    const H = video.videoHeight || video.clientHeight || 480;

    if (W === 0 || H === 0) return null;

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Mirror (selfie cam)
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();

    return canvas.toDataURL("image/png", 1.0);
  }, [cameraReady]);

  // Full session — takes N photos with countdown between each
  const startPhotoSession = useCallback(async () => {
    if (isCapturing || !cameraReady) return;
    setIsCapturing(true);
    setSessionDone(false);
    setCapturedPhotos([]);
    setResultCanvas(null);

    const taken: string[] = [];

    for (let i = 0; i < photoCount; i++) {
      // Countdown 3 → 1
      for (let c = 3; c >= 1; c--) {
        setCountdown(c);
        await sleep(900);
      }
      setCountdown(null);
      await sleep(80);

      triggerFlash();
      const photo = capturePhoto();
      if (photo) {
        taken.push(photo);
        setCapturedPhotos([...taken]);
      }
      await sleep(700);
    }

    setIsCapturing(false);
    setSessionDone(true);
  }, [isCapturing, cameraReady, photoCount, capturePhoto, triggerFlash]);

  // Delete single photo
  const deletePhoto = (idx: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== idx));
    setResultCanvas(null);
    setSessionDone(false);
  };

  // Reset all
  const resetAll = () => {
    setCapturedPhotos([]);
    setResultCanvas(null);
    setSessionDone(false);
  };

  // Download
  const handleDownload = () => {
    if (!resultCanvas) return;
    const link = document.createElement("a");
    link.download = `snapbooth-${frameId}-${Date.now()}.png`;
    link.href = resultCanvas.toDataURL("image/png");
    link.click();
  };

  const handleFrameSelect = (id: FrameId) => {
    setFrameId(id);
    setResultCanvas(null);
    onFrameSelect?.(id);
  };

  const photosComplete = capturedPhotos.length >= photoCount;

  return (
    <div className="space-y-6">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Camera View ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
          {/* Flash overlay */}
          <div
            ref={flashRef}
            className="pointer-events-none absolute inset-0 z-30 bg-white opacity-0"
            style={{ transition: "opacity 0.08s ease" }}
          />

          {/* Countdown overlay */}
          <AnimatePresence>
            {countdown !== null && (
              <motion.div
                key={countdown}
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              >
                <span
                  className="text-[9rem] font-black tabular-nums leading-none text-white drop-shadow-2xl"
                  style={{ textShadow: "0 0 60px rgba(99,179,255,0.9), 0 4px 20px rgba(0,0,0,0.8)" }}
                >
                  {countdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video element — always in DOM when camera is active so ref stays stable */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              !cameraActive ? "hidden" : ""
            )}
            style={{ transform: "scaleX(-1)" }}
          />

          {/* Placeholder / error state */}
          {!cameraActive && (
            <div className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
              {cameraError === "none" && !cameraLoading && (
                <>
                  <div className="relative grid h-24 w-24 place-items-center rounded-3xl bg-primary/15 ring-4 ring-primary/20">
                    <Camera className="h-12 w-12 text-primary" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary" />
                      <span className="relative inline-flex h-4 w-4 rounded-full bg-primary" />
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">Coba kamera photobooth langsung dari browser kamu.</p>
                    <p className="mt-2 text-sm text-muted-foreground">Aktifkan kamera, ambil foto, pilih frame, lalu simpan hasilnya.</p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="btn-glow rounded-full bg-gradient-to-r from-primary to-accent px-8 py-4 text-sm font-semibold text-primary-foreground"
                  >
                    <span className="flex items-center gap-2"><Video className="h-4 w-4" /> Aktifkan Kamera</span>
                  </button>
                </>
              )}

              {cameraLoading && (
                <>
                  <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/15 ring-4 ring-primary/20 animate-pulse">
                    <Camera className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Memuat kamera...</p>
                  <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/2 animate-shine rounded-full bg-primary" />
                  </div>
                </>
              )}

              {cameraError === "denied" && (
                <>
                  <VideoOff className="h-12 w-12 text-destructive" />
                  <div>
                    <p className="font-semibold text-foreground">Akses kamera ditolak.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aktifkan izin kamera pada browser untuk menggunakan fitur photobooth.
                    </p>
                  </div>
                  <button onClick={startCamera} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                    Coba Lagi
                  </button>
                </>
              )}

              {cameraError === "unavailable" && (
                <>
                  <VideoOff className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Kamera tidak tersedia di perangkat ini.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Kamu tetap bisa melanjutkan booking studio.</p>
                  </div>
                </>
              )}

              {cameraError === "nosecure" && (
                <>
                  <VideoOff className="h-12 w-12 text-amber-400" />
                  <div>
                    <p className="font-semibold">Kamera membutuhkan koneksi HTTPS.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Buka website melalui localhost atau HTTPS untuk menggunakan fitur kamera.</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Status badge */}
          {cameraReady && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> LIVE
            </div>
          )}
          {cameraActive && !cameraReady && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-yellow-400" /> LOADING
            </div>
          )}
          {!cameraActive && cameraError === "none" && (
            <div className="absolute top-4 right-4 z-10 hidden md:flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white/60 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-white/30" /> CAMERA OFF
            </div>
          )}
        </div>

        {/* Controls (only when camera active) */}
        {cameraActive && (
          <div className="border-t border-border p-5">
            {/* Photo count selector */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm font-medium text-muted-foreground">Jumlah foto:</span>
              {([2, 3, 4, 6] as PhotoCount[]).map((n) => (
                <button
                  key={n}
                  onClick={() => { setPhotoCount(n); resetAll(); }}
                  disabled={isCapturing}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition disabled:opacity-50",
                    photoCount === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {n} foto
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {!photosComplete && !isCapturing && (
                <button
                  onClick={startPhotoSession}
                  disabled={!cameraReady || isCapturing}
                  className="btn-glow flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <Aperture className="h-4 w-4" />
                  {!cameraReady ? "Menunggu kamera..." : "Ambil Foto"}
                </button>
              )}

              {isCapturing && (
                <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-3.5 text-sm font-medium text-primary">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  Mengambil foto {capturedPhotos.length + 1}/{photoCount}...
                </div>
              )}

              {photosComplete && !isCapturing && (
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Foto Sudah Lengkap ({photoCount}/{photoCount})
                </div>
              )}

              {capturedPhotos.length > 0 && (
                <button
                  onClick={resetAll}
                  disabled={isCapturing}
                  className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3.5 text-sm font-semibold transition hover:border-primary/40 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" /> Ulangi Semua Foto
                </button>
              )}

              {resultCanvas && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  <Download className="h-4 w-4" /> Download Hasil
                </button>
              )}

              <button
                onClick={stopCamera}
                className="flex items-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
              >
                <VideoOff className="h-4 w-4" /> Matikan Kamera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Photo Thumbnails ─────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Foto yang diambil{" "}
            <span className="text-muted-foreground">({capturedPhotos.length}/{photoCount})</span>
          </p>
          {capturedPhotos.length > 0 && (
            <button
              onClick={resetAll}
              className="text-xs text-muted-foreground hover:text-destructive transition"
            >
              Hapus semua
            </button>
          )}
        </div>

        {/* Grid — placeholder slots */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: photoCount }).map((_, idx) => {
            const photo = capturedPhotos[idx];
            return (
              <div key={idx} className="relative group aspect-[4/5]">
                {photo ? (
                  <>
                    <img
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full rounded-2xl border-2 border-primary/30 object-cover shadow-lg shadow-black/30"
                    />
                    {/* Delete button on hover */}
                    <button
                      onClick={() => deletePhoto(idx)}
                      className="absolute -top-2 -right-2 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-md group-hover:flex"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {/* Number badge */}
                    <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {idx + 1}
                    </span>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-background/30">
                    <Camera className="h-7 w-7 text-muted-foreground/40" />
                    <p className="text-[10px] text-muted-foreground/50">Belum ada foto</p>
                    <p className="text-[9px] font-semibold text-muted-foreground/30">#{idx + 1}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sessionDone && capturedPhotos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={startPhotoSession}
              disabled={isCapturing || !cameraReady}
              className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2.5 text-xs font-semibold hover:border-primary/40 disabled:opacity-50 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Ulangi Semua Foto
            </button>
            {resultCanvas && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                >
                  <Download className="h-3.5 w-3.5" /> Download Hasil
                </button>
                <a
                  href="/booking"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-xs font-semibold text-primary-foreground"
                >
                  <BookOpen className="h-3.5 w-3.5" /> Gunakan untuk Booking
                </a>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Frame Selector ─────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card/60 p-5">
        <p className="mb-4 text-sm font-semibold">Pilih Frame Photobooth</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FRAMES.map((f) => {
            const active = frameId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => handleFrameSelect(f.id)}
                className={cn(
                  "group rounded-2xl border p-3 text-left transition-all hover:-translate-y-1",
                  active
                    ? "border-primary bg-primary/10 glow-border-blue shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{f.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{f.name}</p>
                    <span className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      active ? "bg-primary text-primary-foreground" : "border border-border bg-secondary text-muted-foreground",
                    )}>
                      {f.badge}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Frame Result Preview ─────────────────────────── */}
      {capturedPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-border bg-card/60 p-5"
        >
          <p className="mb-4 text-sm font-semibold">
            Preview Hasil — Frame <span className="text-primary">{FRAMES.find((f) => f.id === frameId)?.name}</span>
          </p>
          <div className="mx-auto max-w-sm">
            <FrameCanvas
              key={`${frameId}-${capturedPhotos.length}`}
              frameId={frameId}
              photos={capturedPhotos}
              width={400}
              className="w-full rounded-2xl shadow-2xl shadow-black/40"
              onReady={(canvas) => setResultCanvas(canvas)}
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {resultCanvas && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition"
                >
                  <Download className="h-4 w-4" /> Download Hasil
                </button>
                <a
                  href="/booking"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <BookOpen className="h-4 w-4" /> Gunakan untuk Booking
                </a>
              </>
            )}
            <button
              onClick={resetAll}
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-destructive/40 hover:text-destructive transition"
            >
              <Trash2 className="h-4 w-4" /> Hapus Foto
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
