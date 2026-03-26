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

      {/* ── Dot grid — spatial depth reference ── */}
      <div
        className="bg-grid"
        style={{
          position: "absolute",
          inset: "-10%",
          opacity: isCanvas ? 0.50 : 0.22,
          transition: "opacity 1.4s ease",
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
          width: "74vw",
          height: "74vw",
          borderRadius: "50%",
          top: "-24vw",
          left: "-18vw",
          background:
            "radial-gradient(ellipse, rgba(30, 50, 200, 0.085) 0%, transparent 62%)",
          animation: "drift-a 42s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── Blob B — lower-right, violet ── */}
      <div
        style={{
          position: "absolute",
          width: "62vw",
          height: "62vw",
          borderRadius: "50%",
          bottom: "-14vw",
          right: "-14vw",
          background:
            "radial-gradient(ellipse, rgba(105, 45, 195, 0.075) 0%, transparent 62%)",
          animation: "drift-b 50s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── Blob C — mid, indigo wash ── */}
      <div
        style={{
          position: "absolute",
          width: "56vw",
          height: "56vw",
          borderRadius: "50%",
          top: "18vw",
          left: "28vw",
          background:
            "radial-gradient(ellipse, rgba(50, 50, 175, 0.055) 0%, transparent 62%)",
          animation: "drift-c 58s ease-in-out infinite",
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
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse, rgba(134, 137, 233, 0.068) 0%, transparent 60%)",
          opacity: isCanvas ? 1 : 0,
          transition: "opacity 1.4s ease",
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
