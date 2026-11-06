import { BODY_CONTENT } from "@/lib/planet-content";
import { WALK_STOPS, WALK_TOTAL_LABEL } from "@/lib/planetData";
import { SITE } from "@/lib/constants";

const W = 1080;
const H = 1350;

/** Font stacks from next/font, read off <html> so the canvas matches the site. */
function fontStacks() {
  const root = getComputedStyle(document.documentElement);
  const serif =
    root.getPropertyValue("--font-instrument-serif").trim() || "Georgia, serif";
  const sans =
    root.getPropertyValue("--font-space-grotesk").trim() ||
    "system-ui, sans-serif";
  return { serif, sans };
}

/** Deterministic star field so every card looks the same. */
function stars(ctx: CanvasRenderingContext2D) {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 320; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = rand() < 0.08 ? 1.8 + rand() * 1.2 : 0.5 + rand() * 1.1;
    ctx.globalAlpha = 0.25 + rand() * 0.6;
    ctx.fillStyle = rand() < 0.15 ? "#cfe3ff" : "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Shrink the font until `text` fits `maxWidth`. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  build: (px: number) => string,
  start: number,
  maxWidth: number,
) {
  let px = start;
  ctx.font = build(px);
  while (ctx.measureText(text).width > maxWidth && px > 20) {
    px -= 2;
    ctx.font = build(px);
  }
  return px;
}

export type ShareCardInput = {
  /** e.g. "38:12" */
  time: string;
  stamped: number;
};

/** Draws the "I walked the solar system" card and returns it as a PNG. */
export async function renderShareCard({ time, stamped }: ShareCardInput): Promise<Blob> {
  const { serif, sans } = fontStacks();
  await Promise.all([
    document.fonts.load(`96px ${serif}`),
    document.fonts.load(`italic 96px ${serif}`),
    document.fonts.load(`500 28px ${sans}`),
  ]).catch(() => undefined);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Background: deep space with a warm glow where the Sun would be
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#070b1d");
  bg.addColorStop(1, "#02030a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.75);
  glow.addColorStop(0, "rgba(110,182,255,0.16)");
  glow.addColorStop(0.5, "rgba(240,192,106,0.05)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  stars(ctx);

  const left = 96;
  const right = W - 96;
  ctx.textBaseline = "alphabetic";

  // Eyebrow + wordmark
  ctx.fillStyle = "#6eb6ff";
  ctx.font = `500 26px ${sans}`;
  ctx.letterSpacing = "6px";
  ctx.fillText(SITE.campus.toUpperCase(), left, 150);
  ctx.letterSpacing = "0px";

  ctx.font = `88px ${serif}`;
  ctx.fillStyle = "#f5f7ff";
  ctx.fillText("Planet", left, 250);
  const pw = ctx.measureText("Planet ").width;
  ctx.font = `italic 88px ${serif}`;
  ctx.fillStyle = "#f0c06a";
  ctx.fillText("Walk", left + pw, 250);

  // Headline
  const line1 = `I walked ${WALK_TOTAL_LABEL.milesLabel.replace(" mi", " miles")}`;
  const line2 = "across the solar system.";
  const maxW = right - left;
  const px = Math.min(
    fitFont(ctx, line1, (n) => `${n}px ${serif}`, 124, maxW),
    fitFont(ctx, line2, (n) => `italic ${n}px ${serif}`, 124, maxW),
  );
  ctx.font = `${px}px ${serif}`;
  ctx.fillStyle = "#f5f7ff";
  ctx.fillText(line1, left, 500);
  ctx.font = `italic ${px}px ${serif}`;
  ctx.fillStyle = "#f0c06a";
  ctx.fillText(line2, left, 500 + px * 1.02);

  // Walk line: Sun → Pluto, every stop lit in its colour
  const ly = 800;
  const track = ctx.createLinearGradient(left, 0, right, 0);
  track.addColorStop(0, "#f0c06a");
  track.addColorStop(0.5, "#6eb6ff");
  track.addColorStop(1, "#a78bfa");
  ctx.strokeStyle = track;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(110,182,255,0.8)";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(left, ly);
  ctx.lineTo(right, ly);
  ctx.stroke();
  ctx.shadowBlur = 0;

  WALK_STOPS.forEach((stop, i) => {
    const x = left + (i / (WALK_STOPS.length - 1)) * (right - left);
    const color = BODY_CONTENT[stop.slug].color;
    const r = stop.slug === "sun" ? 19 : 14;
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    const g = ctx.createRadialGradient(x - r * 0.35, ly - r * 0.4, 0, x, ly, r);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.45, color);
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, ly, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  ctx.font = `500 26px ${sans}`;
  ctx.fillStyle = "#a1a9bc";
  ctx.textAlign = "left";
  ctx.fillText("Sun", left - 10, ly + 62);
  ctx.textAlign = "right";
  ctx.fillText("Pluto", right + 10, ly + 62);
  ctx.textAlign = "left";

  // Stats
  const stats: [string, string][] = [
    ["Time", time],
    ["Distance", WALK_TOTAL_LABEL.feetLabel],
    ["Stops", `${stamped}/${WALK_STOPS.length}`],
  ];
  const colW = (right - left) / 3;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, 960);
  ctx.lineTo(right, 960);
  ctx.stroke();
  stats.forEach(([label, value], i) => {
    const x = left + i * colW;
    ctx.fillStyle = "#a1a9bc";
    ctx.font = `500 26px ${sans}`;
    ctx.fillText(label, x, 1020);
    ctx.fillStyle = "#f5f7ff";
    fitFont(ctx, value, (n) => `${n}px ${serif}`, 84, colW - 24);
    ctx.fillText(value, x, 1110);
  });

  // Footer
  ctx.fillStyle = "#a1a9bc";
  ctx.font = `400 26px ${sans}`;
  ctx.fillText("From the Sun at the Planetarium to Pluto at the Observatory", left, 1236);
  ctx.fillStyle = "#6eb6ff";
  ctx.font = `500 26px ${sans}`;
  ctx.fillText(window.location.host, left, 1278);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}

/** Opens the phone's share sheet with the image, or downloads it. */
export async function shareOrDownload(blob: Blob) {
  const file = new File([blob], "planet-walk.png", { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: "Planet Walk",
        text: `I walked the solar system across ${SITE.campus}!`,
      });
      return "shared" as const;
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return "cancelled" as const;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "planet-walk.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded" as const;
}
