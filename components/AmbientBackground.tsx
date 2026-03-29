"use client";

interface Props {
  phase: string;
}

export default function AmbientBackground({ phase }: Props) {
  const isCanvas = phase === "canvas";
  const isHero   = phase === "hero";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* ── Base radial ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 90% at 50% 55%, rgba(12, 12, 26, 1) 0%, #06070c 100%)",
        }}
      />

      {/* ── Film grain — ultra-subtle texture to break digital flatness ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.028,
          mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── Dot grid — spatial depth reference ── */}
      <div
        className="bg-grid"
        style={{
          position: "absolute",
          inset: "-10%",
          opacity: isCanvas ? 0.36 : 0.16,
          transition: "opacity 1.8s ease",
        }}
      />

      {/* ── Grid vignette — fades grid at edges ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, var(--bg-void) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Blob A — upper-left, deep navy ── */}
      <div
        style={{
          position: "absolute",
          width: "82vw",
          height: "82vw",
          borderRadius: "50%",
          top: "-26vw",
          left: "-20vw",
          background:
            "radial-gradient(ellipse, rgba(30, 50, 200, 0.10) 0%, transparent 58%)",
          animation: "drift-a 48s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── Blob B — lower-right, violet ── */}
      <div
        style={{
          position: "absolute",
          width: "70vw",
          height: "70vw",
          borderRadius: "50%",
          bottom: "-18vw",
          right: "-16vw",
          background:
            "radial-gradient(ellipse, rgba(105, 45, 195, 0.09) 0%, transparent 58%)",
          animation: "drift-b 56s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── Blob C — mid, indigo wash ── */}
      <div
        style={{
          position: "absolute",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          top: "14vw",
          left: "24vw",
          background:
            "radial-gradient(ellipse, rgba(50, 50, 175, 0.065) 0%, transparent 58%)",
          animation: "drift-c 64s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── Blob D — warm accent, subtle amber bloom ── */}
      <div
        style={{
          position: "absolute",
          width: "48vw",
          height: "48vw",
          borderRadius: "50%",
          top: "55%",
          left: "10%",
          background:
            "radial-gradient(ellipse, rgba(180, 140, 60, 0.032) 0%, transparent 56%)",
          animation: "drift-a 72s ease-in-out infinite reverse",
          willChange: "transform",
        }}
      />

      {/* ── Hero center glow (subtle when on landing) ── */}
      <div
        style={{
          position: "absolute",
          width: "56vw",
          height: "36vw",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(134, 137, 233, 0.038) 0%, transparent 68%)",
          opacity: isHero ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      />

      {/* ── Canvas center glow ── */}
      <div
        style={{
          position: "absolute",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(134, 137, 233, 0.08) 0%, transparent 55%)",
          opacity: isCanvas ? 1 : 0,
          transition: "opacity 1.8s ease",
        }}
      />

      {/* ── Vignette ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0, 0, 0, 0.58) 100%)",
        }}
      />
    </div>
  );
}
