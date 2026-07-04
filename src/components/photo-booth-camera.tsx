"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, RefreshCw, Download, CheckCircle2,
  VideoOff, Aperture, Trash2, X, BookOpen, Video,
} from "lucide-react";
import type { FrameId } from "@/lib/packages";
import { FRAMES } from "@/lib/packages";
import { FrameCanvas } from "./frame-canvas";
import { cn } from "@/lib/utils";

type PhotoCount = 2 | 3 | 4 | 6;
type CameraError = "none" | "denied" | "unavailable" | "nosecure";

// Photobooth strip slot aspect ratio: 3:4 (portrait)
const SLOT_W = 360;
const SLOT_H = 480;

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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      // Request portrait-friendly resolution
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width:  { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraActive(true);

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
          try { await video.play(); resolve(); }
          catch (err) { reject(err); }
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

  const triggerFlash = useCallback(() => {
    const el = flashRef.current;
    if (!el) return;
    el.style.opacity = "1";
    setTimeout(() => { if (el) el.style.opacity = "0"; }, 250);
  }, []);

  // Capture at fixed 3:4 ratio to match photobooth strip slots
  const capturePhoto = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !cameraReady) return null;

    const vW = video.videoWidth  || 640;
    const vH = video.videoHeight || 480;
    if (vW === 0 || vH === 0) return null;

    // Crop video to 3:4 ratio (portrait)
    const targetRatio = SLOT_W / SLOT_H; // 0.75
    const videoRatio  = vW / vH;

    let srcX = 0, srcY = 0, srcW = vW, srcH = vH;
    if (videoRatio > targetRatio) {
      // Video is wider — crop sides
      srcW = vH * targetRatio;
      srcX = (vW - srcW) / 2;
    } else {
      // Video is taller — crop top/bottom
      srcH = vW / targetRatio;
      srcY = (vH - srcH) / 2;
    }

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width  = SLOT_W;
    canvas.height = SLOT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Mirror (selfie)
    ctx.save();
    ctx.translate(SLOT_W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, srcX, srcY, srcW, srcH, 0, 0, SLOT_W, SLOT_H);
    ctx.restore();

    return canvas.toDataURL("image/png", 1.0);
  }, [cameraReady]);

  const startPhotoSession = useCallback(async () => {
    if (isCapturing || !cameraReady) return;
    setIsCapturing(true);
    setSessionDone(false);
    setCapturedPhotos([]);
    setResultCanvas(null);

    const taken: string[] = [];

    for (let i = 0; i < photoCount; i++) {
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

  const deletePhoto = (idx: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== idx));
    setResultCanvas(null);
    setSessionDone(false);
  };

  const resetAll = () => {
    setCapturedPhotos([]);
    setResultCanvas(null);
    setSessionDone(false);
  };

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

      {/* ── Main Layout: Camera (left/top) + Strip Preview (right/bottom) ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* ── Camera Column ─────────────────────────────────────── */}
        <div className="rounded-3xl border border-border bg-card/60 overflow-hidden">

          {/* Portrait camera frame — aspect-[3/4] */}
          <div className="relative mx-auto" style={{ maxWidth: 400 }}>
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-950 rounded-t-3xl">
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

              {/* Frame border overlay — decorative photobooth border */}
              {cameraReady && (
                <div className="pointer-events-none absolute inset-0 z-10 rounded-t-3xl ring-4 ring-primary/30" />
              )}

              {/* Video element — portrait, object-cover fills the 3:4 frame */}
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
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                          <span className="relative inline-flex h-4 w-4 rounded-full bg-primary" />
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">Aktifkan kamera untuk mulai photobooth</p>
                        <p className="mt-2 text-sm text-muted-foreground">Preview dalam frame vertikal photobooth</p>
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
                        <div className="h-full w-1/2 animate-[shimmer_1.2s_infinite] rounded-full bg-primary" />
                      </div>
                    </>
                  )}

                  {cameraError === "denied" && (
                    <>
                      <VideoOff className="h-12 w-12 text-destructive" />
                      <div>
                        <p className="font-semibold text-foreground">Akses kamera ditolak.</p>
                        <p className="mt-1 text-sm text-muted-foreground">Aktifkan izin kamera pada browser.</p>
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
                        <p className="mt-1 text-sm text-muted-foreground">Buka via localhost atau HTTPS.</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Status badges */}
              {cameraReady && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> LIVE
                </div>
              )}
              {cameraActive && !cameraReady && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" /> LOADING
                </div>
              )}

              {/* Shot counter */}
              {cameraActive && (
                <div className="absolute top-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  {capturedPhotos.length}/{photoCount}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="p-5 space-y-4">
            {/* Photo count selector */}
            <div className="flex flex-wrap items-center gap-3">
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

            <p className="text-xs text-muted-foreground">
              Kamu memilih <span className="font-semibold text-primary">{photoCount} foto</span>. Frame akan menampilkan {photoCount} slot foto.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {!photosComplete && !isCapturing && (
                <button
                  onClick={startPhotoSession}
                  disabled={!cameraReady || isCapturing}
                  className="btn-glow flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <Aperture className="h-4 w-4" />
                  {!cameraReady ? "Menunggu kamera..." : "Ambil Foto"}
                </button>
              )}

              {isCapturing && (
                <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-medium text-primary">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  Mengambil foto {capturedPhotos.length + 1}/{photoCount}...
                </div>
              )}

              {photosComplete && !isCapturing && (
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Selesai! ({photoCount}/{photoCount})
                </div>
              )}

              {capturedPhotos.length > 0 && (
                <button
                  onClick={resetAll}
                  disabled={isCapturing}
                  className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-medium transition hover:border-primary/40 disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" /> Ulangi
                </button>
              )}

              {cameraActive && (
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
                >
                  <VideoOff className="h-4 w-4" /> Matikan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Photo Strip Preview ─────────────── */}
        <div className="rounded-3xl border border-border bg-card/60 p-4 flex flex-col">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            Strip Preview
            <span className="ml-auto text-xs text-muted-foreground">{capturedPhotos.length}/{photoCount}</span>
          </p>

          {/* Vertical strip of photo slots */}
          <div
            className="flex flex-col gap-2 flex-1"
            style={{ minHeight: `${photoCount * 100 + (photoCount - 1) * 8}px` }}
          >
            {Array.from({ length: photoCount }).map((_, idx) => {
              const photo = capturedPhotos[idx];
              return (
                <div
                  key={idx}
                  className="relative group flex-1"
                  style={{ aspectRatio: "3/4", minHeight: 80 }}
                >
                  {photo ? (
                    <>
                      <img
                        src={photo}
                        alt={`Foto ${idx + 1}`}
                        className="h-full w-full rounded-xl border-2 border-primary/40 object-cover shadow-md shadow-black/30"
                      />
                      <button
                        onClick={() => deletePhoto(idx)}
                        className="absolute -top-1.5 -right-1.5 z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-md group-hover:flex"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {idx + 1}
                      </span>
                    </>
                  ) : (
                    <div className={cn(
                      "flex h-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed bg-background/30",
                      isCapturing && capturedPhotos.length === idx
                        ? "border-primary/60 bg-primary/5 animate-pulse"
                        : "border-border/50"
                    )}>
                      <Camera className="h-5 w-5 text-muted-foreground/30" />
                      <p className="text-[9px] text-muted-foreground/40 font-medium">#{idx + 1}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Frame Selector ─────────────────────────────────── */}
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
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
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
      <AnimatePresence>
        {capturedPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border border-border bg-card/60 p-5"
          >
            <p className="mb-4 text-sm font-semibold">
              Hasil Frame —{" "}
              <span className="text-primary">{FRAMES.find((f) => f.id === frameId)?.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{photoCount} foto</span>
            </p>
            <div className="mx-auto max-w-xs">
              <FrameCanvas
                key={`${frameId}-${photoCount}-${capturedPhotos.length}`}
                frameId={frameId}
                photos={capturedPhotos}
                photoCount={photoCount}
                width={320}
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
                    <BookOpen className="h-4 w-4" /> Booking Studio
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
      </AnimatePresence>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
