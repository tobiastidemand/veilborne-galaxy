"use client";

/**
 * Holographic HUD decorations — pure SVG, no state. Colour is inherited via
 * `currentColor`, so wrap in a `text-accent` element. Every piece is
 * decorative (`aria-hidden`) and never intercepts pointer events.
 */

const GLOW = "drop-shadow(0 0 3px currentColor)";

/** Chamfered L-bracket for a corner. `corner` picks which way it points. */
export function HudCorner({
  corner = "tl",
  size = 20,
  className = "",
}: {
  corner?: "tl" | "tr" | "bl" | "br";
  size?: number;
  className?: string;
}) {
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[corner];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{ transform: `rotate(${rot}deg)`, filter: GLOW }}
    >
      {/* outer chamfered bracket */}
      <path
        d="M1 19 V7 L7 1 H19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* small node at the chamfer */}
      <circle cx="7" cy="1" r="1.2" fill="currentColor" />
    </svg>
  );
}

/** A run of diagonal hash slashes — the "///" accent from HUD frames. */
export function HudSlashes({
  count = 4,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const w = count * 5 + 4;
  return (
    <svg
      width={w}
      height={10}
      viewBox={`0 0 ${w} 10`}
      fill="none"
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{ filter: GLOW }}
    >
      {Array.from({ length: count }, (_, i) => (
        <line
          key={i}
          x1={i * 5}
          y1={10}
          x2={i * 5 + 7}
          y2={0}
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/** Small targeting reticle — concentric arcs, ticks and a centre node. */
export function HudReticle({
  size = 52,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{ filter: GLOW }}
    >
      <circle cx="26" cy="26" r="9" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <circle
        cx="26"
        cy="26"
        r="16"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 5"
        opacity="0.45"
      />
      {/* sweeping arc */}
      <path
        d="M26 4 A22 22 0 0 1 48 26"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      {/* cross ticks */}
      <path d="M26 13 V18 M26 34 V39 M13 26 H18 M34 26 H39" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="26" cy="26" r="1.6" fill="currentColor" />
      <circle cx="48" cy="26" r="1.4" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

/**
 * Holographic left-edge frame for the right-hand side panels. Replaces the
 * old solid border with a glowing rail, chamfered corner brackets and a
 * mid-rail hash detail.
 */
export function PanelHudFrame() {
  // Chamfer must match `.panel-clip` (16px) so the glowing edge traces the cut.
  return (
    <div className="hud-pulse pointer-events-none absolute inset-0 z-[2] text-accent">
      {/* crisp vertical rail, split by a centre node — no outer glow */}
      <span
        className="absolute left-0"
        style={{
          top: 16,
          bottom: 16,
          width: 1,
          background:
            "linear-gradient(to bottom, var(--accent), var(--accent) 45%, transparent 47%, transparent 53%, var(--accent) 55%, var(--accent))",
        }}
      />
      {/* top-left chamfer */}
      <svg
        className="absolute left-0 top-0"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <line x1="0" y1="16" x2="16" y2="0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="16" cy="0" r="1.3" fill="currentColor" />
      </svg>
      {/* bottom-left chamfer */}
      <svg
        className="absolute bottom-0 left-0"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <line x1="0" y1="0" x2="16" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="16" cy="16" r="1.3" fill="currentColor" />
      </svg>
      {/* edge accents — fade out to the right (like the nav lines) */}
      <span
        className="absolute left-4 top-0 h-px w-16"
        style={{ background: "linear-gradient(to right, var(--accent), transparent)" }}
      />
      <span
        className="absolute bottom-0 left-4 h-px w-16"
        style={{ background: "linear-gradient(to right, var(--accent), transparent)" }}
      />
    </div>
  );
}
