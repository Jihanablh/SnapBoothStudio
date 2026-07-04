import { useEffect, useRef } from "react";
import type { FrameId } from "@/lib/packages";

// Slot aspect ratio: 3:4 (portrait) — same as camera capture
const SLOT_RATIO = 3 / 4;

interface FrameCanvasProps {
  frameId: FrameId;
  photos: string[];   // base64 or blob URLs
  photoCount?: number; // 2 | 3 | 4 | 6 — drives layout
  width?: number;
  className?: string;
  onReady?: (canvas: HTMLCanvasElement) => void;
}

export function FrameCanvas({
  frameId,
  photos,
  photoCount,
  width = 400,
  className = "",
  onReady,
}: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const n = photoCount ?? Math.max(photos.length, 2);
  const height = computeHeight(width, n);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = width;
    canvas.height = height;
    void drawFrame(canvas, frameId, photos, n, width, height, onReady);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameId, photos, photoCount, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ width: "100%", height: "auto" }}
    />
  );
}

// ── Height = header + N slots (3:4) + gaps + footer ──────────────────────────
function computeHeight(W: number, n: number): number {
  const HEADER  = Math.round(W * 0.22);
  const FOOTER  = Math.round(W * 0.12);
  const GAP     = Math.round(W * 0.03);
  const PADDING = Math.round(W * 0.05);
  const slotW   = W - PADDING * 2;
  const slotH   = Math.round(slotW * (1 / SLOT_RATIO));
  return HEADER + n * slotH + (n - 1) * GAP + FOOTER + PADDING;
}

// ── Layout helper ─────────────────────────────────────────────────────────────
interface FrameLayout {
  W: number;
  H: number;
  HEADER: number;
  FOOTER_Y: number;
  FOOTER_H: number;
  PAD: number;
  GAP: number;
  slotW: number;
  slotH: number;
  slots: { x: number; y: number; w: number; h: number }[];
}

function getLayout(W: number, H: number, n: number): FrameLayout {
  const HEADER  = Math.round(W * 0.22);
  const FOOTER_H = Math.round(W * 0.12);
  const GAP     = Math.round(W * 0.03);
  const PAD     = Math.round(W * 0.05);
  const slotW   = W - PAD * 2;
  const slotH   = Math.round(slotW * (1 / SLOT_RATIO));
  const FOOTER_Y = H - FOOTER_H;

  const slots = Array.from({ length: n }, (_, i) => ({
    x: PAD,
    y: HEADER + i * (slotH + GAP),
    w: slotW,
    h: slotH,
  }));

  return { W, H, HEADER, FOOTER_Y, FOOTER_H, PAD, GAP, slotW, slotH, slots };
}

// ── Main draw dispatcher ──────────────────────────────────────────────────────
async function drawFrame(
  canvas: HTMLCanvasElement,
  frameId: FrameId,
  photos: string[],
  n: number,
  W: number,
  H: number,
  onReady?: (canvas: HTMLCanvasElement) => void,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const layout = getLayout(W, H, n);

  switch (frameId) {
    case "vintage-telephone":  await drawVintageTelephone(ctx, layout, photos, n); break;
    case "every-moment-blue":  await drawEveryMomentBlue(ctx, layout, photos, n);  break;
    case "pixie-film-cinema":  await drawPixieFilmCinema(ctx, layout, photos, n);  break;
    case "good-times-newspaper": await drawGoodTimesNewspaper(ctx, layout, photos, n); break;
  }
  onReady?.(canvas);
}

// ── Frame 1: Vintage Telephone ─────────────────────────────────────────────
async function drawVintageTelephone(
  ctx: CanvasRenderingContext2D,
  l: FrameLayout,
  photos: string[],
  n: number,
) {
  const { W, H, HEADER, FOOTER_Y, FOOTER_H, PAD, slots } = l;

  // Background
  ctx.fillStyle = "#f5e6c8";
  ctx.fillRect(0, 0, W, H);

  // Double border
  ctx.strokeStyle = "#c8102e"; ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, W - 12, H - 12);
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 1.5;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  // Red header bar
  ctx.fillStyle = "#c8102e";
  ctx.fillRect(12, 12, W - 24, HEADER - 12);

  ctx.fillStyle = "#f5e6c8";
  ctx.font = `bold ${Math.round(W * 0.1)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("TELEPHONE", W / 2, HEADER * 0.55);

  ctx.font = `italic ${Math.round(W * 0.04)}px serif`;
  ctx.fillText("Photo Box · Studio Edition", W / 2, HEADER * 0.82);

  // Slot label count
  ctx.fillStyle = "#9a8570";
  ctx.font = `${Math.round(W * 0.03)}px serif`;
  ctx.fillText(`${n} foto · SnapBooth`, W / 2, HEADER - 4);

  // Photo slots
  for (let i = 0; i < n; i++) {
    const s = slots[i];
    await drawPhotoSlot(ctx, s.x, s.y, s.w, s.h, photos[i], "#e8d5b0", 8);
    // Red border
    ctx.strokeStyle = "#c8102e"; ctx.lineWidth = 2;
    roundedRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.stroke();
  }

  // Footer
  ctx.fillStyle = "#c8102e";
  ctx.fillRect(12, FOOTER_Y, W - 24, FOOTER_H - 12);
  ctx.fillStyle = "#f5e6c8";
  ctx.font = `bold ${Math.round(W * 0.065)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("Red Phone", W / 2, FOOTER_Y + FOOTER_H * 0.5);
  ctx.font = `${Math.round(W * 0.025)}px monospace`;
  ctx.fillStyle = "rgba(245,230,200,0.7)";
  ctx.fillText(new Date().toLocaleDateString("id-ID"), W / 2, H - 10);
}

// ── Frame 2: Every Moment Blue ─────────────────────────────────────────────
async function drawEveryMomentBlue(
  ctx: CanvasRenderingContext2D,
  l: FrameLayout,
  photos: string[],
  n: number,
) {
  const { W, H, HEADER, FOOTER_Y, FOOTER_H, PAD, slots } = l;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Blue header
  ctx.fillStyle = "#1a56db";
  ctx.fillRect(0, 0, W, HEADER);

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.round(W * 0.09)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("EVERY MOMENT", W / 2, HEADER * 0.48);
  ctx.font = `bold ${Math.round(W * 0.045)}px sans-serif`;
  ctx.fillText(`${n} foto • SnapBooth Studio`, W / 2, HEADER * 0.78);

  // Blue accent line below header
  ctx.fillStyle = "#1244a8";
  ctx.fillRect(0, HEADER, W, 4);

  // Photos
  for (let i = 0; i < n; i++) {
    const s = slots[i];
    await drawPhotoSlot(ctx, s.x, s.y, s.w, s.h, photos[i], "#e8f0fe", 10);
    ctx.strokeStyle = "#1a56db"; ctx.lineWidth = 2;
    roundedRect(ctx, s.x, s.y, s.w, s.h, 10); ctx.stroke();
  }

  // Blue footer
  ctx.fillStyle = "#1a56db";
  ctx.fillRect(0, FOOTER_Y, W, FOOTER_H);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(W * 0.045)}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("SnapBooth Studio", PAD, FOOTER_Y + FOOTER_H * 0.45);
  ctx.font = `${Math.round(W * 0.03)}px monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(new Date().toLocaleDateString("id-ID"), PAD, FOOTER_Y + FOOTER_H * 0.75);

  // Barcode decoration
  ctx.fillStyle = "#ffffff";
  for (let b = 0; b < 20; b++) {
    ctx.fillRect(W - 70 + b * 3, FOOTER_Y + FOOTER_H * 0.2, b % 3 === 0 ? 1 : 2, FOOTER_H * 0.6);
  }
}

// ── Frame 3: Pixie Film Cinema ─────────────────────────────────────────────
async function drawPixieFilmCinema(
  ctx: CanvasRenderingContext2D,
  l: FrameLayout,
  photos: string[],
  n: number,
) {
  const { W, H, HEADER, FOOTER_Y, FOOTER_H, PAD, slots } = l;

  ctx.fillStyle = "#f5e6c8";
  ctx.fillRect(0, 0, W, H);

  // Burgundy borders
  const B = 8;
  ctx.fillStyle = "#6b2737";
  ctx.fillRect(0, 0, W, B); ctx.fillRect(0, H - B, W, B);
  ctx.fillRect(0, 0, B, H); ctx.fillRect(W - B, 0, B, H);

  // Header
  ctx.fillStyle = "#6b2737";
  ctx.font = `900 ${Math.round(W * 0.065)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("PIXIE FILM CINEMA", W / 2, HEADER * 0.42);
  ctx.font = `italic ${Math.round(W * 0.036)}px serif`;
  ctx.fillText('"Your soul, our lens"', W / 2, HEADER * 0.68);
  ctx.font = `${Math.round(W * 0.03)}px monospace`;
  ctx.fillStyle = "#9a6a50";
  ctx.fillText(`${n} exposures`, W / 2, HEADER * 0.88);

  // Rule
  ctx.strokeStyle = "#6b2737"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(B + 10, HEADER - 2); ctx.lineTo(W - B - 10, HEADER - 2); ctx.stroke();

  // Photo slots
  for (let i = 0; i < n; i++) {
    const s = slots[i];
    await drawPhotoSlot(ctx, s.x, s.y, s.w, s.h, photos[i], "#e0c9a8", 6);
    ctx.strokeStyle = "#6b2737"; ctx.lineWidth = 1.5;
    roundedRect(ctx, s.x, s.y, s.w, s.h, 6); ctx.stroke();
  }

  // Footer
  ctx.strokeStyle = "#6b2737"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(B + 10, FOOTER_Y - 2); ctx.lineTo(W - B - 10, FOOTER_Y - 2); ctx.stroke();

  ctx.fillStyle = "#6b2737";
  ctx.font = `bold ${Math.round(W * 0.05)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("SnapBooth Studio", W / 2, FOOTER_Y + FOOTER_H * 0.4);
  ctx.font = `${Math.round(W * 0.028)}px monospace`;
  ctx.fillStyle = "#5a4030";
  ctx.fillText(new Date().toLocaleDateString("id-ID"), W / 2, FOOTER_Y + FOOTER_H * 0.7);

  // Barcode
  ctx.fillStyle = "#6b2737";
  for (let b = 0; b < 18; b++) {
    ctx.fillRect(W / 2 - 40 + b * 4.5, FOOTER_Y + FOOTER_H * 0.78, b % 3 === 0 ? 2 : 3, FOOTER_H * 0.2);
  }
}

// ── Frame 4: Good Times Newspaper ─────────────────────────────────────────
async function drawGoodTimesNewspaper(
  ctx: CanvasRenderingContext2D,
  l: FrameLayout,
  photos: string[],
  n: number,
) {
  const { W, H, HEADER, FOOTER_Y, FOOTER_H, PAD, slots } = l;

  ctx.fillStyle = "#f0ede8";
  ctx.fillRect(0, 0, W, H);

  // Masthead
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `900 ${Math.round(W * 0.052)}px "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.fillText("THE SNAPBOOTH GAZETTE", W / 2, HEADER * 0.28);

  // Double rule
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(10, HEADER * 0.35); ctx.lineTo(W - 10, HEADER * 0.35); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(10, HEADER * 0.40); ctx.lineTo(W - 10, HEADER * 0.40); ctx.stroke();

  // Headline
  ctx.font = `900 ${Math.round(W * 0.08)}px "Times New Roman", serif`;
  ctx.fillText("GOOD TIMES", W / 2, HEADER * 0.65);
  ctx.font = `900 ${Math.round(W * 0.056)}px "Times New Roman", serif`;
  ctx.fillText(`${n} SHOTS TODAY!`, W / 2, HEADER * 0.88);

  // Sub-rule
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(10, HEADER - 4); ctx.lineTo(W - 10, HEADER - 4); ctx.stroke();

  // Photo slots
  for (let i = 0; i < n; i++) {
    const s = slots[i];
    await drawPhotoSlot(ctx, s.x, s.y, s.w, s.h, photos[i], "#ddd9d2", 4);
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 1.5;
    roundedRect(ctx, s.x, s.y, s.w, s.h, 4); ctx.stroke();

    // Caption label
    ctx.fillStyle = "#3a3530";
    ctx.font = `${Math.round(W * 0.026)}px "Times New Roman", serif`;
    ctx.textAlign = "center";
    ctx.fillText(`Fig. ${i + 1}`, s.x + s.w / 2, s.y + s.h + Math.round(W * 0.025));
  }

  // Footer rule
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(10, FOOTER_Y - 2); ctx.lineTo(W - 10, FOOTER_Y - 2); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(10, FOOTER_Y + 2); ctx.lineTo(W - 10, FOOTER_Y + 2); ctx.stroke();

  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${Math.round(W * 0.033)}px monospace`;
  ctx.textAlign = "left";
  ctx.fillText(new Date().toLocaleDateString("id-ID"), PAD, FOOTER_Y + FOOTER_H * 0.55);
  ctx.textAlign = "right";
  ctx.fillText("SnapBooth Studio · Vol. 1", W - PAD, FOOTER_Y + FOOTER_H * 0.55);
}

// ── Shared Helpers ────────────────────────────────────────────────────────────
async function drawPhotoSlot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  src: string | undefined,
  placeholderColor: string,
  radius: number,
) {
  if (src) {
    try {
      const img = await loadImage(src);
      ctx.save();
      roundedRect(ctx, x, y, w, h, radius);
      ctx.clip();
      // object-fit: cover
      const imgR = img.naturalWidth / img.naturalHeight;
      const slotR = w / h;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (imgR > slotR) {
        sw = img.naturalHeight * slotR;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / slotR;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
      ctx.restore();
      return;
    } catch { /* fall through to placeholder */ }
  }
  // Placeholder
  ctx.fillStyle = placeholderColor;
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.font = `${Math.round(Math.min(w, h) * 0.25)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("📷", x + w / 2, y + h / 2 + Math.round(Math.min(w, h) * 0.08));
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.font = `${Math.round(w * 0.07)}px sans-serif`;
  ctx.fillText("Photo Slot", x + w / 2, y + h * 0.65);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
