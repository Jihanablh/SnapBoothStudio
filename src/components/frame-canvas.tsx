import { useEffect, useRef } from "react";
import type { FrameId } from "@/lib/packages";

interface FrameCanvasProps {
  frameId: FrameId;
  photos: string[]; // base64 or blob URLs
  width?: number;
  className?: string;
  onReady?: (canvas: HTMLCanvasElement) => void;
}

export function FrameCanvas({
  frameId,
  photos,
  width = 400,
  className = "",
  onReady,
}: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawFrame(canvas, frameId, photos, width, onReady);
  }, [frameId, photos, width, onReady]);

  const height = getFrameHeight(frameId, width);

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

function getFrameHeight(frameId: FrameId, w: number): number {
  switch (frameId) {
    case "vintage-telephone":
      return Math.round(w * 2.4);
    case "every-moment-blue":
      return Math.round(w * 1.5);
    case "pixie-film-cinema":
      return Math.round(w * 1.6);
    case "good-times-newspaper":
      return Math.round(w * 1.4);
    default:
      return Math.round(w * 2);
  }
}

async function drawFrame(
  canvas: HTMLCanvasElement,
  frameId: FrameId,
  photos: string[],
  _w: number,
  onReady?: (canvas: HTMLCanvasElement) => void,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  switch (frameId) {
    case "vintage-telephone":
      await drawVintageTelephone(ctx, W, H, photos);
      break;
    case "every-moment-blue":
      await drawEveryMomentBlue(ctx, W, H, photos);
      break;
    case "pixie-film-cinema":
      await drawPixieFilmCinema(ctx, W, H, photos);
      break;
    case "good-times-newspaper":
      await drawGoodTimesNewspaper(ctx, W, H, photos);
      break;
  }

  onReady?.(canvas);
}

// ── Frame 1: Vintage Telephone ─────────────────────────────────────────────
async function drawVintageTelephone(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  photos: string[],
) {
  // Background: cream
  ctx.fillStyle = "#f5e6c8";
  ctx.fillRect(0, 0, W, H);

  // Border ornament
  ctx.strokeStyle = "#c8102e";
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Header
  ctx.fillStyle = "#c8102e";
  ctx.fillRect(18, 18, W - 36, 70);

  ctx.fillStyle = "#f5e6c8";
  ctx.font = `bold ${Math.round(W * 0.08)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("TELEPHONE", W / 2, 58);

  // Subheader
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `italic ${Math.round(W * 0.045)}px serif`;
  ctx.fillText("Photo Box · Studio Edition", W / 2, 102);

  // Photos
  const photoH = Math.round((H - 200) / Math.max(photos.length, 1));
  const photoW = W - 50;
  for (let i = 0; i < Math.min(photos.length, 3); i++) {
    const ph = photos[i];
    if (ph) {
      try {
        const img = await loadImage(ph);
        ctx.save();
        roundedRect(ctx, 25, 115 + i * (photoH + 10), photoW, photoH - 10, 8);
        ctx.clip();
        ctx.drawImage(img, 25, 115 + i * (photoH + 10), photoW, photoH - 10);
        ctx.restore();
        // Border around photo
        ctx.strokeStyle = "#c8102e";
        ctx.lineWidth = 2;
        roundedRect(ctx, 25, 115 + i * (photoH + 10), photoW, photoH - 10, 8);
        ctx.stroke();
      } catch (_) {
        // placeholder
        ctx.fillStyle = "#e8d5b0";
        roundedRect(ctx, 25, 115 + i * (photoH + 10), photoW, photoH - 10, 8);
        ctx.fill();
        ctx.fillStyle = "#9a8570";
        ctx.font = `${Math.round(W * 0.04)}px sans-serif`;
        ctx.fillText("📷", W / 2, 115 + i * (photoH + 10) + (photoH - 10) / 2 + 8);
      }
    } else {
      ctx.fillStyle = "#e8d5b0";
      roundedRect(ctx, 25, 115 + i * (photoH + 10), photoW, photoH - 10, 8);
      ctx.fill();
      ctx.fillStyle = "#9a8570";
      ctx.font = `${Math.round(W * 0.06)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("📷", W / 2, 115 + i * (photoH + 10) + (photoH - 10) / 2 + 12);
    }
  }

  // Footer
  ctx.fillStyle = "#c8102e";
  ctx.fillRect(18, H - 62, W - 36, 44);
  ctx.fillStyle = "#f5e6c8";
  ctx.font = `bold ${Math.round(W * 0.06)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("Red Phone", W / 2, H - 33);

  // Bottom ornament line
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `${Math.round(W * 0.025)}px monospace`;
  ctx.fillText(
    new Date().toLocaleDateString("id-ID"),
    W / 2,
    H - 15,
  );
}

// ── Frame 2: Every Moment Blue ─────────────────────────────────────────────
async function drawEveryMomentBlue(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  photos: string[],
) {
  // Background: white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Blue top bar
  ctx.fillStyle = "#1a56db";
  ctx.fillRect(0, 0, W, H * 0.12);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.round(W * 0.1)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("EVERY MOMENT", W / 2, H * 0.09);

  // Photos grid — 2 columns
  const cols = 2;
  const rows = Math.ceil(Math.min(photos.length || 2, 4) / cols);
  const gap = 8;
  const pW = (W - gap * (cols + 1)) / cols;
  const pH = (H * 0.72 - gap * (rows + 1)) / rows;
  const startY = H * 0.14;

  for (let i = 0; i < Math.min(photos.length || 0, 4); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gap + col * (pW + gap);
    const y = startY + row * (pH + gap);

    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        ctx.save();
        roundedRect(ctx, x, y, pW, pH, 10);
        ctx.clip();
        ctx.drawImage(img, x, y, pW, pH);
        ctx.restore();
      } catch (_) {
        drawPhotoPlaceholder(ctx, x, y, pW, pH, "#e8f0fe");
      }
    } else {
      drawPhotoPlaceholder(ctx, x, y, pW, pH, "#e8f0fe");
    }

    // Blue border
    ctx.strokeStyle = "#1a56db";
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, pW, pH, 10);
    ctx.stroke();
  }

  // Bottom section
  const bottomY = H * 0.88;
  ctx.fillStyle = "#1a56db";
  ctx.fillRect(0, bottomY, W, H - bottomY);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(W * 0.045)}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("SnapBooth Studio", 15, bottomY + 22);

  ctx.font = `${Math.round(W * 0.03)}px monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(
    new Date().toLocaleDateString("id-ID"),
    15,
    bottomY + 40,
  );

  // Barcode decoration
  ctx.fillStyle = "#ffffff";
  for (let b = 0; b < 20; b++) {
    ctx.fillRect(W - 70 + b * 3, bottomY + 10, b % 3 === 0 ? 1 : 2, 30);
  }

  // Version
  ctx.font = `bold ${Math.round(W * 0.03)}px monospace`;
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("1.0", W - 12, H - 10);
}

// ── Frame 3: Pixie Film Cinema ─────────────────────────────────────────────
async function drawPixieFilmCinema(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  photos: string[],
) {
  // Background: cream
  ctx.fillStyle = "#f5e6c8";
  ctx.fillRect(0, 0, W, H);

  // Outer border — burgundy
  ctx.fillStyle = "#6b2737";
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H - 8, W, 8);
  ctx.fillRect(0, 0, 8, H);
  ctx.fillRect(W - 8, 0, 8, H);

  // Header
  ctx.fillStyle = "#6b2737";
  ctx.font = `900 ${Math.round(W * 0.055)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("PIXIE FILM CINEMA", W / 2, 45);

  ctx.fillStyle = "#5a4030";
  ctx.font = `italic ${Math.round(W * 0.035)}px serif`;
  ctx.fillText('"Your soul, our lens"', W / 2, 70);

  // Horizontal rule
  ctx.strokeStyle = "#6b2737";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 80);
  ctx.lineTo(W - 20, 80);
  ctx.stroke();

  // 2x2 photo grid
  const gap = 8;
  const pW = (W - 32 - gap) / 2;
  const pH = pW;
  const startY = 90;

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 16 + col * (pW + gap);
    const y = startY + row * (pH + gap);

    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        ctx.save();
        roundedRect(ctx, x, y, pW, pH, 6);
        ctx.clip();
        ctx.drawImage(img, x, y, pW, pH);
        ctx.restore();
      } catch (_) {
        drawPhotoPlaceholder(ctx, x, y, pW, pH, "#e0c9a8");
      }
    } else {
      drawPhotoPlaceholder(ctx, x, y, pW, pH, "#e0c9a8");
    }

    ctx.strokeStyle = "#6b2737";
    ctx.lineWidth = 1.5;
    roundedRect(ctx, x, y, pW, pH, 6);
    ctx.stroke();
  }

  // Footer
  const footerY = startY + 2 * (pH + gap) + 10;
  ctx.strokeStyle = "#6b2737";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, footerY);
  ctx.lineTo(W - 20, footerY);
  ctx.stroke();

  ctx.fillStyle = "#6b2737";
  ctx.font = `bold ${Math.round(W * 0.045)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("SnapBooth Studio", W / 2, footerY + 24);

  ctx.fillStyle = "#5a4030";
  ctx.font = `${Math.round(W * 0.03)}px monospace`;
  ctx.fillText(
    new Date().toLocaleDateString("id-ID"),
    W / 2,
    footerY + 44,
  );

  // Barcode decoration
  ctx.fillStyle = "#6b2737";
  for (let b = 0; b < 18; b++) {
    ctx.fillRect(W / 2 - 40 + b * 4.5, footerY + 52, b % 3 === 0 ? 2 : 3, 18);
  }
}

// ── Frame 4: Good Times Newspaper ─────────────────────────────────────────
async function drawGoodTimesNewspaper(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  photos: string[],
) {
  // Background: off-white newspaper
  ctx.fillStyle = "#f0ede8";
  ctx.fillRect(0, 0, W, H);

  // Masthead
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `900 ${Math.round(W * 0.055)}px "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.fillText("THE SNAPBOOTH GAZETTE", W / 2, 36);

  // Rule
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, 44);
  ctx.lineTo(W - 10, 44);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 48);
  ctx.lineTo(W - 10, 48);
  ctx.stroke();

  // Headline
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `900 ${Math.round(W * 0.075)}px "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.fillText("GOOD TIMES", W / 2, 85);
  ctx.fillText("TODAY!", W / 2, 120);

  // Sub-headline rule
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 128);
  ctx.lineTo(W - 10, 128);
  ctx.stroke();

  // Main photo
  const mainPhotoH = Math.round(H * 0.35);
  if (photos[0]) {
    try {
      const img = await loadImage(photos[0]);
      ctx.save();
      roundedRect(ctx, 10, 134, W - 20, mainPhotoH, 4);
      ctx.clip();
      ctx.drawImage(img, 10, 134, W - 20, mainPhotoH);
      ctx.restore();
    } catch (_) {
      drawPhotoPlaceholder(ctx, 10, 134, W - 20, mainPhotoH, "#ddd9d2");
    }
  } else {
    drawPhotoPlaceholder(ctx, 10, 134, W - 20, mainPhotoH, "#ddd9d2");
  }
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, 10, 134, W - 20, mainPhotoH, 4);
  ctx.stroke();

  // Dummy columns text
  const colY = 134 + mainPhotoH + 8;
  const colH = 50;
  const colW = (W - 24) / 2;
  ctx.fillStyle = "#3a3530";
  ctx.font = `${Math.round(W * 0.028)}px "Times New Roman", serif`;
  ctx.textAlign = "left";
  const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  wrapText(ctx, lorem, 10, colY + 12, colW - 4, Math.round(W * 0.03) + 2);
  wrapText(ctx, lorem, 14 + colW, colY + 12, colW - 4, Math.round(W * 0.03) + 2);

  // Separator
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2, colY);
  ctx.lineTo(W / 2, colY + colH);
  ctx.stroke();

  // Small photos row
  const smallY = colY + colH + 8;
  const smallPhotoCount = Math.min(photos.length, 3) - 1;
  const smallW = (W - 20 - (smallPhotoCount - 1) * 6) / Math.max(smallPhotoCount, 2);
  const smallH = Math.round(smallW * 0.75);

  for (let i = 1; i <= 2; i++) {
    const x = 10 + (i - 1) * (smallW + 6);
    if (photos[i]) {
      try {
        const img = await loadImage(photos[i]);
        ctx.save();
        roundedRect(ctx, x, smallY, smallW, smallH, 3);
        ctx.clip();
        ctx.drawImage(img, x, smallY, smallW, smallH);
        ctx.restore();
      } catch (_) {
        drawPhotoPlaceholder(ctx, x, smallY, smallW, smallH, "#ddd9d2");
      }
    } else {
      drawPhotoPlaceholder(ctx, x, smallY, smallW, smallH, "#ddd9d2");
    }
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    roundedRect(ctx, x, smallY, smallW, smallH, 3);
    ctx.stroke();
  }

  // Footer rule + date
  const footerY = H - 36;
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, footerY);
  ctx.lineTo(W - 10, footerY);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, footerY + 4);
  ctx.lineTo(W - 10, footerY + 4);
  ctx.stroke();

  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${Math.round(W * 0.035)}px monospace`;
  ctx.textAlign = "left";
  ctx.fillText(
    new Date().toLocaleDateString("id-ID"),
    12,
    footerY + 22,
  );
  ctx.textAlign = "right";
  ctx.fillText("SnapBooth Studio · Vol. 1", W - 12, footerY + 22);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
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

function drawPhotoPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  roundedRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.font = `${Math.round(Math.min(w, h) * 0.3)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("📷", x + w / 2, y + h / 2 + Math.round(Math.min(w, h) * 0.1));
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, curY);
      line = word + " ";
      curY += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line.trim(), x, curY);
}
